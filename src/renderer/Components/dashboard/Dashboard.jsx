import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, Col, Row, Input, Button, Space, Divider } from "antd";
function Dashboard() {
  const [bucket, setBucket] = useState("");
  const navigate = useNavigate();
  const handleBucketGo = () => {
    if (!bucket?.trim()) return;
    navigate(`/objects/${bucket.trim()}`);
  };
  return (
    <Card
      bordered={false}
      style={{
        height: "68vh",
        boxShadow: "none",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div>
        <Input
          style={{ width: "70vw" }}
          onChange={(e) => setBucket(e.target.value)}
          prefix={<span style={{ color: "#ccc" }}>bucket name :</span>}
          suffix={<Button onClick={handleBucketGo}>Go</Button>}
        />
      </div>
      <div style={{ textAlign: "center", marginTop: 20 }}>
        <Link to="/buckets">List All Buckets</Link>
      </div>
    </Card>
  );
}

export default Dashboard;
