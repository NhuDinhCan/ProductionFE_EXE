import AdminCrudPage from "./AdminCrudPage";

export default function AdminQuizQuestions() {
  return (
    <AdminCrudPage
      title="Quản lý câu hỏi quiz định hướng"
      description="Quản lý câu hỏi dùng cho bài quiz gợi ý ngành học. Kết quả user sẽ thay đổi theo trọng số bạn cấu hình."
      endpoint="quiz/questions"
      columns={[
        { key: "id", label: "ID" },
        { key: "content", label: "Nội dung câu hỏi" },
      ]}
      fields={[
        { name: "content", label: "Nội dung câu hỏi", type: "textarea", required: true },
      ]}
      rowActions={(row) => [{ label: "Trọng số", to: `/admin/quiz/questions/${row.id}/weights` }]}
    />
  );
}
