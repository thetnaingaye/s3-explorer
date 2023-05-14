import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Card, Table, Divider, message } from "antd";
import { HomeFilled, SyncOutlined } from "@ant-design/icons";
import getColumnSearchProps from "../common/getColumnSearchProps";

function BucketsTable() {
  const [messageApi, contextHolder] = message.useMessage();
  const [buckets, setBuckets] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const listBuckets = async () => {
    try {
      setLoading(true);
      const data = await window.electron.aws.s3.listBuckets();
      setBuckets(data);
      setLoading(false);
    } catch (error) {
      messageApi.error(error?.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    listBuckets();
  }, []);

  const columns = [
    {
      title: "Name",
      dataIndex: "Name",
      sorter: (a, b) => a.Name.localeCompare(b.Name),
      defaultSortOrder: "ascend",
      width: "50%",
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
      title: "Creation Date",
      dataIndex: "CreationDate",
      width: "50%",
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
