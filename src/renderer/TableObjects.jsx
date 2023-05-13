import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Table } from "antd";

function TableObjects() {
  const { bucket } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [objects, setObjects] = useState([]);
  window.electron.ipcRenderer.once("ipc-s3", (data) => {
    // eslint-disable-next-line no-console
    console.log("objects", data);
    setObjects([...data.contents, ...data.prefixes]);
    setLoading(false);
  });
  const handleListObjectsByBucket = (BucketName) => {
    window.electron.ipcRenderer.sendMessage("ipc-s3", [
      "list_objects",
      BucketName,
    ]);
  };

  useEffect(() => {
    handleListObjectsByBucket(bucket);
  }, [bucket]);

  const columns = [
    {
      title: "Name",
      dataIndex: "Key",
      render: (text, row) => (
        <Button type="link" onClick={() => handleListObjectsByBucket(text)}>
          {text || row?.Prefix}
        </Button>
      ),
    },
    // {
    //   title: "CreationDate",
    //   dataIndex: "CreationDate",
    //   render: (text) => <span>{text.toString()}</span>,
    // },
  ];
  return (
    <div style={{ padding: 10 }}>
      <Button onClick={() => navigate("/")}>Home</Button>
      <h1>Bucket: {bucket}</h1>
      <Table
        rowKey="Name"
        columns={columns}
        dataSource={objects}
        loading={loading}
        size="middle"
      />
    </div>
  );
}

export default TableObjects;
