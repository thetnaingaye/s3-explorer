import { BrowserWindow, ipcMain } from "electron";
import AWS from "aws-sdk";
import {
  GetObjectCommand,
  ListBucketsCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
  // GetBucketLocationCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { loadSharedConfigFiles } from "@aws-sdk/shared-ini-file-loader";
import utils from "./utils/utils";
import DownloadQueue from "./utils/downloadQueue";
import { store } from "./store";

let mainWindow;
const downloadQueue = new DownloadQueue();

ipcMain.on("ipc-s3", async (event, arg) => {
  const [action, payload] = arg;
  switch (action) {
    case "download_object":
      downloadQueue.push({
        win: BrowserWindow.getFocusedWindow(),
        url: payload.presignedUrl,
        options: {
          // saveAs: true,
          directory: store.get("setting").download_path,
          openFolderWhenDone: true,
          onProgress: (progress) => {
            try {
              mainWindow.webContents.send(
                `download-progress-[${payload.Key}]`,
                [
                  {
                    filename: payload.filename,
                    progress,
                    presignedUrl: payload.presignedUrl,
                    Key: payload.Key,
                  },
                ]
              );
            } catch (error) {
              console.log("Download progress error", error);
            }
          },
        },
      });
      break;
    default:
      break;
  }
});

// const handleGetBucketRegion = async (e, args) => {
//   const [payload] = args;
//   const credentials = new AWS.SharedIniFileCredentials({
//     profile: payload.awsProfile,
//   });
//   const s3 = new S3Client({
//     credentials,
//   });
//   const cmdBucketLocation = new GetBucketLocationCommand({
//     Bucket: payload.bucket,
//   });
//   const { LocationConstraint } = await s3.send(cmdBucketLocation);
//   return LocationConstraint;
// };

const handleGetBucketRegion = async (e, args) => {
  const [payload] = args;
  const credentials = new AWS.SharedIniFileCredentials({
    profile: payload.awsProfile,
  });
  const s3V2 = new AWS.S3({
    credentials,
  });
  const requestObject = s3V2.headBucket({
    Bucket: payload.bucket,
  });
  let region;
  requestObject.on("httpHeaders", (statusCode, headers) => {
    region = headers["x-amz-bucket-region"];
  });
  await requestObject.promise();
  return {
    bucket: payload.bucket,
    region,
  };
};

// const handleListObjects = async (e, args) => {
//   const [payload] = args;
//   const credentials = new AWS.SharedIniFileCredentials({
//     profile: payload.awsProfile,
//   });
//   // let s3 = new S3Client({
//   //   credentials,
//   // });
//   // const cmdBucketLocation = new GetBucketLocationCommand({
//   //   Bucket: payload.bucket,
//   // });
//   // const { LocationConstraint } = await s3.send(cmdBucketLocation);
//   const { region } = await handleGetBucketRegion({}, args);
//   const s3 = new S3Client({
//     credentials,
//     region,
//   });
//   const command = new ListObjectsV2Command({
//     Bucket: payload.bucket,
//     Delimiter: "/",
//     Prefix: payload.prefix,
//   });
//   let isTruncated = true;

//   let contents = [];
//   let prefixes = [];

//   while (isTruncated) {
//     const { Contents, IsTruncated, NextContinuationToken, CommonPrefixes } =
//       await s3.send(command);
//     contents = contents.concat(Contents);
//     prefixes = prefixes.concat(CommonPrefixes);
//     isTruncated = IsTruncated;
//     command.input.ContinuationToken = NextContinuationToken;
//   }

//   return {
//     contents,
//     prefixes,
//   };
// };

const handleListObjectsV2 = async (e, args) => {
  const [payload] = args;
  const credentials = new AWS.SharedIniFileCredentials({
    profile: payload.awsProfile,
  });

  const { region } = await handleGetBucketRegion({}, args);
  const s3 = new S3Client({
    credentials,
    region,
  });

  const command = new ListObjectsV2Command({
    Bucket: payload.bucket,
    Delimiter: "/",
    Prefix: payload.userSearchPrefix
      ? payload.prefix + payload.userSearchPrefix
      : payload.prefix,
  });

  if (payload.ContinuationToken) {
    command.input.ContinuationToken = payload.ContinuationToken;
  }

  let contents = [];
  let prefixes = [];

  const { Contents, IsTruncated, NextContinuationToken, CommonPrefixes } =
    await s3.send(command);
  contents = contents.concat(Contents);
  prefixes = prefixes.concat(CommonPrefixes);
  command.input.ContinuationToken = NextContinuationToken;

  return {
    contents,
    prefixes,
    IsTruncated,
    NextContinuationToken,
  };
};

const handleGetObject = async (e, args) => {
  const [payload] = args;
  const credentials = new AWS.SharedIniFileCredentials({
    profile: payload.awsProfile,
  });
  const s3 = new S3Client({
    credentials,
  });

  const command = new GetObjectCommand({
    Bucket: payload.Bucket,
    Key: payload.Key,
  });
  const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
  return presignedUrl;
};

const handleListBuckets = async (e, args) => {
  const [payload] = args;
  const credentials = new AWS.SharedIniFileCredentials({
    profile: payload.awsProfile,
  });
  const s3 = new S3Client({
    credentials,
    region: "us-east-1", // https://stackoverflow.com/questions/52424624/list-buckets-s3api-is-not-showing-my-bucket-creation-date
  });

  const command = new ListBucketsCommand({});
  const { Buckets } = await s3.send(command);
  return Buckets;
};

const handleListProfiles = async () => {
  const profiles = await loadSharedConfigFiles();
  return profiles;
};

const handleUploadFiles = async (e, args) => {
  const [payload] = args;
  const filePaths = payload.filePaths;

  const credentials = new AWS.SharedIniFileCredentials({
    profile: payload.awsProfile,
  });

  const s3 = new AWS.S3({
    credentials,
  });

  for (const filePath of filePaths) {
    const file = utils.getFileData(filePath);
    const fileName = file.name;
    const objectKey = payload.prefix + fileName;

    // Use S3 ManagedUpload class as it supports multipart uploads
    const upload = new AWS.S3.ManagedUpload({
      service: s3,
      params: {
        credentials,
        Bucket: payload.bucket,
        Key: objectKey,
        Body: file.stream,
      },
    });
    upload.on("httpUploadProgress", (progress) => {
      mainWindow.webContents.send("upload-progress", [
        {
          filePath,
          filename: fileName,
          progress,
        },
      ]);
    });
    await upload.promise();
  }
};

const handleDeleteObject = async (e, args) => {
  const [payload] = args;
  const credentials = new AWS.SharedIniFileCredentials({
    profile: payload.awsProfile,
  });
  const s3 = new S3Client({
    credentials,
  });
  const command = new DeleteObjectCommand({
    Bucket: payload.Bucket,
    Key: payload.Key,
  });
  await s3.send(command);
};

const handleDeleteFolder = async (e, args) => {
  const [payload] = args;
  const credentials = new AWS.SharedIniFileCredentials({
    profile: payload.awsProfile,
  });
  const s3 = new S3Client({
    credentials,
  });
  const command = new DeleteObjectCommand({
    Bucket: payload.bucket,
    Key: payload.prefix,
  });
  await s3.send(command);
};

const handlePutObject = async (e, args) => {
  const [payload] = args;
  const credentials = new AWS.SharedIniFileCredentials({
    profile: payload.awsProfile,
  });
  const s3 = new S3Client({
    credentials,
  });

  const command = new PutObjectCommand({
    Bucket: payload.Bucket,
    Key: payload.Key,
  });
  await s3.send(command);
};

export default (window) => {
  mainWindow = window;
  ipcMain.handle("aws:s3:listObjects", handleListObjectsV2);
  ipcMain.handle("aws:s3:getObject", handleGetObject);
  ipcMain.handle("aws:s3:listBuckets", handleListBuckets);
  ipcMain.handle("aws:s3:getBucketRegion", handleGetBucketRegion);
  ipcMain.handle("aws:s3:uploadFiles", handleUploadFiles);
  ipcMain.handle("aws:s3:deleteObject", handleDeleteObject);
  ipcMain.handle("aws:s3:deleteFolder", handleDeleteFolder);
  ipcMain.handle("aws:s3:putObject", handlePutObject);
  ipcMain.handle("aws:profile:list", handleListProfiles);
};
