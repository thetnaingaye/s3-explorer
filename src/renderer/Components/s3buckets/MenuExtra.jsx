import { useNavigate } from "react-router-dom";
import { Button, Divider } from "antd";
import { HomeFilled, RollbackOutlined, SyncOutlined } from "@ant-design/icons";

function MenuExtra({ onRefresh, loading }) {
  const navigate = useNavigate();
  return [
    <Button key="home" onClick={() => navigate("/")}>
      <HomeFilled />
      Home
    </Button>,
    <Divider key="d1" type="vertical" />,
    <Button key="back" onClick={() => navigate(-1)}>
      <RollbackOutlined />
      Back
    </Button>,
    <Divider key="d2" type="vertical" />,
    <Button onClick={onRefresh} key="refresh">
      <SyncOutlined spin={loading} />
      Refresh
    </Button>,
  ];
}
export default MenuExtra;
