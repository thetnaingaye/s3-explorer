import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, Col, Row, Input, Button, Space, Divider, Avatar } from "antd";
import { BarsOutlined, GoldenFilled, StarFilled } from "@ant-design/icons";

const { Meta } = Card;

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
        // display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div>
        <Row gutter={[16, 16]}>
          <Col>
            {" "}
            <Card
              onClick={() => navigate("/buckets/user")}
              style={{ cursor: "pointer" }}
            >
              <Meta
                avatar={<StarFilled />}
                title="List Your Buckets"
                description="list of bucket names saved for easy access"
              />
            </Card>
          </Col>
          <Col>
            <Card
              onClick={() => navigate("/buckets")}
              style={{ cursor: "pointer" }}
            >
              <Meta
                avatar={<GoldenFilled />}
                title="List All Buckets"
                description="list of all buckets under current aws profile"
              />
            </Card>
          </Col>
        </Row>
        {/* <Input
          style={{ width: "70vw" }}
          onChange={(e) => setBucket(e.target.value)}
          prefix={<span style={{ color: "#ccc" }}>bucket name :</span>}
          suffix={<Button onClick={handleBucketGo}>Go</Button>}
        /> */}
      </div>
      {/* <div style={{ textAlign: "center", marginTop: 20 }}>
        <Link to="/buckets">List All Buckets</Link>
      </div>
      <div style={{ textAlign: "center", marginTop: 20 }}>
        <Link to="/buckets/user">List Your Buckets</Link>
      </div> */}
    </Card>
  );
}

export default Dashboard;
