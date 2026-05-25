import AdminCrudPage from "./AdminCrudPage";

export default function AdminUniversities() {
  return (
    <AdminCrudPage
      title="Quản lý trường đại học"
      description="Quản lý thông tin trường, khu vực, loại trường và học phí."
      endpoint="universities"
      columns={[
        { key: "id", label: "ID" },
        { key: "name", label: "Tên trường" },
        { key: "region", label: "Khu vực" },
        { key: "type", label: "Loại" },
        { key: "tuitionFee", label: "Học phí" },
      ]}
      fields={[
        { name: "name", label: "Tên trường", required: true },
        { name: "region", label: "Khu vực" },
        { name: "type", label: "Loại trường" },
        { name: "tuitionFee", label: "Học phí", type: "number", min: 0 },
      ]}
    />
  );
}
