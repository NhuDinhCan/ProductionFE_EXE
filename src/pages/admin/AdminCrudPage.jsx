import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import { adminApi, getResult } from "../../services/adminService";

const emptyValue = (field) => {
  if (field.type === "multiselect") return [];
  return field.defaultValue ?? "";
};

const toForm = (fields, item = {}) =>
  fields.reduce((form, field) => {
    form[field.name] = item[field.name] ?? emptyValue(field);
    return form;
  }, {});

const MENU_WIDTH = 224;

function displayValue(row, column) {
  const value = column.render ? column.render(row) : row[column.key];
  if (Array.isArray(value)) return value.join(", ");
  if (value === null || value === undefined || value === "") return "-";
  return value;
}

function actionClass(action) {
  const variants = {
    danger: "bg-rose-50 text-rose-600 hover:bg-rose-100",
    success: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    warning: "bg-amber-50 text-amber-700 hover:bg-amber-100",
    dark: "bg-[#0f2c3f] text-white hover:bg-[#1a4a69]",
    neutral: "bg-slate-100 text-slate-600 hover:bg-slate-200",
  };
  return `rounded-lg px-3 py-2 text-[11px] font-black inline-flex items-center gap-1.5 transition ${
    variants[action.variant] || "bg-cyan-50 text-[#00a8b5] hover:bg-cyan-100"
  } ${action.disabled ? "opacity-50 cursor-not-allowed" : ""}`;
}

function menuActionClass(action) {
  const variants = {
    danger: "text-rose-600 hover:bg-rose-50",
    success: "text-emerald-700 hover:bg-emerald-50",
    warning: "text-amber-700 hover:bg-amber-50",
    neutral: "text-slate-600 hover:bg-slate-50",
  };
  return `w-full rounded-xl px-3 py-2.5 text-left text-xs font-black inline-flex items-center gap-2 transition ${
    variants[action.variant] || "text-[#0f2c3f] hover:bg-cyan-50"
  } ${action.disabled ? "opacity-50 cursor-not-allowed" : ""}`;
}

function optionValue(option) {
  return option.value ?? option.id;
}

function optionLabel(option) {
  return option.label ?? option.name ?? option.title ?? option.code;
}

