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
  const [curPrefix, setCurrPrefix] = useState("");
  window.electron.ipcRenderer.once("ipc-s3", (data) => {
    // eslint-disable-next-line no-console
    console.log("objects", data);
    let { contents } = data;
    if (curPrefix) {
      contents = contents.filter((x) => x && x.Key !== curPrefix);
    }
    const mergeData = [...contents, ...data.prefixes];
    setObjects(mergeData.filter((x) => x));
    setLoading(false);
  });
  const handleListObjectsByBucket = (BucketName, Prefix = "") => {
    setCurrPrefix(Prefix);
    window.electron.ipcRenderer.sendMessage("ipc-s3", [
      "list_objects",
      {
        bucket: BucketName,
        prefix: Prefix,
      },
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
              <FolderFilled />
              <Button
                type="link"
                onClick={() => handleListObjectsByBucket(bucket, row?.Prefix)}
              >
                {row?.Prefix.replace(curPrefix, "")}
              </Button>
            </div>
          );
        }
        return (
          <div>
            <FileOutlined style={{ marginRight: 20 }} />
            {/* <span>{text.split("/").pop()}</span> */}
            <span>{text.replace(curPrefix, "")}</span>
          </div>
        );
      },
    },
    {
      title: "Storage Class",
      dataIndex: "StorageClass",
    },
    {
      title: "Action",
      fixed: "right",
      width: 135,
      render: (text, row) => {
        if (!row?.Key) return null;
        return (
          <Button
            onClick={() => getObject(row.Key)}
            size="small"
            disabled={row.StorageClass !== "STANDARD"}
          >
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
        rowKey={(record) => `${record.Key}_${record.Prefix}`}
        columns={columns}
        dataSource={objects}
        loading={loading}
        size="small"
      />
    </Card>
  );
}

export default TableObjects;
