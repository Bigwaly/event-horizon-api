const mongoose = require("mongoose");

async function connectDB() {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    throw new Error("MONGO_URI is not configured");
  }

  await mongoose.connect(mongoURI);
  console.log("MongoDB connected");
}

module.exports = connectDB;
