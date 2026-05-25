import AdminCrudPage from "./AdminCrudPage";
import { adminApi, getResult } from "../../services/adminService";

export default function AdminResources() {
  return (
    <AdminCrudPage
      title="Quản lý kho tài liệu"
      description="Tạo và ẩn tài liệu học tập theo ngành. Xóa sẽ chuyển trạng thái HIDDEN."
      endpoint="learning-resources"
      loadRefs={async () => ({ careers: getResult(await adminApi.careers()) })}
      columns={[
        { key: "id", label: "ID" },
        { key: "title", label: "Tiêu đề" },
        { key: "careerName", label: "Ngành" },
        { key: "resourceType", label: "Loại" },
        { key: "level", label: "Mức độ" },
        { key: "status", label: "Trạng thái" },
      ]}
      fields={[
        { name: "careerId", label: "Ngành", type: "select", optionsKey: "careers", required: true },
        { name: "title", label: "Tiêu đề", required: true },
        { name: "description", label: "Mô tả", type: "textarea" },
        { name: "resourceType", label: "Loại tài liệu", type: "select", required: true, options: ["PDF", "VIDEO", "WEBSITE", "EXERCISE", "ROADMAP"].map((value) => ({ value, label: value })) },
        { name: "level", label: "Mức độ", type: "select", options: ["BEGINNER", "INTERMEDIATE", "ADVANCED"].map((value) => ({ value, label: value })) },
        { name: "url", label: "Link tài liệu" },
        { name: "thumbnailUrl", label: "Thumbnail URL" },
        { name: "status", label: "Trạng thái", type: "select", defaultValue: "ACTIVE", options: ["ACTIVE", "HIDDEN"].map((value) => ({ value, label: value })) },
      ]}
    />
  );
}
