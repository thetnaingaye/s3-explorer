import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { message } from "antd";
import Header from "./Header";
import S3BucketsTable from "../s3buckets/S3BucketsTable";
import S3ObjectsTable from "../s3objects/S3ObjectsTable";
import Dashboard from "../dashboard/Dashboard";

export default function Mainframe() {
  const [messageApi, contextHolder] = message.useMessage();
  const [awsProfiles, setAwsProfiles] = useState([]);
  const [curAwsProfile, setCurAwsProfile] = useState("");

  const [buckets, setBuckets] = useState([]);
  const [loading, setLoading] = useState(false);

  const listProfiles = async () => {
    try {
      setLoading(true);
      const profiles = await window.electron.aws.profile.list();
      console.log("aws profiless ", profiles);
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
      <Header awsProfiles={awsProfiles} onProfileChange={setCurAwsProfile} />
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
