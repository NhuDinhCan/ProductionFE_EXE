import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { Link, useParams } from "react-router-dom";
import { adminApi, getResult } from "../../services/adminService";
import { resolveMediaUrl } from "../../utils/mediaUrl";

const optionItems = ["A", "B", "C", "D"];
const emptyForm = {
  orderIndex: "",
  questionText: "",
  imageUrl: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctOption: "A",
  explanation: "",
};

function QuestionImage({ src, alt }) {
  if (!src) return null;

  return (
    <img
      src={resolveMediaUrl(src)}
      alt={alt}
      className="mt-4 max-h-[360px] w-full rounded-2xl border border-slate-100 object-contain bg-white"
      onError={(event) => {
        event.currentTarget.style.display = "none";
      }}
    />
  );
}

export default function AdminMockQuestions() {
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);

  const sortedQuestions = useMemo(
    () => [...questions].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0)),
    [questions]
  );

  const load = async () => {
    setLoading(true);
    try {
      const [examRes, questionRes] = await Promise.all([
        adminApi.detail("mock-exams", examId),
        adminApi.mockQuestions(examId),
      ]);
      setExam(getResult(examRes));
      setQuestions(getResult(questionRes));
    } catch (err) {
      setToast(err.response?.data?.message || "Không tải được câu hỏi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [examId]);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const edit = (question) => {
    setEditing(question);
    setForm({ ...emptyForm, ...question, imageUrl: question.imageUrl || "" });
  };

  const reset = () => {
    setEditing(null);
    setForm(emptyForm);
  };

  const uploadImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setToast("");
    try {
      const response = await adminApi.uploadMockQuestionImage(file);
      const result = getResult(response);
      update("imageUrl", result.imageUrl || "");
      setToast("Đã upload ảnh câu hỏi.");
    } catch (err) {
      setToast(err.response?.data?.message || "Upload ảnh thất bại.");
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  const save = async (event) => {
    event.preventDefault();
    if (uploadingImage) return;

    const payload = {
      ...form,
      imageUrl: form.imageUrl?.trim() || null,
    };

    try {
      if (editing?.id) {
        await adminApi.updateMockQuestion(editing.id, payload);
        setToast("Đã cập nhật câu hỏi.");
      } else {
        await adminApi.createMockQuestion(examId, payload);
        setToast("Đã thêm câu hỏi.");
      }
      reset();
      await load();
    } catch (err) {
      setToast(err.response?.data?.message || "Không lưu được câu hỏi.");
    }
  };

  const remove = async (question) => {
    if (!window.confirm("Xóa câu hỏi này?")) return;
    try {
      await adminApi.deleteMockQuestion(question.id);
      setToast("Đã xóa câu hỏi.");
      await load();
    } catch (err) {
      setToast(err.response?.data?.message || "Không xóa được câu hỏi.");
    }
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <Link to="/admin/mock-exams" className="text-xs font-black text-[#00a8b5] inline-flex items-center gap-2 mb-4">
            <Icon icon="lucide:arrow-left" /> Quay lại danh sách đề
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0f2c3f]">Quản lý câu hỏi trong đề</h1>
          <p className="text-sm text-slate-500 mt-2">{exam?.title || `Đề #${examId}`}</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl px-5 py-4 shadow-sm w-fit">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Số câu</p>
          <p className="text-2xl font-black text-[#0f2c3f]">{questions.length}</p>
        </div>
      </section>

      {toast && <div className="bg-cyan-50 border border-cyan-100 rounded-2xl px-4 py-3 text-sm font-bold text-[#0f2c3f]">{toast}</div>}

      <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_440px] gap-6">
        <div className="min-w-0 bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center font-bold text-slate-500">Đang tải...</div>
          ) : sortedQuestions.length === 0 ? (
            <div className="p-12 text-center font-bold text-slate-500">Chưa có câu hỏi</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {sortedQuestions.map((question) => (
                <article key={question.id} className="p-5 hover:bg-slate-50/60">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">Câu {question.orderIndex}</p>
                      <h2 className="font-black text-[#0f2c3f] mt-1 whitespace-pre-wrap">{question.questionText}</h2>
                    </div>
                    <span className="w-fit bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full px-3 py-1 text-[10px] font-black">
                      Đáp án {question.correctOption}
                    </span>
                  </div>

                  <QuestionImage src={question.imageUrl} alt={`Ảnh câu ${question.orderIndex}`} />

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {optionItems.map((option) => (
                      <div key={option} className={`rounded-xl px-3 py-2 border ${question.correctOption === option ? "bg-emerald-50 border-emerald-100" : "bg-slate-50 border-slate-100"}`}>
                        <span className="font-black mr-2">{option}.</span>{question[`option${option}`]}
                      </div>
                    ))}
                  </div>
                  {question.explanation && <p className="mt-3 text-sm text-slate-500 whitespace-pre-wrap">{question.explanation}</p>}
                  <div className="mt-4 flex justify-end gap-2">
                    <button onClick={() => edit(question)} className="bg-slate-100 px-3 py-2 rounded-lg text-xs font-black">Sửa</button>
                    <button onClick={() => remove(question)} className="bg-rose-50 text-rose-600 px-3 py-2 rounded-lg text-xs font-black">Xóa</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="bg-white border border-slate-100 rounded-[2rem] shadow-sm p-5 h-fit xl:sticky xl:top-24">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-black">{editing ? "Sửa câu hỏi" : "Thêm câu hỏi"}</h2>
            {editing && <button onClick={reset} className="text-xs font-black text-slate-400">Hủy</button>}
          </div>
          <form onSubmit={save} className="space-y-4">
            <input value={form.orderIndex} onChange={(event) => update("orderIndex", event.target.value)} type="number" min="1" required placeholder="Thứ tự câu hỏi" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none" />
            <textarea value={form.questionText} onChange={(event) => update("questionText", event.target.value)} required rows={4} placeholder="Nội dung câu hỏi" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none" />

            <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <label className="block">
                <span className="block text-[10px] uppercase tracking-widest text-slate-400 font-black mb-2">
                  Link ảnh câu hỏi
                </span>
                <input
                  value={form.imageUrl}
                  onChange={(event) => update("imageUrl", event.target.value)}
                  placeholder="/uploads/mock-questions/abc.png hoặc URL ảnh"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none"
                />
              </label>

              <label className="block">
                <span className="block text-[10px] uppercase tracking-widest text-slate-400 font-black mb-2">
                  Upload ảnh từ máy
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={uploadImage}
                  disabled={uploadingImage}
                  className="block w-full rounded-xl border border-dashed border-slate-300 bg-white px-4 py-4 text-sm font-bold text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-[#0f2c3f] file:px-4 file:py-2 file:text-xs file:font-black file:text-white disabled:opacity-60"
                />
              </label>

              {uploadingImage && (
                <p className="text-xs font-black text-[#00a8b5] inline-flex items-center gap-2">
                  <Icon icon="lucide:loader-2" className="animate-spin" />
                  Đang upload ảnh...
                </p>
              )}

              <QuestionImage src={form.imageUrl} alt="Preview ảnh câu hỏi" />
            </div>

            {optionItems.map((option) => (
              <input key={option} value={form[`option${option}`]} onChange={(event) => update(`option${option}`, event.target.value)} required placeholder={`Đáp án ${option}`} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none" />
            ))}
            <select value={form.correctOption} onChange={(event) => update("correctOption", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none">
              {optionItems.map((option) => <option key={option} value={option}>Đáp án đúng {option}</option>)}
            </select>
            <textarea value={form.explanation} onChange={(event) => update("explanation", event.target.value)} rows={4} placeholder="Giải thích" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none" />

            <div className="bg-slate-50 rounded-2xl p-4">
              <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-2">Preview</p>
              <p className="font-black text-sm text-[#0f2c3f] whitespace-pre-wrap">{form.questionText || "Nội dung câu hỏi"}</p>
              <QuestionImage src={form.imageUrl} alt="Preview ảnh câu hỏi" />
            </div>

            <button disabled={uploadingImage} className="w-full bg-[#0f2c3f] text-white rounded-xl px-5 py-3 text-xs font-black disabled:opacity-60">
              {uploadingImage ? "Đang upload ảnh..." : "Lưu câu hỏi"}
            </button>
          </form>
        </aside>
      </section>
    </div>
  );
}
