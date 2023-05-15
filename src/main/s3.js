import { ipcMain } from "electron";
import AWS from "aws-sdk";
import {
  GetObjectCommand,
  ListBucketsCommand,
  ListObjectsV2Command,
  S3Client,
  GetBucketLocationCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// import sharedIniFileLoader from "@aws-sdk/shared-ini-file-loader";
// const credentials = new AWS.SharedIniFileCredentials({ profile: "ldx_prod" });
// AWS.config.credentials = credentials;
// const s3 = new S3Client({
//   credentials
// });

const handleListObjects = async (e, args) => {
  const [payload] = args;
  const credentials = new AWS.SharedIniFileCredentials({
    profile: payload.awsProfile,
  });
  let s3 = new S3Client({
    credentials,
  });
  const cmdBucketLocation = new GetBucketLocationCommand({
    Bucket: payload.bucket,
  });
  const { LocationConstraint } = await s3.send(cmdBucketLocation);
  s3 = new S3Client({
    credentials,
    region: LocationConstraint,
  });
  const command = new ListObjectsV2Command({
    Bucket: payload.bucket,
    Delimiter: "/",
    Prefix: payload.prefix,
  });
  let isTruncated = true;

  let contents = [];
  let prefixes = [];

  while (isTruncated) {
    const { Contents, IsTruncated, NextContinuationToken, CommonPrefixes } =
      await s3.send(command);
    contents = contents.concat(Contents);
    prefixes = prefixes.concat(CommonPrefixes);
    isTruncated = IsTruncated;
    command.input.ContinuationToken = NextContinuationToken;
  }

  return {
    contents,
    prefixes,
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
  });

  const command = new ListBucketsCommand({});
  const { Buckets } = await s3.send(command);
  return Buckets;
};

const handleListProfiles = async (e, args) => {
  const sharedIniFileLoader = require("@aws-sdk/shared-ini-file-loader");
  const profiles = await sharedIniFileLoader.loadSharedConfigFiles();
  return profiles;
};

export default () => {
  ipcMain.handle("aws:s3:listObjects", handleListObjects);
  ipcMain.handle("aws:s3:getObject", handleGetObject);
  ipcMain.handle("aws:s3:listBuckets", handleListBuckets);
  ipcMain.handle("aws:profile:list", handleListProfiles);
};
