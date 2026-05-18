import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginApi } from "../services/authService";
import "../styles/auth.css";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordFocus, setIsPasswordFocus] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await loginApi(form);
      const { accessToken, refreshToken } = res.data.result || {};
      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("userEmail", form.email);
        navigate("/");
      } else {
        setError("Đăng nhập thất bại, vui lòng thử lại.");
      }
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(msg || "Sai tài khoản hoặc mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header-section">
          <h2>Login 👋</h2>
          <p className="auth-subtitle">
            <strong>Chào mừng bạn đến với <span className="brand-name">TGrowth</span></strong>
          </p>
        </div>

        <div className={`yeti ${isPasswordFocus ? "cover-eyes" : ""}`}>
          <div className="face">
            <div className="eyes"><span></span><span></span></div>
          </div>
          <div className="hands">
            <div className="hand left"></div>
            <div className="hand right"></div>
          </div>
        </div>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <input
              className={`auth-input ${error ? "input-error" : ""}`}
              type="email"
              placeholder="Email address"
              value={form.email}
              required
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="password-wrapper">
            <input
              className={`auth-input ${error ? "input-error" : ""}`}
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              required
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              onFocus={() => setIsPasswordFocus(true)}
              onBlur={() => setIsPasswordFocus(false)}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁"}
            </button>
          </div>

          {error && <p className="error-text">{error}</p>}

          <button className="auth-button" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập ngay"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Bạn mới biết đến TGrowth?{" "}
            <Link to="/register">Đăng ký ngay</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
