import { EditOutlined, PlusOutlined, WarningOutlined } from "@ant-design/icons";
import { Button, Card, Space, Switch, message } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AwsProfileFormDrawer from "./AwsProfileFormDrawer";

const { Meta } = Card;

const gridStyle = {
  width: "25%",
  textAlign: "center",
};

function AwsProfile() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [awsProfileNames, setAwsProfileNames] = useState([]);
  const [isProfilesFromCliCreds, setIsProfilesFromCliCreds] = useState(true);
  const [editProfile, setEditProfile] = useState(null);

  useEffect(() => {
    async function init() {
      const appSetting = await window.electron.electronStore.get(
        ["setting"],
        {}
      );
      setIsProfilesFromCliCreds(appSetting.useCliCredentials === "Y");
    }
    init();
  }, []);

  const handleProfileDrawerClose = () => {
    setEditProfile(null);
    setProfileDrawerOpen(false);
  };

  const listUserAwsProfiles = async () => {
    const data = await window.electron.electronStore.get(["awsProfileNames"]);
    setAwsProfileNames(data);
  };

  useEffect(() => {
    listUserAwsProfiles();
  }, []);

  const handleUseCliCredsOptionChange = async (checked) => {
    const appSetting = await window.electron.electronStore.get(["setting"], {});
    appSetting.useCliCredentials = checked ? "Y" : "N";
    await window.electron.electronStore.set(["setting", appSetting]);
    setIsProfilesFromCliCreds(checked);
    navigate("/");
  };

  const handleSubmit = async (values, form) => {
    const newProfile = values;
    try {
      if (editProfile) {
        await window.electron.aws.profile.update([newProfile]);
      } else {
        await window.electron.aws.profile.add([newProfile]);
      }
      messageApi.success("success");
      listUserAwsProfiles();
      form.resetFields();
      setProfileDrawerOpen(false);
    } catch (error) {
      messageApi.error(`failed: ${error}`);
    }
  };

  const handleProfileEdit = async (profileName) => {
    const profile = await window.electron.aws.profile.get([profileName]);
    setEditProfile(profile);
    setProfileDrawerOpen(true);
  };

  const handleRemoveProfile = async () => {
    await window.electron.aws.profile.delete([editProfile.profile]);
    setEditProfile(null);
    listUserAwsProfiles();
    setProfileDrawerOpen(false);
  };

  return (
    <Space direction="vertical" size="middle" style={{ display: "flex" }}>
      {contextHolder}
      <Card size="small">
        <Meta
          avatar={
            <Switch
              checked={isProfilesFromCliCreds}
              size="small"
              onChange={handleUseCliCredsOptionChange}
            />
          }
          title={
            <span style={{ fontSize: "95%" }}>
              Use aws profiles from shared config file
            </span>
          }
          description="If enabled, profiles will be loaded from aws config file instead of below user configured accounts. This can be used if aws-cli is installed and credentials are already set up in the system."
        />
      </Card>
      <Card
        size="small"
        title={
          <Space>
            <span style={{ color: isProfilesFromCliCreds ? "#ccc" : "#333" }}>
              Profiles
            </span>
            {isProfilesFromCliCreds && (
              <span style={{ color: "red" }}>
                {" "}
                <WarningOutlined /> not in use
              </span>
            )}
          </Space>
        }
        style={{ color: isProfilesFromCliCreds ? "#ccc" : "#333" }}
        extra={[
          <Button
            key="new"
            icon={<PlusOutlined />}
            type="primary"
            size="small"
            onClick={() => setProfileDrawerOpen(true)}
          >
            New Aws Profile
          </Button>,
        ]}
      >
        {awsProfileNames?.map((profile) => (
          <Card.Grid key={profile} style={gridStyle} hoverable={false}>
            <Space>
              <Button
                icon={<EditOutlined />}
                type="link"
                onClick={() => handleProfileEdit(profile)}
              />
              {profile}
            </Space>
          </Card.Grid>
        ))}
      </Card>
      <AwsProfileFormDrawer
        open={profileDrawerOpen}
        onClose={handleProfileDrawerClose}
        onSubmit={handleSubmit}
        editProfile={editProfile}
        onRemove={handleRemoveProfile}
      />
    </Space>
  );
}
export default AwsProfile;
