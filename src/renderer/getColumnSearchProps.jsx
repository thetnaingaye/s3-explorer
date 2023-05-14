import React from "react";
import { Card, Input, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const handleSearch = (selectedKeys, confirm) => {
  confirm();
  // this.setState({ searchText: selectedKeys[0] });
};
const handleReset = (clearFilters, confirm) => {
  clearFilters();
  // this.setState({ searchText: "" });
  handleSearch([], confirm);
};

let searchInput = {};

const getColumnSearchProps = (dataIndex, onfilter) => ({
  filterDropdown: ({
    setSelectedKeys,
    selectedKeys,
    confirm,
    clearFilters,
  }) => (
    <Card style={{ padding: 0 }}>
      <Input
        ref={(node) => {
          searchInput = node;
        }}
        placeholder={`Search ${dataIndex}`}
        value={selectedKeys[0]}
        onChange={(e) =>
          setSelectedKeys(e.target.value ? [e.target.value] : [])
        }
        onPressEnter={() => handleSearch(selectedKeys, confirm)}
        style={{ width: 188, marginBottom: 8, display: "block" }}
      />
      <Button
        type="primary"
        onClick={() => handleSearch(selectedKeys, confirm)}
        size="small"
        style={{ width: 90, marginRight: 8 }}
      >
        Search
      </Button>
      <Button
        onClick={() => handleReset(clearFilters, confirm)}
        size="small"
        style={{ width: 90 }}
      >
        Reset
      </Button>
    </Card>
  ),
  filterIcon: (filtered) => (
    <SearchOutlined
      style={{
        color: filtered ? "#1890ff" : undefined,
      }}
    />
  ),
  onFilter: (value, record) => {
    console.log("on filter", value, dataIndex, record, onfilter);
    if (!onfilter) {
      return record[dataIndex]
        ? record[dataIndex]
            .toString()
            .toLowerCase()
            .includes(value.toLowerCase())
        : false;
    }

    return onfilter(value, record);
  },
  onFilterDropdownVisibleChange: (visible) => {
    if (visible) {
      setTimeout(() => searchInput.select());
    }
  },
});
export default getColumnSearchProps;
