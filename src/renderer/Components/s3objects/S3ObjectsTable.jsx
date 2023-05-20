import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Button, Card, Divider, Input, Table, message } from "antd";
import {
  DownloadOutlined,
  FileOutlined,
  FolderFilled,
  HomeFilled,
  SyncOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import prettyBytes from "pretty-bytes";
import S3Breadcrumb from "./S3Breadcrumb";
import getColumnSearchProps from "../common/getColumnSearchProps";

function S3ObjectsTable({ awsProfile }) {
  const [messageApi, contextHolder] = message.useMessage();
  const { bucket } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [objects, setObjects] = useState([]);
  const [curPrefix, setCurrPrefix] = useState("");
  const [isTruncated, setIsTruncated] = useState(false);
  const [continuationToken, setContinuationToken] = useState("");
  const [searchPrefixMap, setSearchPrefixMap] = useState({});

  const handleListObjectsByBucket = async (
    Prefix = "",
    searchPrefix = "",
    continueToken = ""
  ) => {
    setLoading(true);
    setCurrPrefix(Prefix);
    try {
      const payload = {
        bucket,
        prefix: searchPrefix ? `${Prefix}${searchPrefix}` : Prefix,
        awsProfile,
      };
      if (continuationToken) {
        payload.ContinuationToken = continueToken;
      }
      const data = await window.electron.aws.s3.listObjects([payload]);
      const { contents, IsTruncated, NextContinuationToken } = data;
      let normalisedContents = contents;
      if (Prefix) {
        normalisedContents = contents.filter((x) => x && x.Key !== Prefix);
      }
      let mergeData = [...normalisedContents, ...data.prefixes];
      mergeData = mergeData.filter((x) => x);
      mergeData.forEach((item) => {
        item.Name = item.Key || item.Prefix;
      });
      if (continueToken) {
        setObjects([...objects, ...mergeData]);
      } else {
        setObjects(mergeData);
      }
      setIsTruncated(IsTruncated);
      setContinuationToken(NextContinuationToken);
      setLoading(false);
    } catch (error) {
      messageApi.error(error?.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    handleListObjectsByBucket();
  }, [bucket]);

  const getObject = async (key) => {
    const presignedUrl = await window.electron.aws.s3.getObject([
      {
        Bucket: bucket,
        Key: key,
        awsProfile,
      },
    ]);

    window.electron.ipcRenderer.sendMessage("ipc-s3", [
      "download_object",
      {
        filename: key.split("/").pop(),
        presignedUrl,
      },
    ]);
  };

  let columns = [
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
              <span
                style={{
                  cursor: "pointer",
                  padding: "4px 15px",
                  color: "#1890ff",
                }}
                onClick={() => {
                  setObjects([]);
                  handleListObjectsByBucket(
                    row?.Prefix,
                    searchPrefixMap[row?.Prefix]
                  );
                }}
                onKeyDown={() => {}}
              >
                {row?.Prefix.replace(
                  curPrefix.replace(searchPrefixMap[row?.Prefix], ""),
                  ""
                )}
              </span>
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

  if (isTruncated) {
    columns = columns.map((col) => {
      delete col.defaultSortOrder;
      delete col.sorter;
      delete col.filterDropdown;
      return col;
    });
  }

  const handleRefresh = () => {
    setObjects([]);
    handleListObjectsByBucket(curPrefix, searchPrefixMap[curPrefix]);
  };

  const handlePrefixInputChange = (e) => {
    const searchPrefix = e.target.value;
    setSearchPrefixMap({
      ...searchPrefixMap,
      [curPrefix]: searchPrefix,
    });
    if (!searchPrefix) {
      handleListObjectsByBucket(curPrefix);
    }
  };

  return (
    <>
      {contextHolder}
      <Card
        title={bucket}
        extra={[
          <Button key="home" onClick={() => navigate("/")}>
            <HomeFilled />
            Home
          </Button>,
          <Divider key="d1" type="vertical" />,
          <Button key="all-buckets" onClick={() => navigate(-1)}>
            <RollbackOutlined />
            Back
          </Button>,
          <Divider key="d2" type="vertical" />,
          <Button key="refresh" onClick={handleRefresh}>
            <SyncOutlined spin={loading} />
            Refresh
          </Button>,
        ]}
      >
        <S3Breadcrumb
          bucket={bucket}
          s3Prefix={curPrefix}
          onChange={(prefix) => {
            setObjects([]);
            handleListObjectsByBucket(prefix, searchPrefixMap[prefix]);
          }}
        />
        {isTruncated && (
          <Alert
            message="There are still objects remaining, click Retrive More. Sort and Search are disabled due to more than 999+ objects."
            type="info"
            showIcon
            action={
              <Button
                onClick={() =>
                  handleListObjectsByBucket(
                    curPrefix,
                    searchPrefixMap[curPrefix],
                    continuationToken
                  )
                }
              >
                Retrive More
              </Button>
            }
          />
        )}
        <Input
          allowClear
          value={searchPrefixMap[curPrefix]}
          onChange={handlePrefixInputChange}
          style={{ width: 500, marginTop: 5, marginBottom: 5 }}
          placeholder="Find objects by prefix:"
          onPressEnter={() => {
            setObjects([]);
            handleListObjectsByBucket(curPrefix, searchPrefixMap[curPrefix]);
          }}
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
