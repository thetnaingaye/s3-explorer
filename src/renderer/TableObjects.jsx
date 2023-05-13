import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, Table } from "antd";
import {
  DownloadOutlined,
  FileOutlined,
  FolderFilled,
  HomeFilled,
} from "@ant-design/icons";

function TableObjects() {
  const { bucket } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [objects, setObjects] = useState([]);
  window.electron.ipcRenderer.once("ipc-s3", (data) => {
    // eslint-disable-next-line no-console
    console.log("objects", data);
    const mergeData = [...data.contents, ...data.prefixes];
    setObjects(mergeData.filter((x) => x));
    setLoading(false);
  });
  const handleListObjectsByBucket = (BucketName) => {
    window.electron.ipcRenderer.sendMessage("ipc-s3", [
      "list_objects",
      BucketName,
    ]);
  };

  useEffect(() => {
    handleListObjectsByBucket(bucket);
  }, [bucket]);
  const getObject = (key) => {
    window.electron.ipcRenderer.sendMessage("ipc-s3", [
      "get_object",
      {
        Bucket: bucket,
        Key: key,
      },
    ]);
  };
  const columns = [
    {
      title: "Name",
      dataIndex: "Key",
      render: (text, row) => {
        if (row?.Prefix) {
          return (
            <div>
              <FolderFilled style={{ fontSize: "125%" }} />
              <Button type="link">{row?.Prefix}</Button>
            </div>
          );
        }
        return (
          <div>
            <FileOutlined />
            <span style={{ marginLeft: 20 }}>{text}</span>
          </div>
        );
      },
    },
    {
      title: "Action",
      render: (text, row) => {
        if (!row?.Key) return null;
        return (
          <Button onClick={() => getObject(row.Key)} size="small">
            <DownloadOutlined />
            download
          </Button>
        );
      },
    },
  ];
  return (
    <Card
      title={bucket}
      extra={[
        <Button key="home" onClick={() => navigate("/")}>
          <HomeFilled />
          Home
        </Button>,
      ]}
    >
      <Table
        rowKey="Name"
        columns={columns}
        dataSource={objects}
        loading={loading}
        size="small"
      />
    </Card>
  );
}

export default TableObjects;
