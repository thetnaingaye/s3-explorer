import { useNavigate } from "react-router-dom";
import { Card, Col, Row } from "antd";
import Icon, { StarFilled } from "@ant-design/icons";
import { ReactComponent as BucketIcon } from "../images/bucket.svg";

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
              title="My Buckets"
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
              // avatar={<GoldenFilled />}
              avatar={
                <Row gutter={2}>
                  <Col span={12}>
                    <Icon component={BucketIcon} style={{ fontSize: "110%" }} />
                  </Col>
                  <Col span={12}>
                    <Icon component={BucketIcon} style={{ fontSize: "70%" }} />
                  </Col>
                </Row>
              }
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
