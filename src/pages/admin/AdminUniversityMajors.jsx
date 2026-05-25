import AdminCrudPage from "./AdminCrudPage";
import { adminApi, getResult } from "../../services/adminService";

export default function AdminUniversityMajors() {
  return (
    <AdminCrudPage
      title="Quản lý điểm chuẩn theo ngành"
      description="Liên kết trường với ngành và điểm chuẩn tương ứng."
      endpoint="university-majors"
      loadRefs={async () => {
        const [universities, careers] = await Promise.all([adminApi.universities(), adminApi.careers()]);
        return { universities: getResult(universities), careers: getResult(careers) };
      }}
      columns={[
        { key: "id", label: "ID" },
        { key: "universityName", label: "Trường" },
        { key: "careerName", label: "Ngành" },
        { key: "scoreRequired", label: "Điểm chuẩn" },
      ]}
      fields={[
        { name: "universityId", label: "Trường", type: "select", optionsKey: "universities", required: true },
        { name: "careerId", label: "Ngành", type: "select", optionsKey: "careers", required: true },
        { name: "scoreRequired", label: "Điểm chuẩn", type: "number", min: 0 },
      ]}
    />
  );
}
