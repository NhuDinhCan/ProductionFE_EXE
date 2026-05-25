import { useEffect, useMemo, useState } from "react";
import { adminApi, getResult } from "../../services/adminService";

const roleOptions = ["USER", "ADMIN", "MENTOR"];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [toast, setToast] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return users;
    const needle = query.toLowerCase();
    return users.filter((user) => JSON.stringify(user).toLowerCase().includes(needle));
  }, [query, users]);

  const load = async () => {
    const response = await adminApi.users();
    setUsers(getResult(response));
  };

  useEffect(() => {
    load().catch((err) => setToast(err.response?.data?.message || "Không tải được user."));
  }, []);

  const edit = (user) => {
    setEditing(user);
    setForm({ ...user, birthday: user.birthday || "", roles: user.roles || [] });
  };

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const save = async (event) => {
    event.preventDefault();
    try {
      await adminApi.update("users", editing.id, form);
      await adminApi.updateUserRoles(editing.id, form.roles || []);
      setToast("Đã cập nhật user.");
      setEditing(null);
      await load();
    } catch (err) {
      setToast(err.response?.data?.message || "Không lưu được user.");
    }
  };

  const remove = async (user) => {
    if (!window.confirm("Xóa user này?")) return;
    try {
      await adminApi.remove("users", user.id);
      setToast("Đã xóa user.");
      await load();
    } catch (err) {
      setToast(err.response?.data?.message || "Không xóa được user.");
    }
  };

  const toggleRole = (role) => {
    const roles = new Set(form.roles || []);
    if (roles.has(role)) roles.delete(role);
    else roles.add(role);
    update("roles", Array.from(roles));
  };

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-black text-[#0f2c3f]">Quản lý user</h1>
        <p className="text-sm text-slate-500 mt-2">Tìm kiếm, sửa hồ sơ và gán role USER / ADMIN / MENTOR.</p>
      </section>
      {toast && <div className="bg-cyan-50 border border-cyan-100 rounded-2xl px-4 py-3 text-sm font-bold">{toast}</div>}
      <section className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6">
        <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm email hoặc tên..." className="w-full max-w-md rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 text-sm font-bold outline-none" />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-widest">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Tên</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-3 font-bold">{user.id}</td>
                    <td className="px-4 py-3 font-bold">{user.email}</td>
                    <td className="px-4 py-3">{user.firstName} {user.lastName}</td>
                    <td className="px-4 py-3">{(user.roles || []).join(", ")}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => edit(user)} className="bg-slate-100 px-3 py-2 rounded-lg text-xs font-black mr-2">Sửa</button>
                      <button onClick={() => remove(user)} className="bg-rose-50 text-rose-600 px-3 py-2 rounded-lg text-xs font-black">Xóa</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="bg-white border border-slate-100 rounded-[2rem] shadow-sm p-5 h-fit">
          <h2 className="text-lg font-black mb-5">{editing ? "Sửa user" : "Chọn user để sửa"}</h2>
          {editing && (
            <form onSubmit={save} className="space-y-4">
              {["email", "firstName", "lastName", "phone", "address", "avatar"].map((key) => (
                <input key={key} value={form[key] || ""} onChange={(event) => update(key, event.target.value)} placeholder={key} required={["email", "firstName", "lastName"].includes(key)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none" />
              ))}
              <input type="date" value={form.birthday || ""} onChange={(event) => update("birthday", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none" />
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-2">Roles</p>
                <div className="flex flex-wrap gap-2">
                  {roleOptions.map((role) => (
                    <button key={role} type="button" onClick={() => toggleRole(role)} className={`px-4 py-2 rounded-xl text-xs font-black ${form.roles?.includes(role) ? "bg-[#0f2c3f] text-white" : "bg-slate-100 text-slate-600"}`}>
                      {role}
                    </button>
                  ))}
                </div>
              </div>
              <button className="w-full bg-[#0f2c3f] text-white rounded-xl px-5 py-3 text-xs font-black">Lưu user</button>
            </form>
          )}
        </aside>
      </section>
    </div>
  );
}
