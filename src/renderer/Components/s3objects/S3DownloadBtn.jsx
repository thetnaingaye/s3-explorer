import { useState } from "react";
import { Button, Progress, Space } from "antd";
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

  return (
    <Button
      onClick={() => {
        setShowProgress(true);
        onClick();
      }}
      size="small"
      style={{ width: 110 }}
      disabled={disabled}
    >
      {showProgress ? (
        <Progress
          percent={perc.toFixed(0)}
          style={{ width: 90, fontSize: "80%" }}
          size="small"
        />
      ) : (
        <Space>
          <DownloadOutlined />
          download
        </Space>
      )}
    </Button>
  );
}

export default S3DownloadBtn;
