import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Card, Table, Divider, message, Spin } from "antd";
import { HomeFilled, LoadingOutlined, SyncOutlined } from "@ant-design/icons";
import getColumnSearchProps from "../common/getColumnSearchProps";

function BucketsTable({ awsProfile }) {
  const [messageApi, contextHolder] = message.useMessage();
  const [buckets, setBuckets] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const listBuckets = async () => {
    try {
      setLoading(true);
      const data = await window.electron.aws.s3.listBuckets([
        {
          awsProfile,
        },
      ]);
      setBuckets(data);
      setLoading(false);
      return data;
    } catch (error) {
      messageApi.error(error?.message);
      setLoading(false);
      return [];
    }
  };

  const getRegions = async (data) => {
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
    const regionMap = {};
    values.forEach((v) => {
      regionMap[v.value.bucket] = v.value.region;
    });
    const newBuckets = data.map((bucket) => {
      bucket.region = regionMap[bucket.Name];
      return bucket;
    });
    setBuckets([...newBuckets]);
  };

  useEffect(() => {
    listBuckets()
      .then((data) => {
        getRegions(data);
        return null;
      })
      .catch(() => {
        message.error("failed to get buckets");
      });
  }, []);

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
          <span>
            Buckets <span>{buckets.length && `(${buckets.length})`}</span>
          </span>
        }
        extra={[
          <Button key="home" onClick={() => navigate("/")}>
            <HomeFilled />
            Home
          </Button>,
          <Divider key="d1" type="vertical" />,
          <Button onClick={listBuckets} key="refresh">
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
