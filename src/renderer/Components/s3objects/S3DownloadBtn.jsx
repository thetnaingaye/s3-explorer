import { useState } from "react";
import { Button, Progress, Space, message } from "antd";
import { DownloadOutlined } from "@ant-design/icons";

function S3DownloadBtn({ s3Key, onClick, disabled }) {
  const [showProgress, setShowProgress] = useState(false);
  const [perc, setPerc] = useState(0);
  window.electron.ipcRenderer.on(`download-progress-[${s3Key}]`, (args) => {
    const curPerc = args[0].progress.percent * 100;
    if (s3Key === args[0].Key) {
      if (!showProgress) {
        setShowProgress(true);
      }
    }
    setPerc(curPerc);
    if (curPerc === 100) {
      setTimeout(() => {
        setShowProgress(false);
        setPerc(0);
      }, 1000);
    }
  });

  return showProgress ? (
    <Button style={{ width: 110, fontSize: "90%" }} size="small">
      <Progress percent={perc.toFixed(0)} size="small" />
    </Button>
  ) : (
    <Button
      onClick={() => {
        setShowProgress(true);
        onClick();
      }}
      size="small"
      style={{ width: 110 }}
      disabled={disabled}
    >
      <Space>
        <DownloadOutlined />
        download
      </Space>
    </Button>
  );
}

export default S3DownloadBtn;
