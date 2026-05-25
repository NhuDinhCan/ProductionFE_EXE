import AdminCrudPage from "./AdminCrudPage";

export default function AdminExamSubjects() {
  return (
    <AdminCrudPage
      title="Quản lý môn thi"
      description="Quản lý môn thi dùng cho tổ hợp xét tuyển và đề thi thử."
      endpoint="exam-subjects"
      columns={[
        { key: "id", label: "ID" },
        { key: "code", label: "Mã" },
        { key: "name", label: "Tên môn" },
      ]}
      fields={[
        { name: "code", label: "Mã môn" },
        { name: "name", label: "Tên môn", required: true },
      ]}
    />
  );
}
