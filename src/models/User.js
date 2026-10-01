const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    password: {
      type: String,
      required: true,
      select: false
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationTokenHash: {
      type: String,
      select: false
    },
    emailVerificationExpires: {
      type: Date,
      select: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);
