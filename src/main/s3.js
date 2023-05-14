import { ipcMain } from "electron";
import {
  GetObjectCommand,
  ListBucketsCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({});

const handleListObjects = async (e, args) => {
  const [payload] = args;
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
  const command = new GetObjectCommand({
    Bucket: payload.Bucket,
    Key: payload.Key,
  });
  const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
  return presignedUrl;
};

const handleListBuckets = async () => {
  const command = new ListBucketsCommand({});
  const { Buckets } = await s3.send(command);
  return Buckets;
};

export default () => {
  ipcMain.handle("aws:s3:listObjects", handleListObjects);
  ipcMain.handle("aws:s3:getObject", handleGetObject);
  ipcMain.handle("aws:s3:listBuckets", handleListBuckets);
};
