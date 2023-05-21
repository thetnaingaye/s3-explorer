import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Progress, Space, message } from "antd";
import { DownloadOutlined, UploadOutlined } from "@ant-design/icons";
import Header from "./Header";
import S3BucketsTable from "../s3buckets/S3BucketsTable";
import S3BucketsTableUser from "../s3buckets/S3BucketsTableUser";
import S3ObjectsTable from "../s3objects/S3ObjectsTable";
import Dashboard from "../dashboard/Dashboard";

export default function Mainframe() {
  const [messageApi, contextHolder] = message.useMessage();
  const [awsProfiles, setAwsProfiles] = useState([]);
  const [curAwsProfile, setCurAwsProfile] = useState("");

  const [loading, setLoading] = useState(false);

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
        curAwsProfile={curAwsProfile}
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
          exact
          path="/buckets/user"
          element={
            <S3BucketsTableUser
              awsProfile={curAwsProfile}
              awsProfiles={awsProfiles}
              onProfileChange={setCurAwsProfile}
            />
          }
        />
        <Route
          path="/objects/:bucket/:prefix?"
          element={<S3ObjectsTable awsProfile={curAwsProfile} />}
        />
      </Routes>
    </>
  );
}
