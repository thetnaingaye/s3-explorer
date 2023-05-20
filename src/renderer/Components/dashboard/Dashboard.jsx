import { useNavigate } from "react-router-dom";
import { Card, Col, Row } from "antd";
import { GoldenFilled, StarFilled } from "@ant-design/icons";

const { Meta } = Card;

function Dashboard() {
  const navigate = useNavigate();
  return (
    <Card
      bordered={false}
      style={{
        height: "68vh",
        boxShadow: "none",
      }}
    >
      <Row gutter={[16, 16]}>
        <Col>
          {" "}
          <Card
            onClick={() => navigate("/buckets/user")}
            style={{ cursor: "pointer" }}
          >
            <Meta
              avatar={<StarFilled />}
              title="Your Buckets"
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
              title="All Buckets"
              description="list of all buckets under current aws profile"
            />
          </Card>
        </Col>
      </Row>
    </Card>
  );
}

export default Dashboard;
