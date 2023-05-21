import { CaretRightFilled, RollbackOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Space } from "antd";

function BreadcrumbKey({ s3Prefix, onChange, bucket }) {
  const handleBreadcrumbItemClick = (item) => {
    if (!item) {
      onChange("");
      return;
    }
    const newPrefix = `${s3Prefix.split(item)[0]}${item}/`;
    onChange(newPrefix);
  };
  const breadcrumbItems = [
    {
      title: (
        <span
          onKeyDown={() => {}}
          onClick={() => handleBreadcrumbItemClick("")}
          style={{ color: "#1890ff", cursor: "pointer" }}
        >
          {bucket}
        </span>
      ),
    },
  ];
  if (s3Prefix) {
    const splitPaths = s3Prefix.split("/");
    splitPaths.forEach((item, idx) => {
      const isLast = idx === splitPaths.length - 2;
      if (isLast) {
        breadcrumbItems.push({
          title: <strong>{item}</strong>,
        });
      } else {
        breadcrumbItems.push({
          title: (
            <span
              onKeyDown={() => {}}
              onClick={() => handleBreadcrumbItemClick(item)}
              style={{ color: "#1890ff", cursor: "pointer" }}
            >
              {item}
            </span>
          ),
        });
      }
    });
  }

  const handleBack = () => {
    const segs = s3Prefix.split("/");
    if (segs.length > 2) {
      const newPrefix = `${segs.slice(0, -2).join("/")}/`;
      onChange(newPrefix);
    } else {
      onChange("");
    }
  };
  return (
    <div>
      <Space>
        <Breadcrumb
          separator={<CaretRightFilled style={{ paddingTop: 5 }} />}
          items={breadcrumbItems}
        />
        <Button onClick={handleBack} size="small" disabled={!s3Prefix}>
          <RollbackOutlined />
        </Button>
      </Space>
    </div>
  );
}

export default BreadcrumbKey;
