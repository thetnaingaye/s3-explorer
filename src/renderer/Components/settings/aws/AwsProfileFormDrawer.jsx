import {
  Button,
  Drawer,
  Input,
  Space,
  Form,
  Row,
  Col,
  Collapse,
  Card,
} from "antd";
import { useEffect, useState } from "react";

const { Panel } = Collapse;

function AwsProfileFormDrawer({
  open,
  onSubmit,
  onClose,
  onRemove,
  editProfile,
}) {
  const [form] = Form.useForm();
  const [removeConfrimText, setRemoveConfrimText] = useState("");
  useEffect(() => {
    if (open) {
      form.resetFields();
    }
  }, [open, form, editProfile]);

  const handleDrawerClose = () => {
    form.resetFields();
    onClose();
  };

  const handleSubmit = async () => {
    let newProfile;
    try {
      newProfile = await form.validateFields();
      onSubmit(newProfile, form);
    } catch (err) {
      return null;
    }
    return null;
  };

  return (
    <Drawer
      title="AWS Profile"
      placement="right"
      onClose={handleDrawerClose}
      open={open}
      width="42vw"
      destroyOnClose
      style={{ background: "#fafafa" }}
      extra={
        <Space>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} type="primary">
            {editProfile ? "Update" : "Create"}
          </Button>
        </Space>
      }
    >
      <Card>
        <Form
          layout="vertical"
          form={form}
          initialValues={editProfile}
          hideRequiredMark
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="profile"
                label="Profile Name"
                rules={[
                  {
                    required: true,
                    message: "Please enter profile name",
                  },
                ]}
              >
                <Input
                  placeholder="Please enter profile name"
                  disabled={editProfile}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="accessKeyId"
                label="Access Key Id"
                rules={[
                  {
                    required: true,
                    message: "Please enter access key id",
                  },
                ]}
              >
                <Input placeholder="Please enter access key id" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="secretAccessKey"
                label="Secret Access Key"
                rules={[
                  {
                    required: true,
                    message: "Please enter secret access key",
                  },
                ]}
              >
                <Input.Password placeholder="Please enter secret access key" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
      {editProfile && (
        <Collapse defaultActiveKey={["0"]} style={{ marginTop: 20 }}>
          <Panel
            header={<span style={{ color: "red" }}>Remove this profile?</span>}
            key="1"
          >
            <p>
              Type <em>confirm</em> to remove profile
            </p>
            <Space>
              <Input onChange={(e) => setRemoveConfrimText(e.target.value)} />
              <Button
                onClick={onRemove}
                danger
                disabled={removeConfrimText !== "confirm"}
              >
                Remove
              </Button>
            </Space>
          </Panel>
        </Collapse>
      )}
    </Drawer>
  );
}

export default AwsProfileFormDrawer;
