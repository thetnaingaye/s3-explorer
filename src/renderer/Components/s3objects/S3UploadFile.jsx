import { UploadOutlined } from "@ant-design/icons";
import { Button, Card, message, Progress, Space, Upload } from "antd";
import { useState } from "react";

function S3UploadFile({ awsProfile, bucket, prefix, onUploadComplete }) {
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    setUploading(true);
    try {
      const payload = {
        awsProfile,
        bucket,
        prefix,
        filePaths: fileList.map((f) => f.path),
      };
      await window.electron.aws.s3.uploadFiles([payload]);
      setFileList([]);
      message.success("upload successfully.");
      onUploadComplete();
    } catch (err) {
      message.error("upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const props = {
    showUploadList: !uploading,
    multiple: true,
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      setFileList([...fileList, file]);
      return false;
    },
    fileList,
  };

  window.electron.ipcRenderer.on("upload-progress", (args) => {
    const e = args[0];
    const key = e.filePath;
    const perc = (e.progress.loaded / e.progress.total) * 100;
    fileList.forEach((file) => {
      if (file.name === e.filename) {
        file.percent = parseInt(perc, 10);
      }
    });
    setFileList([...fileList]);
  });
  return (
    <>
      <Upload {...props} disabled={uploading}>
        <Button icon={<UploadOutlined />} disabled={uploading}>
          Select File
        </Button>
      </Upload>
      <div
        style={{
          marginTop: 16,
        }}
      >
        <Button
          type="primary"
          onClick={handleUpload}
          disabled={fileList.length === 0}
          loading={uploading}
        >
          {uploading ? "Uploading" : "Start Upload"}
        </Button>
      </div>
      {uploading && (
        <>
          {fileList.map((file) => {
            return (
              <Card style={{ marginTop: 5 }} key={file.uid} size="small">
                <div style={{ textAlign: "left" }}>
                  <Space>
                    <UploadOutlined />
                    {file.name}
                  </Space>

                  <Progress percent={file.percent} />
                </div>
              </Card>
            );
          })}
        </>
      )}
    </>
  );
}

export default S3UploadFile;
