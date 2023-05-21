import {
  DownloadOutlined,
  EditOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Button, Drawer, List } from "antd";
import { useState } from "react";

export default function Setting() {
  const [settingDrawerOpen, setSettingDrawerOpen] = useState(false);
  const [currentDownloadPath, setCurrentDownloadPath] = useState("");

  const handleSetDownloadPath = async () => {
    await window.electron.setting.setDownloadPath();
    const setting = await window.electron.electronStore.get(["setting"]);
    setCurrentDownloadPath(setting.download_path);
  };

  const handleShowSettingDrawer = async () => {
    const setting = await window.electron.electronStore.get(["setting"]);
    setCurrentDownloadPath(setting.download_path);
    setSettingDrawerOpen(true);
  };

  return (
    <div>
      <Button onClick={handleShowSettingDrawer}>
        <SettingOutlined />
      </Button>
      <Drawer
        title="Setting"
        placement="right"
        onClose={() => setSettingDrawerOpen(false)}
        open={settingDrawerOpen}
        width="45vw"
      >
        <List>
          <List.Item title="Download Folder">
            <List.Item.Meta
              avatar={
                <Button
                  key="download"
                  onClick={handleSetDownloadPath}
                  size="small"
                >
                  <EditOutlined />
                </Button>
              }
              title="Download Folder"
              description={currentDownloadPath}
            />
          </List.Item>
        </List>
      </Drawer>
    </div>
  );
}
