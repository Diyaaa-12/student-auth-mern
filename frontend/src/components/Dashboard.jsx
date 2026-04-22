import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const COURSES = ["B.Tech", "M.Tech", "BCA", "MCA", "B.Sc", "M.Sc", "MBA", "BBA"];
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const NAV = [
  { id: "profile", icon: "⊙", label: "Profile" },
  { id: "edit",    icon: "✦", label: "Edit Info" },
  { id: "password",icon: "◈", label: "Security" },
  { id: "course",  icon: "◉", label: "Course" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const fileRef = useRef();
  const [student, setStudent] = useState(null);
  const [tab, setTab] = useState("profile");

  // Edit profile state
  const [editName, setEditName]       = useState("");
  const [previewImg, setPreviewImg]   = useState(null);
  const [editMsg, setEditMsg]         = useState({ text: "", type: "" });
  const [editLoading, setEditLoading] = useState(false);

  // Password state
  const [pw, setPw]       = useState({ oldPassword: "", newPassword: "" });
  const [pwMsg, setPwMsg] = useState({ text: "", type: "" });

  // Course state
  const [newCourse, setNewCourse]       = useState("");
  const [courseMsg, setCourseMsg]       = useState({ text: "", type: "" });

  const token = localStorage.getItem("token");
  const headers = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API}/profile`, headers);
      setStudent(res.data.student);
      setEditName(res.data.student.name);
      setPreviewImg(res.data.student.profilePicture || null);
    } catch {
      handleLogout();
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Convert selected file to base64
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setEditMsg({ text: "Image must be under 2MB", type: "error" });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setPreviewImg(reader.result);
    reader.readAsDataURL(file);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditMsg({ text: "", type: "" });
    setEditLoading(true);
    try {
      const payload = {};
      if (editName.trim() !== student.name) payload.name = editName.trim();
      if (previewImg !== student.profilePicture) payload.profilePicture = previewImg;
      if (Object.keys(payload).length === 0) {
        setEditMsg({ text: "No changes detected", type: "error" });
        setEditLoading(false);
        return;
      }
      const res = await axios.put(`${API}/update-profile`, payload, headers);
      setStudent(res.data.student);
      setEditMsg({ text: "Profile updated!", type: "success" });
    } catch (err) {
      setEditMsg({ text: err.response?.data?.message || "Update failed", type: "error" });
    } finally {
      setEditLoading(false);
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    setPwMsg({ text: "", type: "" });
    try {
      const res = await axios.put(`${API}/update-password`, pw, headers);
      setPwMsg({ text: res.data.message, type: "success" });
      setPw({ oldPassword: "", newPassword: "" });
    } catch (err) {
      setPwMsg({ text: err.response?.data?.message || "Error", type: "error" });
    }
  };

  const handleCourse = async (e) => {
    e.preventDefault();
    setCourseMsg({ text: "", type: "" });
    try {
      const res = await axios.put(`${API}/update-course`, { course: newCourse }, headers);
      setStudent(res.data.student);
      setCourseMsg({ text: "Course updated!", type: "success" });
    } catch (err) {
      setCourseMsg({ text: err.response?.data?.message || "Error", type: "error" });
    }
  };

  if (!student) return (
    <div className="dash-loading">
      <div className="loader-ring" />
    </div>
  );

  const initials = student.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="dash-root">
      {/* ── Sidebar ─────────────────────────────── */}
      <aside className="dash-sidebar">
        <div className="sidebar-logo">
          <span className="brand-dot" />
          <span>StudentOS</span>
        </div>

        <div className="sidebar-profile">
          <div className="sidebar-avatar">
            {student.profilePicture
              ? <img src={student.profilePicture} alt="avatar" />
              : <span>{initials}</span>}
          </div>
          <div className="sidebar-info">
            <strong>{student.name}</strong>
            <span>{student.course}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(n => (
            <button
              key={n.id}
              className={`nav-btn ${tab === n.id ? "active" : ""}`}
              onClick={() => setTab(n.id)}
            >
              <span className="nav-icon">{n.icon}</span>
              <span>{n.label}</span>
              {tab === n.id && <span className="nav-pip" />}
            </button>
          ))}
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          <span>↪</span> Sign Out
        </button>
      </aside>

      {/* ── Main ────────────────────────────────── */}
      <main className="dash-main">
        <div className="dash-topbar">
          <div>
            <div className="topbar-eyebrow">Dashboard</div>
            <h1 className="topbar-title">
              {NAV.find(n => n.id === tab)?.label}
            </h1>
          </div>
          <div className="topbar-badge">{student.course}</div>
        </div>

        <div className="dash-content">

          {/* ── Profile Tab ────────── */}
          {tab === "profile" && (
            <div className="tab-fade">
              <div className="profile-hero">
                <div className="profile-hero-avatar">
                  {student.profilePicture
                    ? <img src={student.profilePicture} alt="profile" />
                    : <span>{initials}</span>}
                  <div className="avatar-ring" />
                </div>
                <div className="profile-hero-info">
                  <h2>{student.name}</h2>
                  <p>{student.email}</p>
                  <span className="pill">{student.course}</span>
                </div>
              </div>

              <div className="info-grid">
                <div className="info-card">
                  <div className="info-label">Full Name</div>
                  <div className="info-value">{student.name}</div>
                </div>
                <div className="info-card">
                  <div className="info-label">Email</div>
                  <div className="info-value">{student.email}</div>
                </div>
                <div className="info-card">
                  <div className="info-label">Enrolled Course</div>
                  <div className="info-value">{student.course}</div>
                </div>
                <div className="info-card">
                  <div className="info-label">Member Since</div>
                  <div className="info-value">
                    {new Date(student.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "long", year: "numeric"
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Edit Info Tab ──────── */}
          {tab === "edit" && (
            <div className="tab-fade">
              <form onSubmit={handleEditSubmit} className="settings-form">
                {/* Profile picture upload */}
                <div className="upload-zone">
                  <div className="upload-preview">
                    {previewImg
                      ? <img src={previewImg} alt="preview" />
                      : <span className="upload-initials">{initials}</span>}
                  </div>
                  <div className="upload-actions">
                    <p className="upload-label">Profile Picture</p>
                    <p className="upload-hint">JPG, PNG or GIF · Max 2MB</p>
                    <button
                      type="button"
                      className="btn-upload"
                      onClick={() => fileRef.current.click()}
                    >
                      Choose Photo
                    </button>
                    {previewImg && (
                      <button
                        type="button"
                        className="btn-remove"
                        onClick={() => { setPreviewImg(null); fileRef.current.value = ""; }}
                      >
                        Remove
                      </button>
                    )}
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: "none" }}
                    />
                  </div>
                </div>

                <div className="form-divider" />

                <div className="field-group">
                  <label>Display Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    placeholder="Your full name"
                    required
                  />
                </div>

                {editMsg.text && (
                  <div className={`inline-msg ${editMsg.type}`}>{editMsg.text}</div>
                )}

                <button type="submit" className="btn-submit" disabled={editLoading}>
                  {editLoading ? <span className="btn-spinner" /> : "Save Changes →"}
                </button>
              </form>
            </div>
          )}

          {/* ── Password Tab ──────── */}
          {tab === "password" && (
            <div className="tab-fade">
              <form onSubmit={handlePassword} className="settings-form">
                <div className="field-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    placeholder="Enter current password"
                    value={pw.oldPassword}
                    onChange={e => setPw({ ...pw, oldPassword: e.target.value })}
                    required
                  />
                </div>
                <div className="field-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    placeholder="Min. 6 characters"
                    value={pw.newPassword}
                    onChange={e => setPw({ ...pw, newPassword: e.target.value })}
                    minLength={6}
                    required
                  />
                </div>

                {pwMsg.text && (
                  <div className={`inline-msg ${pwMsg.type}`}>{pwMsg.text}</div>
                )}

                <button type="submit" className="btn-submit">Update Password →</button>
              </form>
            </div>
          )}

          {/* ── Course Tab ────────── */}
          {tab === "course" && (
            <div className="tab-fade">
              <div className="course-current">
                <span className="course-label">Currently enrolled in</span>
                <span className="course-name">{student.course}</span>
              </div>

              <form onSubmit={handleCourse} className="settings-form">
                <div className="field-group">
                  <label>Select New Course</label>
                  <select value={newCourse} onChange={e => setNewCourse(e.target.value)} required>
                    <option value="">Choose a course</option>
                    {COURSES.filter(c => c !== student.course).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {courseMsg.text && (
                  <div className={`inline-msg ${courseMsg.type}`}>{courseMsg.text}</div>
                )}

                <button type="submit" className="btn-submit">Change Course →</button>
              </form>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}