export default function AdminCrudPage({
  title,
  description,
  endpoint,
  columns,
  fields,
  loadRefs,
  transformSubmit,
  rowActions,
  createLabel = "Thêm mới",
  refreshKey = 0,
  children,
  compactActions = false,
  primaryActionLabel = "Câu hỏi",
  mobileCardTitle,
  mobileCardFields,
  tableMinWidthClass = "min-w-[920px]",
}) {
  const [items, setItems] = useState([]);
  const [refs, setRefs] = useState({});
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(toForm(fields));
  const [toast, setToast] = useState("");
  const [actionMenu, setActionMenu] = useState(null);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return items;
    const needle = query.trim().toLowerCase();
    return items.filter((item) => JSON.stringify(item).toLowerCase().includes(needle));
  }, [items, query]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [listResponse, refsResponse] = await Promise.all([
        adminApi.list(endpoint),
        loadRefs ? loadRefs() : Promise.resolve({}),
      ]);
      setItems(getResult(listResponse));
      setRefs(refsResponse || {});
    } catch (err) {
      setToast(err.response?.data?.message || "Không tải được dữ liệu.");
    } finally {
      setLoading(false);
    }
  }, [endpoint, loadRefs]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      load();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [load, refreshKey]);

  useEffect(() => {
    if (!actionMenu) return undefined;

    const close = () => setActionMenu(null);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    window.addEventListener("click", close);

    return () => {
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("click", close);
    };
  }, [actionMenu]);

  const openCreate = () => {
    setEditing(null);
    setForm(toForm(fields));
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm(toForm(fields, item));
    setActionMenu(null);
  };

  const closeForm = () => {
    setEditing(null);
    setForm(toForm(fields));
  };

  const updateForm = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setToast("");
    try {
      const payload = transformSubmit ? transformSubmit(form) : form;
      if (editing?.id) {
        await adminApi.update(endpoint, editing.id, payload);
        setToast("Đã cập nhật dữ liệu.");
      } else {
        await adminApi.create(endpoint, payload);
        setToast("Đã tạo dữ liệu mới.");
      }
      closeForm();
      await load();
    } catch (err) {
      setToast(err.response?.data?.message || err.message || "Không lưu được dữ liệu.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    setActionMenu(null);
    if (!window.confirm("Bạn chắc chắn muốn xóa mục này?")) return;
    try {
      await adminApi.remove(endpoint, item.id);
      setToast("Đã xóa dữ liệu.");
      await load();
    } catch (err) {
      setToast(err.response?.data?.message || "Không xóa được dữ liệu.");
    }
  };

  const renderAction = (action, index) => {
    const content = (
      <>
        {action.icon && <Icon icon={action.icon} />}
        {action.label}
      </>
    );

    if (action.to) {
      return (
        <Link key={`${action.label}-${index}`} to={action.to} className={actionClass(action)}>
          {content}
        </Link>
      );
    }

    return (
      <button
        key={`${action.label}-${index}`}
        type="button"
        disabled={action.disabled}
        onClick={action.onClick}
        className={actionClass(action)}
      >
        {content}
      </button>
    );
  };

  const renderMenuAction = (action, index) => {
    const content = (
      <>
        {action.icon && <Icon icon={action.icon} className="text-base" />}
        <span>{action.label}</span>
      </>
    );

    if (action.to) {
      return (
        <Link
          key={`${action.label}-${index}`}
          to={action.to}
          onClick={() => setActionMenu(null)}
          className={menuActionClass(action)}
        >
          {content}
        </Link>
      );
    }

    return (
      <button
        key={`${action.label}-${index}`}
        type="button"
        disabled={action.disabled}
        onClick={() => {
          if (action.disabled) return;
          setActionMenu(null);
          action.onClick?.();
        }}
        className={menuActionClass(action)}
      >
        {content}
      </button>
    );
  };

  const actionListFor = (item) => [
    ...(rowActions?.(item) || []),
    { label: "Sửa", icon: "lucide:pencil", variant: "neutral", onClick: () => openEdit(item) },
    { label: "Xóa", icon: "lucide:trash-2", variant: "danger", onClick: () => handleDelete(item) },
  ];

  const splitActions = (item) => {
    const actions = actionListFor(item);
    const primaryIndex = actions.findIndex((action) => action.primary || action.label === primaryActionLabel);
    const index = primaryIndex >= 0 ? primaryIndex : 0;
    return {
      primary: actions[index],
      secondary: actions.filter((_, actionIndex) => actionIndex !== index),
    };
  };

  const rowMenuKey = (item) => `${endpoint}-${item.id ?? JSON.stringify(item)}`;

  const openActionMenu = (event, item, actions) => {
    event.stopPropagation();
    const menuKey = rowMenuKey(item);

    if (actionMenu?.id === menuKey) {
      setActionMenu(null);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const gap = 8;
    const left = Math.min(
      Math.max(12, rect.right - MENU_WIDTH),
      window.innerWidth - MENU_WIDTH - 12
    );
    const top = Math.min(rect.bottom + gap, window.innerHeight - 12);

    setActionMenu({
      id: menuKey,
      actions,
      left,
      top,
    });
  };

  const renderCompactActions = (item) => {
    const { primary, secondary } = splitActions(item);

    return (
      <div className="inline-flex w-[132px] items-center justify-end gap-2">
        {primary && renderAction(primary, 0)}
        <button
          type="button"
          onClick={(event) => openActionMenu(event, item, secondary)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
          aria-label="Mở thao tác"
        >
          <Icon icon="lucide:more-horizontal" className="text-lg" />
        </button>
      </div>
    );
  };

  const renderActionMenuPortal = () => {
    if (!actionMenu || typeof document === "undefined") return null;

    return createPortal(
      <div
        className="fixed z-[9999] min-w-[190px] rounded-xl border border-slate-100 bg-white p-2 text-left shadow-2xl shadow-slate-300/70"
        style={{ left: actionMenu.left, top: actionMenu.top, width: MENU_WIDTH }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-col gap-1">
          {actionMenu.actions.map(renderMenuAction)}
        </div>
      </div>,
      document.body
    );
  };

  const renderInlineActions = (item) => (
    <div className="inline-flex flex-nowrap justify-end items-center gap-2">
      {rowActions?.(item)?.map(renderAction)}
      <button onClick={() => openEdit(item)} className="rounded-lg bg-slate-100 px-3 py-2 text-[11px] font-black text-slate-600 hover:bg-slate-200">Sửa</button>
      <button onClick={() => handleDelete(item)} className="rounded-lg bg-rose-50 px-3 py-2 text-[11px] font-black text-rose-600 hover:bg-rose-100">Xóa</button>
    </div>
  );

  const renderField = (field) => {
    const commonClass = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#00a8b5]/20";
    const value = form[field.name] ?? emptyValue(field);

    if (field.type === "textarea") {
      return (
        <textarea
          rows={field.rows || 4}
          value={value}
          onChange={(event) => updateForm(field.name, event.target.value)}
          className={commonClass}
          required={field.required}
        />
      );
    }

    if (field.type === "select") {
      const options = field.options || refs[field.optionsKey] || [];
      return (
        <select
          value={value}
          onChange={(event) => updateForm(field.name, event.target.value)}
          className={commonClass}
          required={field.required}
        >
          <option value="">Chọn...</option>
          {options.map((option) => (
            <option key={optionValue(option)} value={optionValue(option)}>
              {optionLabel(option)}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === "multiselect") {
      const options = field.options || refs[field.optionsKey] || [];
      const values = Array.isArray(value) ? value.map(String) : [];
      const toggleValue = (nextValue) => {
        const normalized = String(nextValue);
        const nextValues = values.includes(normalized)
          ? values.filter((item) => item !== normalized)
          : [...values, normalized];
        updateForm(field.name, nextValues);
      };

      return (
        <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3">
          {options.length === 0 ? (
            <p className="px-1 py-2 text-sm font-bold text-slate-400">Chưa có lựa chọn</p>
          ) : (
            <div className="space-y-2">
              {options.map((option) => {
                const rawValue = optionValue(option);
                const checked = values.includes(String(rawValue));

                return (
                  <label
                    key={rawValue}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm font-bold text-slate-700 hover:bg-white"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleValue(rawValue)}
                      className="h-4 w-4 rounded border-slate-300 text-[#00a8b5] focus:ring-[#00a8b5]"
                    />
                    <span>{optionLabel(option)}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return (
      <input
        type={field.type || "text"}
        value={value}
        onChange={(event) => updateForm(field.name, event.target.value)}
        className={commonClass}
        required={field.required}
        min={field.min}
      />
    );
  };

  const renderMobileCards = () => {
    if (!mobileCardFields) return null;

    return (
      <div className="md:hidden p-3 space-y-3">
        {loading ? (
          <div className="p-8 text-center text-slate-500 font-bold">
            <Icon icon="lucide:loader-2" className="animate-spin text-3xl mx-auto mb-3 text-[#00a8b5]" />
            Đang tải dữ liệu...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-8 text-center text-slate-500 font-bold">Chưa có dữ liệu</div>
        ) : (
          filteredItems.map((item) => (
            <article key={item.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-base font-black text-[#0f2c3f] leading-snug">
                    {mobileCardTitle ? mobileCardTitle(item) : item.title || item.name || `#${item.id}`}
                  </h3>
                  <p className="mt-1 text-xs font-bold text-slate-400">ID {item.id}</p>
                </div>
                {item.status && (
                  <span className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-black ${
                    item.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                  }`}>
                    {item.status}
                  </span>
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                {mobileCardFields.map((field) => (
                  <div key={field.key} className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{field.label}</p>
                    <p className="mt-1 font-black text-slate-700 line-clamp-2">{displayValue(item, field)}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-end">
                {compactActions ? renderCompactActions(item) : renderInlineActions(item)}
              </div>
            </article>
          ))
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
        <div>
          <span className="bg-[#00a8b5] text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
            Admin module
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0f2c3f] mt-4">{title}</h1>
          <p className="text-sm text-slate-500 mt-2 max-w-2xl">{description}</p>
        </div>

        <button
          onClick={openCreate}
          className="bg-[#0f2c3f] text-white rounded-xl px-5 py-3 text-xs font-black hover:bg-[#1a4a69] inline-flex items-center justify-center gap-2"
        >
          <Icon icon="lucide:plus" />
          {createLabel}
        </button>
      </section>

      {toast && (
        <div className="bg-cyan-50 border border-cyan-100 text-[#0f2c3f] rounded-2xl px-4 py-3 text-sm font-bold flex items-center gap-2">
          <Icon icon="lucide:info" />
          {toast}
        </div>
      )}

      {children}

      <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] min-[1440px]:grid-cols-[minmax(0,1fr)_420px] gap-6">
        <div className="min-w-0 bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-visible">
          <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center gap-3 justify-between">
            <div className="relative flex-1 max-w-md">
              <Icon icon="lucide:search" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm kiếm..."
                className="w-full rounded-xl bg-slate-50 border border-slate-100 pl-11 pr-4 py-3 text-sm font-bold outline-none"
              />
            </div>
            <p className="text-xs font-black text-slate-400">{filteredItems.length} dòng</p>
          </div>

          <div className={`overflow-x-auto ${mobileCardFields ? "hidden md:block" : ""}`}>
            {loading ? (
              <div className="p-12 text-center text-slate-500 font-bold">
                <Icon icon="lucide:loader-2" className="animate-spin text-3xl mx-auto mb-3 text-[#00a8b5]" />
                Đang tải dữ liệu...
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="p-12 text-center text-slate-500 font-bold">Chưa có dữ liệu</div>
            ) : (
              <table className={`${tableMinWidthClass} w-full text-sm`}>
                <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-widest">
                  <tr>
                    {columns.map((column) => (
                      <th key={column.key} className="px-4 py-3 text-left font-black whitespace-nowrap">{column.label}</th>
                    ))}
                    <th className="sticky right-0 z-20 w-[140px] bg-slate-50 px-3 py-3 text-right font-black whitespace-nowrap">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="h-16 hover:bg-slate-50/60">
                      {columns.map((column) => (
                        <td key={column.key} className="px-4 py-3 align-middle text-slate-700 font-semibold max-w-xs">
                          <div className={compactActions ? "line-clamp-1" : "line-clamp-2"}>{displayValue(item, column)}</div>
                        </td>
                      ))}
                      <td className="sticky right-0 z-30 w-[140px] bg-white px-3 py-3 text-right whitespace-nowrap shadow-[-8px_0_18px_-18px_rgba(15,44,63,0.6)]">
                        {compactActions ? renderCompactActions(item) : renderInlineActions(item)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {renderMobileCards()}
        </div>

        <aside className="bg-white border border-slate-100 rounded-[2rem] shadow-sm p-5 h-fit lg:sticky lg:top-24">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-black">{editing?.id ? "Cập nhật" : createLabel}</h2>
            {editing?.id && (
              <button onClick={closeForm} className="text-xs font-black text-slate-400 hover:text-slate-600">Hủy</button>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            {fields.map((field) => (
              <div key={field.name} className="block">
                <span className="block text-[10px] uppercase tracking-widest text-slate-400 font-black mb-2">
                  {field.label}
                </span>
                {renderField(field)}
                {field.getWarning?.(form, refs) && (
                  <p className="mt-2 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">
                    {field.getWarning(form, refs)}
                  </p>
                )}
              </div>
            ))}

            <button
              disabled={saving}
              className="w-full bg-[#0f2c3f] text-white rounded-xl px-5 py-3 text-xs font-black hover:bg-[#1a4a69] disabled:opacity-60"
            >
              {saving ? "Đang lưu..." : "Lưu dữ liệu"}
            </button>
          </form>
        </aside>
      </section>

      {renderActionMenuPortal()}
    </div>
  );
}
