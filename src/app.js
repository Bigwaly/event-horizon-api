const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10kb" }));

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "EventHorizon API is healthy"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
