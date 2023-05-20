import { ipcMain } from "electron";
import AWS from "aws-sdk";
import {
  GetObjectCommand,
  ListBucketsCommand,
  ListObjectsV2Command,
  S3Client,
  // GetBucketLocationCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { loadSharedConfigFiles } from "@aws-sdk/shared-ini-file-loader";

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

  let command;
  if (payload.userSearchPrefix) {
    command = new ListObjectsV2Command({
      Bucket: payload.bucket,
      Prefix: payload.prefix.substr(0) + payload.userSearchPrefix,
    });
  } else {
    command = new ListObjectsV2Command({
      Bucket: payload.bucket,
      Delimiter: "/",
      Prefix: payload.prefix,
    });
  }

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

export default () => {
  ipcMain.handle("aws:s3:listObjects", handleListObjectsV2);
  ipcMain.handle("aws:s3:getObject", handleGetObject);
  ipcMain.handle("aws:s3:listBuckets", handleListBuckets);
  ipcMain.handle("aws:s3:getBucketRegion", handleGetBucketRegion);
  ipcMain.handle("aws:profile:list", handleListProfiles);
};
