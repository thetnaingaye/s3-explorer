import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  message,
  Space,
  Input,
  List,
  Tooltip,
  Col,
  Row,
} from "antd";
import Icon, { MinusCircleOutlined } from "@ant-design/icons";
import { ReactComponent as BucketIcon } from "../images/bucket.svg";
import MenuExtra from "./MenuExtra";

function S3UserBuckets({ awsProfile }) {
  const navigate = useNavigate();
  const [buckets, setBuckets] = useState([]);
  const [bucketsByProfile, setBucketsByProfile] = useState({});
  const [loading, setLoading] = useState(false);
  const [newBucketName, setNewBucketName] = useState("");

  const listBuckets = useCallback(async () => {
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
      message.error(error?.message);
      setLoading(false);
      return [];
    }
  }, []);

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
  }, [listBuckets]);

  return (
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
        <MenuExtra onRefresh={listBuckets} loading={loading} key="menu" />,
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
          <Card title={<span>{awsProfile}</span>} key={awsProfile} size="small">
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
                      navigate(`/objects/${bucket.Name}`);
                    }}
                  >
                    <Space>
                      <Icon component={BucketIcon} style={{ color: "#333" }} />
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
  );
}

export default S3UserBuckets;
