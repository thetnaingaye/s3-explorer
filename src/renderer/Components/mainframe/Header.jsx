import { SettingOutlined } from "@ant-design/icons";
import { Button, Drawer, Select, Space } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Setting from "./Setting";

export default function Header({
  awsProfiles,
  onProfileChange,
  curAwsProfile,
}) {
  const navigate = useNavigate();

  const handleProfileChange = (value) => {
    navigate("/");
    onProfileChange(value);
  };

  return (
    <div>
      <div
        style={{
          padding: 20,
          borderBottom: "5px solid orange",
          color: "#333",
          fontSize: "125%",
          fontWeight: 300,
          letterSpacing: 1.1,
          backgroundColor: "#f0f0f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <strong onClick={() => navigate("/")} onKeyDown={() => navigate("/")}>
          AWS S3 Explorer{" "}
        </strong>
        <div>
          <span style={{ fontSize: "65%" }}>aws profile: </span>
          <Space>
            <Select
              placeholder="select aws profile"
              value={curAwsProfile}
              style={{ width: 225, fontSize: "90%" }}
              onChange={handleProfileChange}
              options={awsProfiles.map((item) => ({
                value: item,
                label: item,
              }))}
            />
            <Setting />
          </Space>
        </div>
      </div>
    </div>
  );
}
