import { useEffect, useState } from "react";
import { MemoryRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import { Button, Card, Table } from "antd";
import { SyncOutlined } from "@ant-design/icons";
import TableObjects from "./TableObjects";
import getColumnSearchProps from "./getColumnSearchProps";

function Main() {
  const [buckets, setBuckets] = useState([]);
  const [loading, setLoading] = useState(false);

  const listBuckets = async () => {
    setLoading(true);
    const data = await window.electron.aws.s3.listBuckets();
    setBuckets(data);
    setLoading(false);
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
    <Card
      title={
        <span>
          Buckets <span>{buckets.length && `(${buckets.length})`}</span>
        </span>
      }
      extra={[
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
  );
}

export default function App() {
  return (
    <div>
      <div
        style={{
          padding: 20,
          borderBottom: "5px solid orange",
          color: "#333",
          fontSize: "125%",
          fontWeight: 300,
          letterSpacing: 1.1,
          backgroundColor: "#f0f0f0",
        }}
      >
        <strong>AWS S3 Explorer </strong>
        <span style={{ fontSize: "50%", letterSpacing: 1 }}>
          with aws-sdk and aws-cli
        </span>
      </div>
      <Router>
        <Routes>
          <Route excat path="/" element={<Main />} />
          <Route path="/objects/:bucket/:prefix?" element={<TableObjects />} />
        </Routes>
      </Router>
    </div>
  );
}
