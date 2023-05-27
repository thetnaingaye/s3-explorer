import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Card, Table, Divider, message, Spin, Space } from "antd";
import Icon, {
  HomeFilled,
  LoadingOutlined,
  RollbackOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import getColumnSearchProps from "../common/getColumnSearchProps";
import { ReactComponent as BucketIcon } from "../images/bucket.svg";

function BucketsTable({ awsProfile }) {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [buckets, setBuckets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);

  const listBuckets = useCallback(async () => {
    const data = await window.electron.aws.s3.listBuckets([
      {
        awsProfile,
      },
    ]);
    return data;
  }, [awsProfile]);

  const getRegions = useCallback(
    async (data) => {
      const values = await Promise.allSettled(
        data.map((item) => {
          return window.electron.aws.s3.getBucketRegion([
            {
              awsProfile,
              bucket: item.Name,
            },
          ]);
        })
      );
      return values;
    },
    [awsProfile]
  );

  useEffect(() => {
    setRefresh(false);
    setLoading(true);
    listBuckets()
      .then((data) => {
        setBuckets(data);
        setLoading(false);
        return getRegions(data);
      })
      .then((data) => {
        const regionMap = {};
        data.forEach((v) => {
          regionMap[v.value.bucket] = v.value.region;
        });
        setBuckets((prevBuckets) =>
          prevBuckets.map((bucket) => {
            bucket.region = regionMap[bucket.Name];
            return bucket;
          })
        );
        return null;
      })
      .catch((error) => {
        messageApi.error(error?.message);
        setLoading(false);
      });
  }, [listBuckets, getRegions, messageApi, refresh]);

  const columns = [
    {
      title: "Name",
      dataIndex: "Name",
      sorter: (a, b) => a.Name.localeCompare(b.Name),
      defaultSortOrder: "ascend",
      width: "40%",
      ...getColumnSearchProps("Name"),
      render: (text) => (
        <Link
          to={{
            pathname: `/objects/${text}`,
          }}
        >
          {text}
        </Link>
      ),
    },
    {
      title: "Region",
      dataIndex: "region",
      width: "20%",
      sorter: (a, b) => a.region?.localeCompare(b.region),
      ...getColumnSearchProps("region"),
      render: (region) => {
        if (!region) {
          return (
            <Spin
              indicator={<LoadingOutlined style={{ fontSize: 10 }} spin />}
            />
          );
        }
        return region;
      },
    },
    {
      title: "Creation Date",
      dataIndex: "CreationDate",
      width: "40%",
      sorter: (a, b) => a.CreationDate - b.CreationDate,
      render: (text) => (
        <span style={{ color: "grey" }}>{text.toString()}</span>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <Card
        title={
          <Space>
            <Icon component={BucketIcon} style={{ color: "#333" }} />
            Buckets <span>{buckets.length && `(${buckets.length})`}</span>
          </Space>
        }
        extra={[
          <Button key="home" onClick={() => navigate("/")}>
            <HomeFilled />
            Home
          </Button>,
          <Divider key="d1" type="vertical" />,
          <Button key="back" onClick={() => navigate(-1)}>
            <RollbackOutlined />
            Back
          </Button>,
          <Divider key="d2" type="vertical" />,
          <Button onClick={() => setRefresh(true)} key="refresh">
            <SyncOutlined spin={loading} />
            Refresh
          </Button>,
        ]}
      >
        <Table
          rowKey="Name"
          columns={columns}
          dataSource={buckets}
          loading={loading}
          size="small"
        />
      </Card>
    </>
  );
}

export default BucketsTable;
