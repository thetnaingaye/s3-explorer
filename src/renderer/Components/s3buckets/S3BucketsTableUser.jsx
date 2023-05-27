import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Divider,
  message,
  Space,
  Input,
  Select,
  List,
  Tooltip,
  Col,
  Row,
} from "antd";
import Icon, {
  HomeFilled,
  MinusCircleOutlined,
  RollbackOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { ReactComponent as BucketIcon } from "../images/bucket.svg";

function BucketsTable({ awsProfile, onProfileChange }) {
  const [messageApi, contextHolder] = message.useMessage();
  const [buckets, setBuckets] = useState([]);
  const [bucketsByProfile, setBucketsByProfile] = useState({});
  const [loading, setLoading] = useState(false);
  const [newBucketName, setNewBucketName] = useState("");
  const navigate = useNavigate();

  const listBuckets = async () => {
    try {
      setLoading(true);
      let data = await window.electron.electronStore.get(["buckets"]);
      if (!data) {
        data = [];
      }
      const bucketsGroup = {};
      data.forEach((bucket) => {
        if (bucketsGroup[bucket.AwsProfile]) {
          bucketsGroup[bucket.AwsProfile].push(bucket);
        } else {
          bucketsGroup[bucket.AwsProfile] = [bucket];
        }
      });
      setBucketsByProfile(bucketsGroup);
      setBuckets(data);
      setLoading(false);
      return data;
    } catch (error) {
      messageApi.error(error?.message);
      setLoading(false);
      return [];
    }
  };

  const saveNewBucket = async () => {
    setLoading(true);

    for (const bucket of buckets) {
      if (bucket.Name === newBucketName && bucket.AwsProfile === awsProfile) {
        message.error("bucket is already in your list.");
        setLoading(false);
        return;
      }
    }

    const newBuckets = [
      ...buckets,
      { Name: newBucketName, AwsProfile: awsProfile },
    ];
    await window.electron.electronStore.set(["buckets", newBuckets]);
    message.success("bucket is added to your list successfully.");
    listBuckets();
  };

  const handleDeleteBucket = async (name) => {
    setLoading(true);
    const newBuckets = buckets.filter((bucket) => bucket.Name !== name);
    await window.electron.electronStore.set(["buckets", newBuckets]);
    listBuckets();
  };

  useEffect(() => {
    listBuckets();
  }, []);

  return (
    <>
      {contextHolder}
      <Card
        bordered={false}
        style={{ boxShadow: "none" }}
        title={
          <span>
            Buckets{" "}
            <span>
              {bucketsByProfile[awsProfile]?.length &&
                `(${bucketsByProfile[awsProfile]?.length})`}
            </span>
          </span>
        }
        extra={[
          <Button key="home" onClick={() => navigate("/")}>
            <HomeFilled />
            Home
          </Button>,
          <Divider key="d1" type="vertical" />,
          <Button key="back" onClick={() => navigate(-1)}>
            <RollbackOutlined />
            Back
          </Button>,
          <Divider key="d2" type="vertical" />,
          <Button onClick={listBuckets} key="refresh">
            <SyncOutlined spin={loading} />
            Refresh
          </Button>,
        ]}
      >
        <Card size="small" bordered={false} style={{ background: "#fafafa" }}>
          <Space direction="horizontal">
            <Input
              style={{ width: 350 }}
              onChange={(e) => setNewBucketName(e.target.value)}
              placeholder="enter bucket name"
            />
            <Button
              onClick={saveNewBucket}
              disabled={!(newBucketName && awsProfile)}
            >
              + Add to your list
            </Button>
          </Space>
        </Card>
        <Row gutter={[16, 16]} style={{ marginTop: 15 }}>
          <Col xs={{ span: 24 }} lg={{ span: 12 }} key={awsProfile}>
            <Card
              title={<span>{awsProfile}</span>}
              key={awsProfile}
              size="small"
            >
              <List
                bordered
                dataSource={bucketsByProfile[awsProfile]}
                renderItem={(bucket) => (
                  <List.Item
                    actions={[
                      <Tooltip key="remove" title="remove from your list">
                        <MinusCircleOutlined
                          onClick={() => handleDeleteBucket(bucket.Name)}
                          size="small"
                        />
                      </Tooltip>,
                    ]}
                  >
                    <span
                      style={{ cursor: "pointer", color: "#1890ff" }}
                      onKeyDown={() => {}}
                      onClick={() => {
                        onProfileChange(bucket.AwsProfile);
                        navigate(`/objects/${bucket.Name}`);
                      }}
                    >
                      <Space>
                        <Icon
                          component={BucketIcon}
                          style={{ color: "#333" }}
                        />
                        {bucket.Name}
                      </Space>
                    </span>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </Card>
    </>
  );
}

export default BucketsTable;
