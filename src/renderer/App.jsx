import { useEffect, useState } from "react";
import { MemoryRouter as Router, Routes, Route, Link } from "react-router-dom";
// import icon from '../../assets/icon.svg';
import "./App.css";
import { Button, Card, Table } from "antd";
import TableObjects from "./TableObjects";

function Hello() {
  const [buckets, setBuckets] = useState([]);
  const [loading, setLoading] = useState(false);
  window.electron.ipcRenderer.once("ipc-example", (data) => {
    // eslint-disable-next-line no-console
    // setBuckets(arg?.split('\n'));
    setBuckets(data);
    setLoading(false);
  });
  const refreshBuckets = () => {
    setLoading(true);
    window.electron.ipcRenderer.sendMessage("ipc-example", "refersh-buckets");
  };

  useEffect(() => {
    refreshBuckets();
  }, []);

  // const handleListObjectsByBucket = (bucket) => {
  //   window.electron.ipcRenderer.sendMessage("ipc-s3", ["list_objects", bucket]);
  // };

  const columns = [
    {
      title: "Name",
      dataIndex: "Name",
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
        <Button onClick={refreshBuckets} key="refresh">
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
          <Route excat path="/" element={<Hello />} />
          <Route path="/objects/:bucket" element={<TableObjects />} />
        </Routes>
      </Router>
    </div>
  );
}
