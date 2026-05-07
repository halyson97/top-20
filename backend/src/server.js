require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const pollRoutes = require("./routes/pollRoutes");
const voteRoutes = require("./routes/voteRoutes");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/", authRoutes);
app.use("/", pollRoutes);
app.use("/", voteRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Erro interno do servidor." });
});

async function bootstrap() {
  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/top20";
  await mongoose.connect(mongoUri);
  app.listen(PORT, () => {
    console.log(`API rodando em http://localhost:${PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error("Falha ao iniciar API:", error);
  process.exit(1);
});
