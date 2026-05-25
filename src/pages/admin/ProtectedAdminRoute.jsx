import { Navigate } from "react-router-dom";
import { decodeToken, getAccessToken } from "../../services/tokenUtils";

export default function ProtectedAdminRoute({ children }) {
  const token = getAccessToken();
  const payload = decodeToken(token);
  const authorities = payload?.authorities || [];

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!authorities.includes("ADMIN")) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
        <div className="bg-white border border-slate-100 rounded-[2rem] p-10 max-w-md text-center shadow-sm">
          <h1 className="text-2xl font-black text-[#0f2c3f] mb-3">
            Không có quyền truy cập
          </h1>
          <p className="text-sm text-slate-500">
            Tài khoản hiện tại không có role ADMIN để vào trang quản trị.
          </p>
        </div>
      </div>
    );
  }

  return children;
}
