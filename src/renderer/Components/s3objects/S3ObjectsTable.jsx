import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Card,
  Divider,
  Progress,
  Table,
  message,
  notification,
  Space
} from "antd";
import {
  DownloadOutlined,
  FileOutlined,
  FolderFilled,
  HomeFilled,
  SyncOutlined,
} from "@ant-design/icons";
import prettyBytes from "pretty-bytes";
import S3Breadcrumb from "./S3Breadcrumb";
import getColumnSearchProps from "../common/getColumnSearchProps";

function S3ObjectsTable() {
  const [messageApi, contextHolder] = message.useMessage();
  const [notifApi, notifContextHolder] = notification.useNotification();

  const { bucket } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [objects, setObjects] = useState([]);
  const [curPrefix, setCurrPrefix] = useState("");

  const handleListObjectsByBucket = async (BucketName, Prefix = "") => {
    setLoading(true);
    setCurrPrefix(Prefix);
    try {
      const data = await window.electron.aws.s3.listObjects([
        {
          bucket: BucketName,
          prefix: Prefix,
        },
      ]);
      let { contents } = data;
      if (Prefix) {
        contents = contents.filter((x) => x && x.Key !== Prefix);
      }
      let mergeData = [...contents, ...data.prefixes];
      mergeData = mergeData.filter((x) => x);
      mergeData.forEach((item) => {
        item.Name = item.Key || item.Prefix;
      });
      setObjects(mergeData);
      setLoading(false);
    } catch (error) {
      messageApi.error(error?.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    handleListObjectsByBucket(bucket);
  }, [bucket]);

  window.electron.ipcRenderer.on("download-progress", (args) => {
    const perc = args[0].progress.percent * 100;
    notifApi.open({
      closeIcon: null,
      key: args[0].presignedUrl,
      message: (
        <Space>
          <DownloadOutlined />
          {args[0].filename}
        </Space>
      ),
      description: <Progress percent={perc.toFixed(0)} />,
    });
  });

  const getObject = async (key) => {
    const presignedUrl = await window.electron.aws.s3.getObject([
      {
        Bucket: bucket,
        Key: key,
      },
    ]);

    window.electron.ipcRenderer.sendMessage("ipc-s3", [
      "download_object",
      {
        presignedUrl,
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
      sorter: (a, b) => a.LastModified - b.LastModified,
      width: 480,
      render: (date) => (
        <span style={{ color: "#888" }}>{date?.toString()}</span>
      ),
    },
    {
      title: "Size",
      dataIndex: "Size",
      width: 100,
      sorter: (a, b) => a.Size - b.Size,
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
    <>
      {contextHolder}
      {notifContextHolder}
      <Card
        title={bucket}
        extra={[
          <Button key="home" onClick={() => navigate("/")}>
            <HomeFilled />
            Home
          </Button>,
          <Divider key="d1" type="vertical" />,
          <Button key="all-buckets" onClick={() => navigate("/buckets")}>
            All Buckets
          </Button>,
          <Divider key="d2" type="vertical" />,
          <Button
            key="refresh"
            onClick={() => handleListObjectsByBucket(bucket, curPrefix)}
          >
            <SyncOutlined spin={loading} />
            Refresh
          </Button>,
        ]}
      >
        <S3Breadcrumb
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
    </>
  );
}

export default S3ObjectsTable;
