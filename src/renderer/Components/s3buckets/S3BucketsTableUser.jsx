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
import {
  HomeFilled,
  MinusCircleOutlined,
  RollbackOutlined,
  SyncOutlined,
} from "@ant-design/icons";

function BucketsTable({ awsProfile, awsProfiles, onProfileChange }) {
  const [messageApi, contextHolder] = message.useMessage();
  const [buckets, setBuckets] = useState([]);
  const [bucketsByProfile, setBucketsByProfile] = useState({});
  const [loading, setLoading] = useState(false);
  const [newBucketName, setNewBucketName] = useState("");
  const [selectedAwsProfile, setSelectedAwsProfile] = useState();
  const navigate = useNavigate();
  const listBuckets = async () => {
    try {
      setLoading(true);
      const data = await window.electron.electronStore.get(["buckets"]);
      const bucketsGroup = {};
      data.forEach((bucket) => {
        if (bucketsGroup[bucket.AwsProfile]) {
          bucketsGroup[bucket.AwsProfile].push(bucket);
        } else {
          bucketsGroup[bucket.AwsProfile] = [bucket];
        }
      });
      console.log("groupBy", bucketsGroup);
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
    if (buckets.map((bucket) => bucket.Name).includes(newBucketName)) {
      message.error("bucket is already in your list.");
      return;
    }
    const newBuckets = [
      ...buckets,
      { Name: newBucketName, AwsProfile: selectedAwsProfile },
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
            Buckets <span>{buckets.length && `(${buckets.length})`}</span>
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
            <Select
              value={selectedAwsProfile}
              placeholder="select aws profile"
              style={{ width: 225, fontSize: "90%" }}
              onChange={setSelectedAwsProfile}
              options={awsProfiles.map((item) => ({
                value: item,
                label: item,
              }))}
            />
            <Button
              onClick={saveNewBucket}
              disabled={!(newBucketName && selectedAwsProfile)}
            >
              + Add to your list
            </Button>
          </Space>
        </Card>
        <Row gutter={[16, 16]} style={{ marginTop: 15 }}>
          {Object.keys(bucketsByProfile).map((profile) => {
            return (
              <Col xs={{ span: 24 }} lg={{ span: 12 }} key={profile}>
                <Card title={profile} key={profile} size="small">
                  <List
                    bordered
                    dataSource={bucketsByProfile[profile]}
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
                          {bucket.Name}
                        </span>
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            );
          })}
        </Row>
      </Card>
    </>
  );
}

export default BucketsTable;
