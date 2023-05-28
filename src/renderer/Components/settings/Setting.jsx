import { EditOutlined, SettingOutlined, TeamOutlined } from "@ant-design/icons";
import { Button, Checkbox, Drawer, List, Tabs } from "antd";
import { useEffect, useState } from "react";
import AwsProfile from "./aws/AwsProfile";

export default function Setting({ onChange }) {
  const [settingDrawerOpen, setSettingDrawerOpen] = useState(false);
  const [currentDownloadPath, setCurrentDownloadPath] = useState("");
  const [openFolderWhenDone, setOpenFolderWhenDone] = useState(false);

  useEffect(() => {
    async function init() {
      const setting = await window.electron.electronStore.get(["setting"]);
      setOpenFolderWhenDone(setting.download_open_folder_when_done === "Y");
    }
    init();
  }, []);

  const handleSetDownloadPath = async () => {
    await window.electron.setting.setDownloadPath();
    const setting = await window.electron.electronStore.get(["setting"]);
    setCurrentDownloadPath(setting.download_path);
  };

  const handleDownloadOpenFolderCheck = async (e) => {
    const setting = await window.electron.electronStore.get(["setting"]);
    setting.download_open_folder_when_done = e.target.checked ? "Y" : "N";
    await window.electron.electronStore.set(["setting", setting]);
    setOpenFolderWhenDone(e.target.checked);
  };

  const handleShowSettingDrawer = async () => {
    const setting = await window.electron.electronStore.get(["setting"]);
    setCurrentDownloadPath(setting.download_path);
    setSettingDrawerOpen(true);
  };

  const handleSettingDrawerClose = () => {
    onChange();
    setSettingDrawerOpen(false);
  };
  const tabItems = [
    {
      key: "1",
      label: (
        <span>
          <SettingOutlined />
          General
        </span>
      ),
      children: (
        <List>
          <List.Item>
            <List.Item.Meta
              avatar={
                <Button
                  key="download"
                  onClick={handleSetDownloadPath}
                  size="small"
                  type="link"
                >
                  <EditOutlined />
                </Button>
              }
              title="Download Folder"
              description={currentDownloadPath}
            />
          </List.Item>
          <List.Item>
            <List.Item.Meta
              avatar={
                <Button size="small" type="link">
                  <Checkbox
                    onChange={handleDownloadOpenFolderCheck}
                    checked={openFolderWhenDone}
                  />
                </Button>
              }
              title="Open Folder When Done"
              description="Open donwload folder when download file is completed."
            />
          </List.Item>
        </List>
      ),
    },
    {
      key: "2",
      label: (
        <span>
          <TeamOutlined />
          User Profiles
        </span>
      ),
      children: <AwsProfile />,
    },
  ];
  return (
    <div>
      <Button onClick={handleShowSettingDrawer}>
        <SettingOutlined />
      </Button>
      <Drawer
        title="Setting"
        placement="right"
        onClose={handleSettingDrawerClose}
        open={settingDrawerOpen}
        width="55vw"
      >
        <Tabs defaultActiveKey="1" items={tabItems} />
      </Drawer>
    </div>
  );
}
