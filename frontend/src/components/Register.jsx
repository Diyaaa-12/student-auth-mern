import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const COURSES = ["B.Tech", "M.Tech", "BCA", "MCA", "B.Sc", "M.Sc", "MBA", "BBA"];
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", email: "", password: "", course: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // multi-step feel

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    try {
      await axios.post(`${API}/register`, formData);
      setSuccess("Account created!");
      setTimeout(() => navigate("/login"), 1400);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
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
          <h1>Begin your<br /><em>academic</em><br />journey.</h1>
          <p>One platform for everything you need — track progress, manage courses, and stay ahead.</p>
        </div>
        <div className="auth-left-footer">© 2025 StudentOS</div>
      </div>

      <div className="auth-right">
        <div className="auth-form-wrap">
          <div className="form-eyebrow">Create account</div>
          <h2 className="form-title">Register</h2>

          {error && <div className="toast toast-error">{error}</div>}
          {success && <div className="toast toast-success">{success}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="field-group">
              <label>Full Name</label>
              <input
                type="text" name="name"
                placeholder="e.g. Diya Sharma"
                value={formData.name}
                onChange={handleChange} required
              />
            </div>
            <div className="field-group">
              <label>Email Address</label>
              <input
                type="email" name="email"
                placeholder="you@college.edu"
                value={formData.email}
                onChange={handleChange} required
              />
            </div>
            <div className="field-row">
              <div className="field-group">
                <label>Password</label>
                <input
                  type="password" name="password"
                  placeholder="Min. 6 chars"
                  value={formData.password}
                  onChange={handleChange} minLength={6} required
                />
              </div>
              <div className="field-group">
                <label>Course</label>
                <select name="course" value={formData.course} onChange={handleChange} required>
                  <option value="">Select</option>
                  {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : "Create Account →"}
            </button>
          </form>

          <p className="switch-link">Already enrolled? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}