import AdminCrudPage from "./AdminCrudPage";
import { adminApi, getResult } from "../../services/adminService";

const toSubjectIds = (value) => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item));
};

const transformCombinationSubmit = (form) => {
  const code = form.code?.trim();
  const name = form.name?.trim();
  const subjectIds = toSubjectIds(form.subjectIds);

  if (!code) {
    throw new Error("Mã tổ hợp không được để trống");
  }
  if (!name) {
    throw new Error("Tên tổ hợp không được để trống");
  }
  if (subjectIds.length === 0) {
    throw new Error("Vui lòng chọn ít nhất một môn thi");
  }

  return {
    code,
    name,
    description: form.description?.trim() || "",
    subjectIds,
  };
};

export default function AdminExamCombinations() {
  return (
    <AdminCrudPage
      title="Quản lý tổ hợp xét tuyển"
      description="Tạo tổ hợp như A00 và chọn nhiều môn thi thuộc tổ hợp."
      endpoint="exam-combinations"
      loadRefs={async () => ({ subjects: getResult(await adminApi.examSubjects()) })}
      transformSubmit={transformCombinationSubmit}
      columns={[
        { key: "id", label: "ID" },
        { key: "code", label: "Mã tổ hợp" },
        { key: "name", label: "Tên tổ hợp" },
        {
          key: "subjects",
          label: "Môn",
          render: (row) => (row.subjects || []).map((item) => item.name).join(", "),
        },
      ]}
      fields={[
        { name: "code", label: "Mã tổ hợp", required: true },
        { name: "name", label: "Tên tổ hợp", required: true },
        { name: "description", label: "Mô tả", type: "textarea" },
        { name: "subjectIds", label: "Môn thi", type: "multiselect", optionsKey: "subjects" },
      ]}
    />
  );
}
