import { UploadOutlined } from "@ant-design/icons";
import { Button, message, Space, Upload } from "antd";
import { useState } from "react";

function S3UploadFile({ awsProfile, bucket, prefix, onUploadComplete }) {
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const handleUpload = async () => {
    const formData = new FormData();
    fileList.forEach((file) => {
      formData.append("files[]", file);
    });
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

    // You can use any AJAX library you like
    // fetch("https://www.mocky.io/v2/5cc8019d300000980a055e76", {
    //   method: "POST",
    //   body: formData,
    // })
    //   .then((res) => res.json())
    //   .then(() => {
    //     setFileList([]);
    //     message.success("upload successfully.");
    //   })
    //   .catch(() => {
    //     message.error("upload failed.");
    //   })
    //   .finally(() => {
    //     setUploading(false);
    //   });
  };

  const props = {
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
  return (
    <>
      <Upload {...props}>
        <Button icon={<UploadOutlined />}>Select File</Button>
      </Upload>
      <Button
        type="primary"
        onClick={handleUpload}
        disabled={fileList.length === 0}
        loading={uploading}
        style={{
          marginTop: 16,
        }}
      >
        {uploading ? "Uploading" : "Start Upload"}
      </Button>
    </>
  );
}

export default S3UploadFile;
