import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const COURSES = ["B.Tech", "M.Tech", "BCA", "MCA", "B.Sc", "M.Sc", "MBA", "BBA"];
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");

  // Password update state
  const [pwData, setPwData] = useState({ oldPassword: "", newPassword: "" });
  const [pwMsg, setPwMsg] = useState({ text: "", type: "" });

  // Course update state
  const [newCourse, setNewCourse] = useState("");
  const [courseMsg, setCourseMsg] = useState({ text: "", type: "" });

  const token = localStorage.getItem("token");

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API}/profile`, authHeader);
      setStudent(res.data.student);
    } catch {
      handleLogout();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("student");
    navigate("/login");
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPwMsg({ text: "", type: "" });
    try {
      const res = await axios.put(`${API}/update-password`, pwData, authHeader);
      setPwMsg({ text: res.data.message, type: "success" });
      setPwData({ oldPassword: "", newPassword: "" });
    } catch (err) {
      setPwMsg({ text: err.response?.data?.message || "Error updating password", type: "error" });
    }
  };

  const handleCourseUpdate = async (e) => {
    e.preventDefault();
    setCourseMsg({ text: "", type: "" });
    try {
      const res = await axios.put(`${API}/update-course`, { course: newCourse }, authHeader);
      setStudent(res.data.student);
      setCourseMsg({ text: res.data.message, type: "success" });
    } catch (err) {
      setCourseMsg({ text: err.response?.data?.message || "Error updating course", type: "error" });
    }
  };

  if (!student) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="avatar">{student.name.charAt(0).toUpperCase()}</div>
          <h3>{student.name}</h3>
          <span className="course-badge">{student.course}</span>
        </div>

        <nav className="sidebar-nav">
          <button
            className={activeTab === "profile" ? "nav-item active" : "nav-item"}
            onClick={() => setActiveTab("profile")}
          >
            👤 My Profile
          </button>
          <button
            className={activeTab === "password" ? "nav-item active" : "nav-item"}
            onClick={() => setActiveTab("password")}
          >
            🔒 Update Password
          </button>
          <button
            className={activeTab === "course" ? "nav-item active" : "nav-item"}
            onClick={() => setActiveTab("course")}
          >
            📚 Change Course
          </button>
        </nav>

        <button className="btn-logout" onClick={handleLogout}>
          🚪 Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="tab-content">
            <h2>My Profile</h2>
            <div className="profile-card">
              <div className="profile-avatar">{student.name.charAt(0).toUpperCase()}</div>
              <div className="profile-details">
                <div className="detail-row">
                  <span className="detail-label">👤 Full Name</span>
                  <span className="detail-value">{student.name}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">📧 Email</span>
                  <span className="detail-value">{student.email}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">📚 Course</span>
                  <span className="detail-value">{student.course}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">📅 Joined</span>
                  <span className="detail-value">
                    {new Date(student.createdAt).toLocaleDateString("en-IN", {
                      year: "numeric", month: "long", day: "numeric"
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === "password" && (
          <div className="tab-content">
            <h2>Update Password</h2>
            <div className="form-card">
              {pwMsg.text && (
                <div className={`alert alert-${pwMsg.type}`}>
                  {pwMsg.type === "success" ? "✅" : "⚠️"} {pwMsg.text}
                </div>
              )}
              <form onSubmit={handlePasswordUpdate}>
                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    placeholder="Enter current password"
                    value={pwData.oldPassword}
                    onChange={(e) => setPwData({ ...pwData, oldPassword: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password (min. 6 chars)"
                    value={pwData.newPassword}
                    onChange={(e) => setPwData({ ...pwData, newPassword: e.target.value })}
                    minLength={6}
                    required
                  />
                </div>
                <button type="submit" className="btn-primary">Update Password</button>
              </form>
            </div>
          </div>
        )}

        {/* Course Tab */}
        {activeTab === "course" && (
          <div className="tab-content">
            <h2>Change Course</h2>
            <div className="form-card">
              <div className="current-course">
                <span>Current Course:</span>
                <strong> {student.course}</strong>
              </div>
              {courseMsg.text && (
                <div className={`alert alert-${courseMsg.type}`}>
                  {courseMsg.type === "success" ? "✅" : "⚠️"} {courseMsg.text}
                </div>
              )}
              <form onSubmit={handleCourseUpdate}>
                <div className="form-group">
                  <label>Select New Course</label>
                  <select
                    value={newCourse}
                    onChange={(e) => setNewCourse(e.target.value)}
                    required
                  >
                    <option value="">Choose a course</option>
                    {COURSES.filter((c) => c !== student.course).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn-primary">Update Course</button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}