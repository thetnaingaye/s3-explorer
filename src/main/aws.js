import { ipcMain } from "electron";
import url from "url";
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
import { download } from "electron-dl";
import utils from "./utils/utils";
import { store } from "./store";

let mainWindow;

const setUpDownloadListener = () => {
  const donloadListener = (e, item, webContents) => {
    // console.log("item", item)
    item.on("updated", () => {
      const s3Key = decodeURI(url.parse(item.getURL()).pathname.substring(1));
      const downloadProgress = {
        progress: {
          percent: item.getReceivedBytes() / item.getTotalBytes(),
        },
        Key: s3Key,
      };
      webContents.send(`download-progress-[${s3Key}]`, [downloadProgress]);
    });
  };
  mainWindow.webContents.session.on("will-download", donloadListener);
};

ipcMain.on("ipc-s3", async (event, arg) => {
  const [action, payload] = arg;
  switch (action) {
    case "download_object":
      download(mainWindow, payload.presignedUrl, {
        // saveAs: true,
        directory: store.get("setting").download_path,
        openFolderWhenDone: true,
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
const getCredentials = (profile) => {
  if (store.get("setting").useCliCredentials === "Y") {
    return new AWS.SharedIniFileCredentials({
      profile,
    });
  }
  return store.get("awsCredentials").find((item) => item.profile === profile);
};

const handleGetBucketRegion = async (e, args) => {
  const [payload] = args;
  const credentials = getCredentials(payload.awsProfile);
  const s3V2 = new AWS.S3({
    credentials,
  });
  const requestObject = s3V2.headBucket({
    Bucket: payload.bucket || payload.Bucket,
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
  const credentials = getCredentials(payload.awsProfile);
  const s3 = new S3Client({
    credentials,
    region: payload.bucketRegion,
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

const handleGetObjectPresignedUrl = async (e, args) => {
  const [payload] = args;
  const credentials = getCredentials(payload.awsProfile);
  const s3 = new S3Client({
    credentials,
    region: payload.bucketRegion,
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
  if (!payload.awsProfile) {
    throw new Error("invalid aws profile");
  }
  const credentials = getCredentials(payload.awsProfile);
  const s3 = new S3Client({
    credentials,
    region: "us-east-1", // https://stackoverflow.com/questions/52424624/list-buckets-s3api-is-not-showing-my-bucket-creation-date
  });

  const command = new ListBucketsCommand({});
  const { Buckets } = await s3.send(command);
  return Buckets;
};

const handleUploadFiles = async (e, args) => {
  const [payload] = args;
  const filePaths = payload.filePaths;

  const credentials = getCredentials(payload.awsProfile);
  const s3 = new AWS.S3({
    credentials,
  });

  for (const filePath of filePaths) {
    const file = utils.getFileData(filePath.path);
    const fileName = file.name;
    let objectKey;
    if (filePath.webkitRelativePath) {
      objectKey = payload.prefix + filePath.webkitRelativePath;
    } else {
      objectKey = payload.prefix + fileName;
    }

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
  const credentials = getCredentials(payload.awsProfile);
  const s3 = new S3Client({
    credentials,
    region: payload.bucketRegion,
  });
  const command = new DeleteObjectCommand({
    Bucket: payload.Bucket,
    Key: payload.Key,
  });
  await s3.send(command);
};

const handleDeleteFolder = async (e, args) => {
  const [payload] = args;
  const credentials = getCredentials(payload.awsProfile);
  const s3 = new S3Client({
    credentials,
    region: payload.bucketRegion,
  });
  const command = new DeleteObjectCommand({
    Bucket: payload.bucket,
    Key: payload.prefix,
  });
  await s3.send(command);
};

const handlePutObject = async (e, args) => {
  const [payload] = args;
  const credentials = getCredentials(payload.awsProfile);
  const s3 = new S3Client({
    credentials,
    region: payload.bucketRegion,
  });

  const command = new PutObjectCommand({
    Bucket: payload.Bucket,
    Key: payload.Key,
  });
  await s3.send(command);
};

const handleListProfiles = async () => {
  if (store.get("setting").useCliCredentials === "Y") {
    const profiles = await loadSharedConfigFiles();
    return Object.keys(profiles.configFile);
  }
  return store.get("awsProfileNames");
};

const handleAddProfile = async (e, args) => {
  const newProfile = args[0];
  const awsCredentials = store.get("awsCredentials", []);
  if (awsCredentials.find((item) => item.profile === newProfile.profile)) {
    throw new Error("Aws Profile name is already exist.");
  }
  const newCrendentials = [...awsCredentials, newProfile];
  store.set("awsCredentials", newCrendentials);
  store.set(
    "awsProfileNames",
    newCrendentials.map((item) => item.profile)
  );
};

const handleUpdateProfile = async (e, args) => {
  const updatedProfile = args[0];
  const awsCredentials = store.get("awsCredentials", []);
  for (const cred of awsCredentials) {
    if (cred.profile === updatedProfile.profile) {
      Object.assign(cred, updatedProfile);
    }
  }
  store.set("awsCredentials", awsCredentials);
};

const handleDeleteProfile = async (e, args) => {
  const profileName = args[0];
  const awsCredentials = store.get("awsCredentials", []);
  const newCrendentials = awsCredentials.filter(
    (item) => item.profile !== profileName
  );
  store.set("awsCredentials", newCrendentials);
  store.set(
    "awsProfileNames",
    newCrendentials.map((item) => item.profile)
  );

  // also remove bucket names belonged to deleted profile
  const userSavedBuckets = store.get("buckets", []);
  store.set(
    "buckets",
    userSavedBuckets.filter((item) => item.AwsProfile !== profileName)
  );
};

const handleGetProfile = async (e, args) => {
  const profileName = args[0];
  return store
    .get("awsCredentials")
    .find((cred) => cred.profile === profileName);
};

export default (window) => {
  mainWindow = window;
  setUpDownloadListener();

  ipcMain.handle("aws:s3:listObjects", handleListObjectsV2);
  ipcMain.handle("aws:s3:getObjectPresignedUrl", handleGetObjectPresignedUrl);
  ipcMain.handle("aws:s3:listBuckets", handleListBuckets);
  ipcMain.handle("aws:s3:getBucketRegion", handleGetBucketRegion);
  ipcMain.handle("aws:s3:uploadFiles", handleUploadFiles);
  ipcMain.handle("aws:s3:deleteObject", handleDeleteObject);
  ipcMain.handle("aws:s3:deleteFolder", handleDeleteFolder);
  ipcMain.handle("aws:s3:putObject", handlePutObject);
  ipcMain.handle("aws:profile:list", handleListProfiles);
  ipcMain.handle("aws:profile:add", handleAddProfile);
  ipcMain.handle("aws:profile:update", handleUpdateProfile);
  ipcMain.handle("aws:profile:get", handleGetProfile);
  ipcMain.handle("aws:profile:delete", handleDeleteProfile);
};
