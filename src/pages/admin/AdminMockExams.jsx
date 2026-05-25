import { useState } from "react";
import { Icon } from "@iconify/react";
import AdminCrudPage from "./AdminCrudPage";
import { adminApi, getResult } from "../../services/adminService";
import { resolveMediaUrl } from "../../utils/mediaUrl";

const questionColumns = ["order_index", "question_text", "image_url", "option_a", "option_b", "option_c", "option_d"];
const answerColumns = ["order_index", "correct_option", "explanation"];

const guideScenarios = [
  {
    icon: "lucide:file-plus-2",
    title: "Tạo đề mới bằng Excel",
    tone: "cyan",
    steps: [
      "Bấm Tạo đề và nhập môn học, tổ hợp, tên đề, mức độ, năm, thời gian làm bài.",
      "Sau khi lưu, đề ở trạng thái DRAFT nên user chưa nhìn thấy.",
      "Bấm Upload file đề và chọn file Excel chứa câu hỏi theo đúng cột bắt buộc.",
      "Upload file đáp án, Preview câu hỏi, rồi Publish đề khi dữ liệu đã đúng.",
    ],
  },
  {
    icon: "lucide:image",
    title: "Câu hỏi có ảnh minh họa",
    tone: "blue",
    steps: [
      "Nếu muốn thêm ảnh thủ công, vào Câu hỏi và upload ảnh trong form thêm hoặc sửa câu hỏi.",
      "Nếu muốn import bằng Excel, upload ảnh trước rồi copy imageUrl vào cột image_url.",
      "Cột image_url có thể để trống, không bắt buộc câu nào cũng phải có ảnh.",
      "Không đổi tên cột image_url vì backend đọc theo tên cột chuẩn.",
    ],
  },
  {
    icon: "lucide:key-round",
    title: "Upload đáp án sau khi có câu hỏi",
    tone: "emerald",
    steps: [
      "Bấm Upload đáp án ở đúng dòng đề thi.",
      "File đáp án phải có order_index khớp hoàn toàn với file câu hỏi.",
      "correct_option chỉ nhận A, B, C hoặc D; explanation có thể để trống.",
      "Nếu thiếu đáp án cho câu nào, hệ thống sẽ báo lỗi và chưa cho publish.",
    ],
  },
  {
    icon: "lucide:eye",
    title: "Kiểm tra trước khi publish",
    tone: "blue",
    steps: [
      "Bấm Preview câu hỏi để xem nội dung vừa import.",
      "Kiểm tra thứ tự câu, lựa chọn A/B/C/D, đáp án đúng và giải thích.",
      "Câu nào còn nhãn Thiếu đáp án thì cần upload lại file đáp án hoặc sửa thủ công.",
      "Chỉ publish khi toàn bộ câu hỏi đã có đáp án đúng hợp lệ.",
    ],
  },
  {
    icon: "lucide:pencil-line",
    title: "Sửa lỗi nhỏ thủ công",
    tone: "slate",
    steps: [
      "Bấm Câu hỏi để vào màn hình quản lý câu hỏi của đề.",
      "Sửa nội dung câu hỏi, lựa chọn, đáp án đúng hoặc giải thích từng câu.",
      "orderIndex không được trùng trong cùng một đề thi.",
      "Quay lại danh sách đề, Preview lại rồi Publish nếu đề đang ở DRAFT.",
    ],
  },
  {
    icon: "lucide:triangle-alert",
    title: "Khi file upload báo lỗi",
    tone: "amber",
    steps: [
      "Đọc danh sách lỗi theo từng dòng ở khung kết quả upload.",
      "Sửa header, dòng trống, order_index trùng, câu hỏi trống hoặc đáp án sai định dạng.",
      "Upload lại file sau khi sửa; nếu có lỗi, hệ thống không ghi dữ liệu lỗi vào DB.",
      "Không đổi tên các cột template vì backend đọc theo tên cột chuẩn.",
    ],
  },
  {
    icon: "lucide:send",
    title: "Sau khi đề đã ACTIVE",
    tone: "rose",
    steps: [
      "User chỉ thấy và làm được đề có trạng thái ACTIVE.",
      "Nếu cần sửa đáp án hoặc giải thích, dùng Câu hỏi hoặc Upload đáp án rồi kiểm tra lại.",
      "Nếu thay đổi lớn toàn bộ đề, nên tạo một đề mới ở DRAFT để kiểm tra trước.",
      "Backend vẫn không trả correctOption cho user khi đang làm bài.",
    ],
  },
];

