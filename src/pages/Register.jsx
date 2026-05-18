import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerApi } from "../services/authService";
import "../styles/auth.css";

export default function Register() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const payload = {
      email: form.email.trim(),
      password: form.password,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: form.phone.trim() || null,
    };

    try {
      await registerApi(payload);
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Đăng ký thất bại, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header-section">
          <h2>Đăng ký</h2>
          <p className="auth-subtitle">
            <strong>Tạo tài khoản <span className="brand-name">TGrowth</span></strong>
          </p>
        </div>

        <form onSubmit={handleRegister}>
          <div className="input-group">
            <input
              className={`auth-input ${error ? "input-error" : ""}`}
              type="email"
              placeholder="Email"
              value={form.email}
              required
              onChange={(event) => updateField("email", event.target.value)}
            />
          </div>

          <div className="input-group">
            <input
              className={`auth-input ${error ? "input-error" : ""}`}
              type="password"
              placeholder="Mật khẩu tối thiểu 8 ký tự"
              value={form.password}
              minLength={8}
              required
              onChange={(event) => updateField("password", event.target.value)}
            />
          </div>

          <div className="input-group">
            <input
              className={`auth-input ${error ? "input-error" : ""}`}
              type="text"
              placeholder="Họ"
              value={form.firstName}
              required
              onChange={(event) => updateField("firstName", event.target.value)}
            />
          </div>

          <div className="input-group">
            <input
              className={`auth-input ${error ? "input-error" : ""}`}
              type="text"
              placeholder="Tên"
              value={form.lastName}
              required
              onChange={(event) => updateField("lastName", event.target.value)}
            />
          </div>

          <div className="input-group">
            <input
              className={`auth-input ${error ? "input-error" : ""}`}
              type="tel"
              placeholder="Số điện thoại, ví dụ 0912345678"
              value={form.phone}
              pattern="^(\+84|0)[0-9]{9}$"
              onChange={(event) => updateField("phone", event.target.value)}
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button className="auth-button" disabled={loading}>
            {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
