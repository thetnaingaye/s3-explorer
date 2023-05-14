import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, Divider, Table } from "antd";
import {
  DownloadOutlined,
  FileOutlined,
  FolderFilled,
  HomeFilled,
  SyncOutlined,
} from "@ant-design/icons";
import prettyBytes from "pretty-bytes";
import BreadcrumbKey from "./BreadcrumbKey";
import getColumnSearchProps from "./getColumnSearchProps";

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
    let mergeData = [...contents, ...data.prefixes];
    mergeData = mergeData.filter((x) => x);
    mergeData.forEach((item) => {
      item.Name = item.Key || item.Prefix;
    });
    setObjects(mergeData);
    setLoading(false);
  });

  const handleListObjectsByBucket = (BucketName, Prefix = "") => {
    setLoading(true);
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
      dataIndex: "Name",
      width: 600,
      sorter: (a, b) => {
        const aKey = a.Key || a.Prefix;
        const bKey = b.Key || b.Prefix;
        return aKey.localeCompare(bKey);
      },
      defaultSortOrder: "ascend",
      ...getColumnSearchProps("Name"),
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
            <FileOutlined />
            <span type="link" style={{ padding: "4px 15px" }}>
              {text.replace(curPrefix, "")}
            </span>
          </div>
        );
      },
    },
    {
      title: "Last Modified",
      dataIndex: "LastModified",
      width: 480,
      render: (date) => (
        <span style={{ color: "#888" }}>{date?.toString()}</span>
      ),
    },
    {
      title: "Size",
      dataIndex: "Size",
      width: 100,
      render: (size) => {
        if (!size) return null;
        return (
          <span style={{ color: "#888" }}>{prettyBytes(parseFloat(size))}</span>
        );
      },
    },
    {
      title: "Storage Class",
      dataIndex: "StorageClass",
      width: 100,
      render: (text) => <span style={{ color: "#888" }}>{text}</span>,
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
        <Divider key="d1" type="vertical" />,
        <Button
          key="refresh"
          onClick={() => handleListObjectsByBucket(bucket, curPrefix)}
        >
          <SyncOutlined spin={loading} />
          Refresh
        </Button>,
      ]}
    >
      <BreadcrumbKey
        bucket={bucket}
        s3Prefix={curPrefix}
        onChange={(prefix) => handleListObjectsByBucket(bucket, prefix)}
      />

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
