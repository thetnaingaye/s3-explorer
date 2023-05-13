import { useState } from "react";
import { MemoryRouter as Router, Routes, Route } from "react-router-dom";
// import icon from '../../assets/icon.svg';
import "./App.css";
import { Button, Table } from "antd";

function Hello() {
  const [buckets, setBuckets] = useState([]);
  const [loading, setLoading] = useState(false);
  window.electron.ipcRenderer.once("ipc-example", (data) => {
    // eslint-disable-next-line no-console
    // setBuckets(arg?.split('\n'));
    setBuckets(data);
    setLoading(false);
  });

  window.electron.ipcRenderer.once("ipc-s3", (data) => {
    // eslint-disable-next-line no-console
    console.log(data);
  });

  const refreshBuckets = () => {
    setLoading(true);
    window.electron.ipcRenderer.sendMessage("ipc-example", "refersh-buckets");
  };

  const handleListObjectsByBucket = (bucket) => {
    window.electron.ipcRenderer.sendMessage("ipc-s3", ["list_objects", bucket]);
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "Name",
      render: (text) => (
        <Button type="link" onClick={() => handleListObjectsByBucket(text)}>
          {text}
        </Button>
      ),
    },
    {
      title: "CreationDate",
      dataIndex: "CreationDate",
      render: (text) => <span>{text.toString()}</span>,
    },
  ];
  return (
    <div style={{ padding: 10 }}>
      <h1>S3 Explorer (using aws-sdk and aws-cli)</h1>
      <h2>
        Buckets{" "}
        <Button type="primary" onClick={refreshBuckets}>
          Refresh
        </Button>
      </h2>{" "}
      <Table
        rowKey="Name"
        columns={columns}
        dataSource={buckets}
        loading={loading}
        size="middle"
      />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
