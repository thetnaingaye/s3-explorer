import { useCallback, useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { message, Layout } from "antd";
import Header from "./Header";
import Dashboard from "../dashboard/Dashboard";
import S3BucketsTable from "../s3buckets/S3BucketsTable";
import S3UserBuckets from "../s3buckets/S3UserBuckets";
import S3ObjectsTable from "../s3objects/S3ObjectsTable";

const { Content } = Layout;

export default function Mainframe() {
  const [awsProfiles, setAwsProfiles] = useState([]);
  const [awsProfile, setAwsProfile] = useState("");
  const [loading, setLoading] = useState(false);

  const listProfiles = useCallback(async () => {
    try {
      setLoading(true);
      const profiles = await window.electron.aws.profile.list();
      if (profiles?.length) {
        setAwsProfiles(profiles);
        setAwsProfile(profiles[0]);
      } else {
        setAwsProfile("");
        message.warning(
          "AWS profile has not configured. Please add profile to start using application."
        );
      }
      setLoading(false);
    } catch (error) {
      message.error(error?.message);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    listProfiles();
  }, [listProfiles]);

  return (
    <Layout>
      <Header
        awsProfile={awsProfile}
        awsProfiles={awsProfiles}
        onSettingChange={listProfiles}
        onProfileChange={setAwsProfile}
        loading={loading}
      />
      <Content>
        <Routes>
          <Route
            exact
            path="/"
            element={<Dashboard awsProfile={awsProfile} />}
          />
          <Route
            exact
            path="/buckets"
            element={<S3BucketsTable awsProfile={awsProfile} />}
          />
          <Route
            exact
            path="/buckets/user"
            element={<S3UserBuckets awsProfile={awsProfile} />}
          />
          <Route
            path="/objects/:bucket/:prefix?"
            element={<S3ObjectsTable awsProfile={awsProfile} />}
          />
        </Routes>
      </Content>
    </Layout>
  );
}
