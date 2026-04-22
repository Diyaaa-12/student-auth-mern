const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");
const protect = require("../middleware/authMiddleware");

// ─── POST /api/register ───────────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, course } = req.body;

    if (!name || !email || !password || !course) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = await Student.create({
      name,
      email,
      password: hashedPassword,
      course,
    });

    res.status(201).json({
      message: "Registration successful",
      student: { id: student._id, name: student.name, email: student.email, course: student.course },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ─── POST /api/login ──────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: student._id, email: student.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      student: { id: student._id, name: student.name, email: student.email, course: student.course },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ─── GET /api/profile (protected) ────────────────────────────────
router.get("/profile", protect, async (req, res) => {
  try {
    const student = await Student.findById(req.student.id).select("-password");
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.status(200).json({ student });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ─── PUT /api/update-password (protected) ────────────────────────
router.put("/update-password", protect, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Both old and new passwords are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const student = await Student.findById(req.student.id);
    const isMatch = await bcrypt.compare(oldPassword, student.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Old password is incorrect" });
    }

    student.password = await bcrypt.hash(newPassword, 10);
    await student.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ─── PUT /api/update-course (protected) ──────────────────────────
router.put("/update-course", protect, async (req, res) => {
  try {
    const { course } = req.body;

    if (!course) {
      return res.status(400).json({ message: "Course is required" });
    }

    const student = await Student.findByIdAndUpdate(
      req.student.id,
      { course },
      { new: true }
    ).select("-password");

    res.status(200).json({ message: "Course updated successfully", student });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;