const guideToneClass = {
  cyan: "bg-cyan-50 text-[#00a8b5] border-cyan-100",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
  blue: "bg-blue-50 text-blue-700 border-blue-100",
  slate: "bg-slate-50 text-slate-700 border-slate-200",
  amber: "bg-amber-50 text-amber-700 border-amber-100",
  rose: "bg-rose-50 text-rose-700 border-rose-100",
};

function importResultFromError(err) {
  return err.response?.data?.result || null;
}

function messageFromError(err, fallback) {
  const result = importResultFromError(err);
  if (result?.errors?.length) return result.errors.join("\n");
  return err.response?.data?.message || fallback;
}

function combinationSubjectWarning(form, refs) {
  if (!form.subjectId || !form.combinationId) return "";

  const combination = (refs.combinations || []).find(
    (item) => String(item.id) === String(form.combinationId)
  );
  if (!combination) return "";

  const subjectIds = Array.isArray(combination.subjectIds)
    ? combination.subjectIds
    : (combination.subjects || []).map((subject) => subject.id);

  return subjectIds.map(String).includes(String(form.subjectId))
    ? ""
    : "Môn học này không nằm trong tổ hợp đã chọn";
}

export default function AdminMockExams() {
  const [uploadTarget, setUploadTarget] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [previewState, setPreviewState] = useState(null);
  const [actionMessage, setActionMessage] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [showGuide, setShowGuide] = useState(false);

  const openUpload = (exam, type) => {
    setUploadTarget({ exam, type });
    setUploadFile(null);
    setUploadResult(null);
    setActionMessage("");
  };

  const closeUpload = () => {
    setUploadTarget(null);
    setUploadFile(null);
    setUploadResult(null);
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!uploadTarget || !uploadFile) return;

    setUploading(true);
    setUploadResult(null);
    setActionMessage("");
    try {
      const response = uploadTarget.type === "questions"
        ? await adminApi.uploadMockQuestions(uploadTarget.exam.id, uploadFile)
        : await adminApi.uploadMockAnswers(uploadTarget.exam.id, uploadFile);
      const result = getResult(response);
      setUploadResult(result);
      setActionMessage(uploadTarget.type === "questions" ? "Đã import file đề." : "Đã cập nhật file đáp án.");
      setRefreshKey((value) => value + 1);
    } catch (err) {
      const result = importResultFromError(err);
      setUploadResult(result || { success: false, errors: [messageFromError(err, "Upload file thất bại.")] });
    } finally {
      setUploading(false);
    }
  };

  const handlePublish = async (exam) => {
    if (!window.confirm(`Publish đề "${exam.title}" để user có thể làm bài?`)) return;
    setActionMessage("");
    try {
      await adminApi.publishMockExam(exam.id);
      setActionMessage("Đã publish đề thi. User chỉ nhìn thấy đề ở trạng thái ACTIVE.");
      setRefreshKey((value) => value + 1);
    } catch (err) {
      setActionMessage(err.response?.data?.message || "Không publish được đề thi.");
    }
  };

  const handlePreview = async (exam) => {
    setPreviewState({ exam, questions: [], loading: true, error: "" });
    setActionMessage("");
    try {
      const response = await adminApi.previewMockQuestions(exam.id);
      setPreviewState({ exam, questions: getResult(response), loading: false, error: "" });
    } catch (err) {
      setPreviewState({
        exam,
        questions: [],
        loading: false,
        error: err.response?.data?.message || "Không tải được preview câu hỏi.",
      });
    }
  };

  const currentColumns = uploadTarget?.type === "questions" ? questionColumns : answerColumns;

  return (
    <AdminCrudPage
      title="Quản lý đề thi thử"
      description="Tạo đề, upload file câu hỏi và đáp án từ Excel, preview nội dung rồi publish để user vào làm bài."
      endpoint="mock-exams"
      refreshKey={refreshKey}
      createLabel="Tạo đề"
      compactActions
      primaryActionLabel="Câu hỏi"
      tableMinWidthClass="min-w-[1040px]"
      mobileCardTitle={(row) => row.title}
      mobileCardFields={[
        { key: "subjectName", label: "Môn" },
        { key: "difficulty", label: "Mức độ" },
        { key: "year", label: "Năm" },
        { key: "durationMinutes", label: "Thời gian" },
        { key: "totalQuestions", label: "Số câu" },
        { key: "combinationCode", label: "Tổ hợp" },
      ]}
      loadRefs={async () => {
        const [subjects, combinations] = await Promise.all([adminApi.examSubjects(), adminApi.examCombinations()]);
        return {
          subjects: getResult(subjects),
          combinations: getResult(combinations).map((item) => ({ ...item, label: `${item.code} - ${item.name}` })),
        };
      }}
      columns={[
        { key: "id", label: "ID" },
        { key: "title", label: "Tên đề" },
        { key: "subjectName", label: "Môn" },
        { key: "combinationCode", label: "Tổ hợp" },
        { key: "difficulty", label: "Mức độ" },
        { key: "year", label: "Năm" },
        { key: "durationMinutes", label: "Phút" },
        { key: "totalQuestions", label: "Câu hỏi" },
        {
          key: "status",
          label: "Trạng thái",
          render: (row) => row.status || "DRAFT",
        },
      ]}
      fields={[
        { name: "subjectId", label: "Môn học", type: "select", optionsKey: "subjects", required: true },
        {
          name: "combinationId",
          label: "Tổ hợp",
          type: "select",
          optionsKey: "combinations",
          getWarning: combinationSubjectWarning,
        },
        { name: "title", label: "Tên đề", required: true },
        { name: "difficulty", label: "Mức độ", type: "select", defaultValue: "MEDIUM", options: ["EASY", "MEDIUM", "HARD"].map((value) => ({ value, label: value })) },
        { name: "year", label: "Năm", type: "number" },
        { name: "durationMinutes", label: "Thời gian làm bài", type: "number", min: 1 },
      ]}
      rowActions={(row) => [
        { label: "Câu hỏi", to: `/admin/mock-exams/${row.id}/questions`, icon: "lucide:list-checks", primary: true },
        { label: "Upload file đề", onClick: () => openUpload(row, "questions"), icon: "lucide:file-up" },
        { label: "Upload đáp án", onClick: () => openUpload(row, "answers"), icon: "lucide:upload" },
        { label: "Preview câu hỏi", onClick: () => handlePreview(row), icon: "lucide:eye", variant: "neutral" },
        {
          label: row.status === "ACTIVE" ? "Đã publish" : "Publish đề",
          onClick: () => handlePublish(row),
          icon: "lucide:send",
          variant: "success",
          disabled: row.status === "ACTIVE",
        },
      ]}
    >
      <section className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-widest font-black text-[#00a8b5]">
              Hướng dẫn tạo đề
            </span>
            <h2 className="mt-1 text-2xl font-black text-[#0f2c3f]">Cần hướng dẫn nhập đề thi thử?</h2>
            <p className="mt-2 max-w-3xl text-sm font-semibold leading-relaxed text-slate-500">
              Bấm nút hướng dẫn để xem từng bước tạo đề theo các trường hợp: tạo mới, upload câu hỏi, upload đáp án, preview, publish và xử lý lỗi file.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowGuide((value) => !value)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0f2c3f] px-5 py-3 text-xs font-black text-white hover:bg-[#1a4a69] lg:w-auto"
          >
            <Icon icon={showGuide ? "lucide:chevron-up" : "lucide:book-open-check"} />
            {showGuide ? "Ẩn hướng dẫn" : "Hướng dẫn tạo đề"}
          </button>
        </div>
      </section>

      {showGuide && (
      <section className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-widest font-black text-[#00a8b5]">
              Hướng dẫn quản lý đề thi thử
            </span>
            <h2 className="mt-1 text-2xl font-black text-[#0f2c3f]">Quy trình theo từng trường hợp</h2>
            <p className="mt-2 max-w-3xl text-sm font-semibold leading-relaxed text-slate-500">
              Làm theo đúng thứ tự để đề luôn ở trạng thái DRAFT trong lúc nhập liệu, chỉ publish khi câu hỏi và đáp án đã kiểm tra xong.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 min-w-full xl:min-w-[360px]">
            <h3 className="text-sm font-black text-[#0f2c3f]">Template Excel</h3>
            <div className="mt-3 space-y-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">File đề</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {questionColumns.map((column) => (
                    <span key={column} className="rounded-lg bg-white px-2.5 py-1.5 text-[10px] font-black text-slate-600 border border-slate-100">
                      {column}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">File đáp án</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {answerColumns.map((column) => (
                    <span key={column} className="rounded-lg bg-white px-2.5 py-1.5 text-[10px] font-black text-slate-600 border border-slate-100">
                      {column}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <a
                href="/templates/mock_exam_questions_template.xlsx"
                download
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f2c3f] px-4 py-2.5 text-xs font-black text-white hover:bg-[#1a4a69]"
              >
                <Icon icon="lucide:download" />
                Tải file mẫu đề thi
              </a>
              <a
                href="/templates/mock_exam_answers_template.xlsx"
                download
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-50 px-4 py-2.5 text-xs font-black text-[#00a8b5] hover:bg-cyan-100"
              >
                <Icon icon="lucide:download" />
                Tải file mẫu đáp án
              </a>
            </div>
            <p className="mt-3 text-xs font-bold leading-relaxed text-amber-700">
              File đề có thể thêm cột image_url để gắn ảnh minh họa. Không đổi tên cột template vì backend đọc theo tên cột chuẩn.
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
          {guideScenarios.map((scenario) => (
            <article key={scenario.title} className={`rounded-2xl border p-4 ${guideToneClass[scenario.tone]}`}>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/80">
                  <Icon icon={scenario.icon} className="text-xl" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#0f2c3f]">{scenario.title}</h3>
                  <ol className="mt-3 space-y-2 text-xs font-bold leading-relaxed text-slate-600">
                    {scenario.steps.map((step, index) => (
                      <li key={step} className="flex gap-2">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-black">
                          {index + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
      )}

      {actionMessage && (
        <div className="rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm font-bold text-[#0f2c3f] flex items-start gap-2 whitespace-pre-line">
          <Icon icon="lucide:info" className="mt-0.5 text-[#00a8b5]" />
          {actionMessage}
        </div>
      )}

      {uploadTarget && (
        <section className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-widest font-black text-[#00a8b5]">
                {uploadTarget.type === "questions" ? "Upload file đề" : "Upload file đáp án"}
              </span>
              <h2 className="text-xl font-black text-[#0f2c3f] mt-1">{uploadTarget.exam.title}</h2>
              <p className="text-sm text-slate-500 mt-2">
                Dùng file Excel có đúng header. Hệ thống sẽ validate toàn bộ file trước khi ghi vào database.
              </p>
            </div>
            <button
              type="button"
              onClick={closeUpload}
              className="self-start rounded-xl bg-slate-100 px-4 py-2 text-xs font-black text-slate-600 hover:bg-slate-200"
            >
              Đóng
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
            <form onSubmit={handleUpload} className="space-y-4">
              <label className="block">
                <span className="block text-[10px] uppercase tracking-widest text-slate-400 font-black mb-2">
                  Chọn file Excel
                </span>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(event) => setUploadFile(event.target.files?.[0] || null)}
                  className="block w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm font-bold text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-[#0f2c3f] file:px-4 file:py-2 file:text-xs file:font-black file:text-white"
                  required
                />
              </label>

              <button
                disabled={uploading || !uploadFile}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0f2c3f] px-5 py-3 text-xs font-black text-white hover:bg-[#1a4a69] disabled:opacity-60"
              >
                <Icon icon={uploading ? "lucide:loader-2" : "lucide:upload"} className={uploading ? "animate-spin" : ""} />
                {uploading ? "Đang upload..." : "Upload và kiểm tra"}
              </button>
            </form>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <h3 className="text-sm font-black text-[#0f2c3f]">Cột trong template</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {currentColumns.map((column) => (
                  <span key={column} className="rounded-lg bg-white px-3 py-2 text-[11px] font-black text-slate-600 border border-slate-100">
                    {column}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-xs font-semibold text-slate-500 leading-relaxed">
                File đề có thể để trống `image_url`. File đáp án phải khớp `order_index` với file đề, nếu thiếu đáp án đúng thì không thể publish.
              </p>
            </div>
          </div>

          {uploadResult && (
            <div className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${
              uploadResult.success
                ? "border-emerald-100 bg-emerald-50 text-emerald-800"
                : "border-rose-100 bg-rose-50 text-rose-700"
            }`}>
              <div className="font-black">
                {uploadResult.success
                  ? `Thành công: ${uploadResult.importedCount || uploadResult.updatedCount || 0} dòng`
                  : "File có lỗi, chưa ghi dữ liệu"}
              </div>
              {uploadResult.errors?.length > 0 && (
                <ul className="mt-2 list-disc pl-5 space-y-1 font-semibold">
                  {uploadResult.errors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>
      )}

      {previewState && (
        <section className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-widest font-black text-[#00a8b5]">
                Preview câu hỏi
              </span>
              <h2 className="text-xl font-black text-[#0f2c3f] mt-1">{previewState.exam.title}</h2>
              <p className="text-sm text-slate-500 mt-2">
                Kiểm tra nội dung câu hỏi, đáp án đúng và giải thích trước khi publish.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPreviewState(null)}
              className="self-start rounded-xl bg-slate-100 px-4 py-2 text-xs font-black text-slate-600 hover:bg-slate-200"
            >
              Đóng
            </button>
          </div>

          <div className="mt-5 max-h-[520px] overflow-y-auto space-y-3 pr-1">
            {previewState.loading ? (
              <div className="rounded-2xl bg-slate-50 p-8 text-center text-sm font-bold text-slate-500">
                <Icon icon="lucide:loader-2" className="mx-auto mb-2 animate-spin text-2xl text-[#00a8b5]" />
                Đang tải preview...
              </div>
            ) : previewState.error ? (
              <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-bold text-rose-700">
                {previewState.error}
              </div>
            ) : previewState.questions.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 p-8 text-center text-sm font-bold text-slate-500">
                Chưa có câu hỏi trong đề này.
              </div>
            ) : (
              previewState.questions.map((question) => (
                <article key={question.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <h3 className="text-sm font-black text-[#0f2c3f]">
                      Câu {question.orderIndex}: {question.questionText}
                    </h3>
                    <span className={`rounded-full px-3 py-1 text-[10px] font-black ${
                      question.correctOption ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {question.correctOption ? `Đáp án ${question.correctOption}` : "Thiếu đáp án"}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-semibold text-slate-600">
                    <div>A. {question.optionA}</div>
                    <div>B. {question.optionB}</div>
                    <div>C. {question.optionC}</div>
                    <div>D. {question.optionD}</div>
                  </div>
                  {question.imageUrl && (
                    <img
                      src={resolveMediaUrl(question.imageUrl)}
                      alt={`Ảnh câu ${question.orderIndex}`}
                      className="mt-3 max-h-[320px] w-full rounded-2xl border border-slate-100 bg-white object-contain"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  )}
                  {question.explanation && (
                    <p className="mt-3 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-500">
                      {question.explanation}
                    </p>
                  )}
                </article>
              ))
            )}
          </div>
        </section>
      )}
    </AdminCrudPage>
  );
}
