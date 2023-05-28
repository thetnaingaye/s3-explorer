import { useNavigate, useLocation } from "react-router-dom";
import { Select, Space, Layout } from "antd";
import Setting from "../settings/Setting";

const { Header } = Layout;

export default function HeaderComponent({
  awsProfiles,
  awsProfile,
  onProfileChange,
  onSettingChange,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleProfileChange = (value) => {
    if (location.pathname.startsWith("/objects")) {
      navigate("/");
    }
    onProfileChange(value);
  };

  return (
    <Header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        letterSpacing: 1.1,
        backgroundColor: "#f0f0f0",
        borderBottom: "5px solid orange",
        padding: "0px 23px",
      }}
    >
      <div
        style={{
          color: "#333",
          fontSize: "145%",
          fontWeight: 300,
        }}
      >
        <strong onClick={() => navigate("/")} onKeyDown={() => navigate("/")}>
          AWS S3 Explorer{" "}
        </strong>
      </div>
      <div>
        <span style={{ fontWeight: 300, fontSize: "90%" }}>aws profile: </span>
        <Space>
          <Select
            placeholder="select aws profile"
            value={awsProfile}
            style={{ width: 225, fontSize: "90%" }}
            onChange={handleProfileChange}
            options={awsProfiles.map((item) => ({
              value: item,
              label: item,
            }))}
          />
          <Setting onChange={onSettingChange} />
        </Space>
      </div>
    </Header>
  );
}
