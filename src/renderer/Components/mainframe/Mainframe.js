import { Routes, Route } from "react-router-dom";
import Header from "./Header";
import S3BucketsTable from "../s3buckets/S3BucketsTable";
import S3ObjectsTable from "../s3objects/S3ObjectsTable";
import Dashboard from "../dashboard/Dashboard";

export default function Mainframe() {
  return (
    <>
      <Header />
      <Routes>
        <Route exact path="/" element={<Dashboard />} />
        <Route exact path="/buckets" element={<S3BucketsTable />} />
        <Route path="/objects/:bucket/:prefix?" element={<S3ObjectsTable />} />
      </Routes>
    </>
  );
}
