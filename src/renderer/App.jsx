import { Progress, Space, message } from "antd";
import "./App.css";
import { DownloadOutlined } from "@ant-design/icons";
import Mainframe from "./Components/mainframe/Mainframe";

export default function App() {
  const [messageApi, contextHolder] = message.useMessage();
  window.electron.ipcRenderer.on("download-progress", (args) => {
    const perc = args[0].progress.percent * 100;
    messageApi.open({
      key: args[0].presignedUrl,
      icon: (
        <div style={{ width: 420, textAlign: "left" }}>
          <Space>
            <DownloadOutlined />
            {args[0].filename}
          </Space>

          <Progress percent={perc.toFixed(0)} />
        </div>
      ),
    });
  });

  return (
    <>
      {contextHolder}
      <Mainframe />
    </>
  );
}
