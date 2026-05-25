import AdminCrudPage from "./AdminCrudPage";

export default function AdminLearningMethods() {
  return (
    <AdminCrudPage
      title="Quản lý phương pháp học"
      description="Quản lý phương pháp học và lợi ích hiển thị trong chiến lược học tập."
      endpoint="learning-methods"
      columns={[
        { key: "id", label: "ID" },
        { key: "title", label: "Tên phương pháp" },
        { key: "description", label: "Mô tả" },
        { key: "benefits", label: "Lợi ích" },
      ]}
      fields={[
        { name: "title", label: "Tên phương pháp", required: true },
        { name: "description", label: "Mô tả", type: "textarea", required: true },
        { name: "benefits", label: "Lợi ích", type: "textarea" },
      ]}
    />
  );
}
