const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const router = express.Router();

function signToken(admin) {
  return jwt.sign(
    { adminId: admin._id, email: admin.email },
    process.env.JWT_SECRET || "top20-secret",
    { expiresIn: "12h" }
  );
}

router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email e senha são obrigatórios." });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ message: "A senha deve ter pelo menos 6 caracteres." });
  }

  const normalized = String(email).toLowerCase().trim();
  const exists = await Admin.findOne({ email: normalized });
  if (exists) {
    return res.status(409).json({ message: "Este email já está cadastrado." });
  }

  const hashed = await bcrypt.hash(password, 10);
  const admin = await Admin.create({ email: normalized, password: hashed });
  const token = signToken(admin);
  return res.status(201).json({ token });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email e senha são obrigatórios." });
  }

  const admin = await Admin.findOne({ email: email.toLowerCase() });
  if (!admin) {
    return res.status(401).json({ message: "Credenciais inválidas." });
  }

  const valid = await bcrypt.compare(password, admin.password);
  if (!valid) {
    return res.status(401).json({ message: "Credenciais inválidas." });
  }

  const token = signToken(admin);

  return res.json({ token });
});

module.exports = router;
