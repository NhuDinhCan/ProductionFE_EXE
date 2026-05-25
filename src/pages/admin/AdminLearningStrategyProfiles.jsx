import AdminCrudPage from "./AdminCrudPage";
import { adminApi, getResult } from "../../services/adminService";

export default function AdminLearningStrategyProfiles() {
  return (
    <AdminCrudPage
      title="Quản lý hồ sơ chiến lược học tập"
      description="Quản lý mô tả, kỹ năng, công cụ và roadmap theo từng ngành."
      endpoint="learning-strategy-profiles"
      loadRefs={async () => ({ careers: getResult(await adminApi.careers()) })}
      columns={[
        { key: "id", label: "ID" },
        { key: "careerName", label: "Ngành" },
        { key: "description", label: "Mô tả" },
        { key: "skills", label: "Kỹ năng" },
        { key: "tools", label: "Công cụ" },
      ]}
      fields={[
        { name: "careerId", label: "Ngành", type: "select", optionsKey: "careers", required: true },
        { name: "description", label: "Mô tả", type: "textarea", required: true },
        { name: "skills", label: "Kỹ năng, phân cách bằng | hoặc xuống dòng", type: "textarea" },
        { name: "tools", label: "Công cụ, phân cách bằng | hoặc xuống dòng", type: "textarea" },
        { name: "weeklyRoadmap", label: "Roadmap tuần", type: "textarea", rows: 5 },
      ]}
    />
  );
}
