import { useCallback, useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { message } from "antd";
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

  const listProfiles = useCallback(async () => {
    try {
      setLoading(true);
      const profiles = await window.electron.aws.profile.list();
      if (profiles?.length) {
        setAwsProfiles(profiles);
        setCurAwsProfile(profiles[0]);
      } else {
        setCurAwsProfile("");
        messageApi.warning(
          "AWS Profile has not configured. Please add profile to start using application."
        );
      }
      setLoading(false);
    } catch (error) {
      messageApi.error(error?.message);
      setLoading(false);
    }
  }, [messageApi]);

  useEffect(() => {
    listProfiles();
  }, [listProfiles]);

  return (
    <>
      {contextHolder}
      <Header
        curAwsProfile={curAwsProfile}
        awsProfiles={awsProfiles}
        onSettingChange={listProfiles}
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
