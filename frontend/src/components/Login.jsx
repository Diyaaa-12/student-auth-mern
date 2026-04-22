import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await axios.post(`${API}/login`, formData);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("student", JSON.stringify(res.data.student));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <span className="brand-dot" />
          <span>StudentOS</span>
        </div>
        <div className="auth-left-content">
          <h1>Welcome<br /><em>back.</em></h1>
          <p>Your dashboard, updates, and profile are all waiting for you.</p>
        </div>
        <div className="auth-left-footer">© 2025 StudentOS</div>
      </div>

      <div className="auth-right">
        <div className="auth-form-wrap">
          <div className="form-eyebrow">Returning student</div>
          <h2 className="form-title">Sign in</h2>

          {error && <div className="toast toast-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="field-group">
              <label>Email Address</label>
              <input
                type="email" name="email"
                placeholder="you@college.edu"
                value={formData.email}
                onChange={handleChange} required
              />
            </div>
            <div className="field-group">
              <label>Password</label>
              <input
                type="password" name="password"
                placeholder="Your password"
                value={formData.password}
                onChange={handleChange} required
              />
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : "Sign In →"}
            </button>
          </form>

          <p className="switch-link">New here? <Link to="/register">Create account</Link></p>
        </div>
      </div>
    </div>
  );
}