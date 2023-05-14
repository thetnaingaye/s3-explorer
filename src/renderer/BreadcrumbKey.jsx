import { CaretRightFilled, RollbackOutlined } from "@ant-design/icons";
import { Breadcrumb, Button } from "antd";

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
        <Button
          type="link"
          onClick={() => handleBreadcrumbItemClick("")}
          style={{ padding: 0, margin: 0 }}
        >
          {bucket}
        </Button>
      ),
    },
  ];
  if (s3Prefix) {
    s3Prefix.split("/").forEach((item) => {
      breadcrumbItems.push({
        title: (
          <Button
            type="link"
            onClick={() => handleBreadcrumbItemClick(item)}
            style={{ padding: 0, margin: 0 }}
          >
            {item}
          </Button>
        ),
      });
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
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <Breadcrumb
        separator={
          <Button
            style={{ border: "none", padding: 0, margin: 0, cursor: "default" }}
          >
            <CaretRightFilled />
          </Button>
        }
        items={breadcrumbItems}
      />
      <Button onClick={handleBack} size="small" disabled={!s3Prefix}>
        <RollbackOutlined /> Back
      </Button>
    </div>
  );
}

export default BreadcrumbKey;
