import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { Link, useParams } from "react-router-dom";
import { adminApi, getResult } from "../../services/adminService";

export default function AdminQuizWeights() {
  const { questionId } = useParams();
  const [question, setQuestion] = useState(null);
  const [careers, setCareers] = useState([]);
  const [weights, setWeights] = useState([]);
  const [values, setValues] = useState({});
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [questionRes, careerRes, weightRes] = await Promise.all([
        adminApi.detail("quiz/questions", questionId),
        adminApi.careers(),
        adminApi.quizWeights(questionId),
      ]);
      const loadedWeights = getResult(weightRes);
      setQuestion(getResult(questionRes));
      setCareers(getResult(careerRes));
      setWeights(loadedWeights);
      setValues(Object.fromEntries(loadedWeights.map((item) => [item.careerId, item.weight])));
    } catch (err) {
      setToast(err.response?.data?.message || "Không tải được trọng số.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [questionId]);

  const saveCareerWeight = async (careerId) => {
    const value = values[careerId];
    if (value === "" || Number(value) < 0) {
      setToast("Weight phải là số >= 0.");
      return;
    }

    const existing = weights.find((item) => Number(item.careerId) === Number(careerId));
    try {
      if (existing) {
        await adminApi.updateQuizWeight(existing.id, { careerId, weight: value });
      } else {
        await adminApi.createQuizWeight(questionId, { careerId, weight: value });
      }
      setToast("Đã lưu trọng số.");
      await load();
    } catch (err) {
      setToast(err.response?.data?.message || "Không lưu được trọng số.");
    }
  };

  const removeWeight = async (careerId) => {
    const existing = weights.find((item) => Number(item.careerId) === Number(careerId));
    if (!existing) {
      setValues((prev) => ({ ...prev, [careerId]: "" }));
      return;
    }
    if (!window.confirm("Xóa trọng số ngành này?")) return;
    try {
      await adminApi.deleteQuizWeight(existing.id);
      setToast("Đã xóa trọng số.");
      await load();
    } catch (err) {
      setToast(err.response?.data?.message || "Không xóa được trọng số.");
    }
  };

  return (
    <div className="space-y-6">
      <section>
        <Link to="/admin/quiz/questions" className="text-xs font-black text-[#00a8b5] inline-flex items-center gap-2 mb-4">
          <Icon icon="lucide:arrow-left" /> Quay lại câu hỏi quiz
        </Link>
        <h1 className="text-3xl font-black text-[#0f2c3f]">Quản lý trọng số ngành</h1>
        <p className="text-sm text-slate-500 mt-2 max-w-3xl">{question?.content || `Câu hỏi #${questionId}`}</p>
      </section>

      {toast && <div className="bg-cyan-50 border border-cyan-100 rounded-2xl px-4 py-3 text-sm font-bold">{toast}</div>}

      <section className="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center font-bold text-slate-500">Đang tải...</div>
        ) : careers.length === 0 ? (
          <div className="p-12 text-center font-bold text-slate-500">Chưa có ngành học</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {careers.map((career) => (
              <div key={career.id} className="p-4 flex flex-col md:flex-row md:items-center gap-4 justify-between">
                <div>
                  <p className="font-black text-[#0f2c3f]">{career.name}</p>
                  <p className="text-xs text-slate-400">careerId: {career.id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={values[career.id] ?? ""}
                    onChange={(event) => setValues((prev) => ({ ...prev, [career.id]: event.target.value }))}
                    className="w-32 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none"
                    placeholder="0"
                  />
                  <button onClick={() => saveCareerWeight(career.id)} className="bg-[#0f2c3f] text-white px-4 py-3 rounded-xl text-xs font-black">Lưu</button>
                  <button onClick={() => removeWeight(career.id)} className="bg-rose-50 text-rose-600 px-4 py-3 rounded-xl text-xs font-black">Xóa</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
