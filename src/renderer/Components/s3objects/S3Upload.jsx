import { InboxOutlined, MinusCircleFilled } from "@ant-design/icons";
import {
  Button,
  Col,
  Divider,
  List,
  message,
  Progress,
  Radio,
  Row,
  Upload,
} from "antd";
import { useEffect, useState } from "react";

const { Dragger } = Upload;

function S3Upload({ awsProfile, bucket, prefix, onUploadComplete }) {
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState("files");
  const [pageSize, setPageSize] = useState(10);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [currentUploadFile, setCurrentUploadFile] = useState("");

  const handleUpload = async () => {
    setUploading(true);
    try {
      const payload = {
        awsProfile,
        bucket,
        prefix,
        filePaths: fileList.map((f) => ({
          webkitRelativePath: f.webkitRelativePath,
          path: f.path,
        })),
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

  const handleRemoveFile = (uid) => {
    setFileList(fileList.filter((f) => f.uid !== uid));
  };

  const props = {
    disabled: uploading,
    // showUploadList: !uploading,
    showUploadList: false,
    multiple: true,
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      setFileList((prevFileList) => [...prevFileList, file]);
      return false;
    },
    fileList,
  };

  useEffect(() => {
    const unsubscribe = window.electron.ipcRenderer.on(
      "upload-progress",
      (args) => {
        const e = args[0];
        // const key = e.filePath;
        let perc;
        if (e.progress.total === 0) {
          perc = 100;
        } else perc = (e.progress.loaded / e.progress.total) * 100;
        if (perc === 100) {
          setUploadedCount((prevCount) => prevCount + 1);
        }

        fileList.forEach((file) => {
          if (file.name === e.filename) {
            file.percent = parseInt(perc, 10);
            setCurrentUploadFile(file);
          }
        });
        setFileList([...fileList]);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [fileList]);

  return (
    <>
      <div>
        <span>Select Upload Mode: </span>
        <Radio.Group
          value={uploadType}
          style={{ marginBottom: 5 }}
          onChange={(e) => setUploadType(e.target.value)}
        >
          <Radio.Button value="files">Upload Files</Radio.Button>
          <Radio.Button value="folder">Upload Folder</Radio.Button>
        </Radio.Group>
        <Dragger {...props} directory={uploadType === "folder"}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            Click or drag {uploadType} to this area to upload
          </p>
          {uploadType === "files" && (
            <p className="ant-upload-hint">
              Support for a single or bulk upload.
            </p>
          )}
        </Dragger>
      </div>
      <div
        style={{
          marginTop: 16,
          marginBottom: 16,
        }}
      >
        <Button
          type="link"
          onClick={() => setFileList([])}
          disabled={uploading}
        >
          Clear all
        </Button>
        <Button
          type="primary"
          onClick={handleUpload}
          disabled={fileList.length === 0}
          loading={uploading}
        >
          {uploading ? "Uploading" : "Start Upload"}
        </Button>
      </div>
      {fileList.length > 0 && (
        <List
          size="small"
          header={
            <div>
              Total: {uploadedCount} / {fileList.length}
              {uploading && (
                <>
                  <Divider type="vertical" />
                  <span style={{ color: "darkorange" }}>
                    current upload file: <em>{currentUploadFile.name}</em>
                  </span>
                </>
              )}
            </div>
          }
          bordered
          dataSource={fileList}
          pagination={{
            pageSize,
            onShowSizeChange: (current, size) => setPageSize(size),
          }}
          renderItem={(file) => (
            <List.Item key={file.uid}>
              <Row style={{ width: "100%" }}>
                <Col span={1}>
                  <Button
                    disabled={file.percent > 0}
                    onClick={() => handleRemoveFile(file.uid)}
                    icon={<MinusCircleFilled />}
                    size="small"
                    style={{ border: "none" }}
                  />
                </Col>
                <Col span={19}> {file.webkitRelativePath || file.name}</Col>
                <Col span={4}>
                  {file.percent ? (
                    <Progress percent={file.percent} size="small" />
                  ) : (
                    <em style={{ color: "#ccc", fontSize: "small" }}>
                      upload pending
                    </em>
                  )}
                </Col>
              </Row>
            </List.Item>
          )}
        />
      )}
    </>
  );
}

export default S3Upload;
