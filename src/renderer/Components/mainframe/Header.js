import { Select } from "antd";
import { useNavigate } from "react-router-dom";

export default function Header({ awsProfiles, onProfileChange }) {
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
        {/* <span style={{ fontSize: "50%", letterSpacing: 1 }}>
          powered by aws-sdk and aws-cli
        </span> */}
        <div>
          <span style={{ fontSize: "65%" }}>aws profile: </span>
          <Select
            placeholder="select aws profile"
            // defaultValue={undefined}
            style={{ width: 225, fontSize: "90%" }}
            onChange={handleProfileChange}
            options={awsProfiles.map((item) => ({
              value: item,
              label: item,
            }))}
          />
        </div>
      </div>
    </div>
  );
}
