import AdminCrudPage from "./AdminCrudPage";

export default function AdminCareers() {
  return (
    <AdminCrudPage
      title="Quản lý ngành học"
      description="Tạo, sửa và xóa danh mục ngành học dùng cho quiz, trường, chiến lược và tài liệu."
      endpoint="careers"
      columns={[{ key: "id", label: "ID" }, { key: "name", label: "Tên ngành" }]}
      fields={[{ name: "name", label: "Tên ngành", required: true }]}
    />
  );
}
