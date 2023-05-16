import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Progress, Space, message } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import Header from "./Header";
import S3BucketsTable from "../s3buckets/S3BucketsTable";
import S3ObjectsTable from "../s3objects/S3ObjectsTable";
import Dashboard from "../dashboard/Dashboard";

export default function Mainframe() {
  const [messageApi, contextHolder] = message.useMessage();
  const [awsProfiles, setAwsProfiles] = useState([]);
  const [curAwsProfile, setCurAwsProfile] = useState("");

  const [loading, setLoading] = useState(false);

  window.electron.ipcRenderer.on("download-progress", (args) => {
    const key = args[0].presignedUrl;
    const perc = args[0].progress.percent * 100;
    messageApi.open({
      key,
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

  const listProfiles = async () => {
    try {
      setLoading(true);
      const profiles = await window.electron.aws.profile.list();
      setAwsProfiles(Object.keys(profiles.configFile));
      setLoading(false);
    } catch (error) {
      messageApi.error(error?.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    listProfiles();
  }, []);

  return (
    <>
      {contextHolder}
      <Header
        awsProfiles={awsProfiles}
        onProfileChange={setCurAwsProfile}
        loading={loading}
      />
      <Routes>
        <Route
          exact
          path="/"
          element={<Dashboard awsProfile={curAwsProfile} />}
        />
        <Route
          exact
          path="/buckets"
          element={<S3BucketsTable awsProfile={curAwsProfile} />}
        />
        <Route
          path="/objects/:bucket/:prefix?"
          element={<S3ObjectsTable awsProfile={curAwsProfile} />}
        />
      </Routes>
    </>
  );
}
