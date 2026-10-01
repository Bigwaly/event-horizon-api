const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const {
  generateVerificationToken,
  hashToken
} = require("../utils/tokens");
const sendVerificationEmail = require("../utils/email");

function signLoginToken(user) {
  return jwt.sign(
    {
      userId: user._id.toString()
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1h"
    }
  );
}

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "A user with that email already exists"
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const verificationToken = generateVerificationToken();
    const verificationTokenHash = hashToken(verificationToken);

    const expiresHours = Number(
      process.env.VERIFICATION_TOKEN_EXPIRES_HOURS || 24
    );

    const user = await User.create({
      name,
      email,
      password: passwordHash,
      isVerified: false,
      emailVerificationTokenHash: verificationTokenHash,
      emailVerificationExpires: new Date(
        Date.now() + expiresHours * 60 * 60 * 1000
      )
    });

    try {
      await sendVerificationEmail({
        email: user.email,
        name: user.name,
        token: verificationToken
      });
    } catch (emailError) {
      await User.findByIdAndDelete(user._id);
      return res.status(503).json({
        success: false,
        message: "Unable to send verification email. Please try again."
      });
    }

    return res.status(201).json({
      success: true,
      message:
        "Registration successful. Please check your email to verify your account.",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isVerified: user.isVerified
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select(
      "+password +emailVerificationTokenHash +emailVerificationExpires"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in"
      });
    }

    const token = signLoginToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isVerified: user.isVerified
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

async function verifyEmail(req, res, next) {
  try {
    const { token } = req.body;

    const tokenHash = hashToken(token);

    const user = await User.findOne({
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpires: { $gt: new Date() }
    }).select(
      "+emailVerificationTokenHash +emailVerificationExpires"
    );

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Verification token is invalid or expired"
      });
    }

    user.isVerified = true;
    user.emailVerificationTokenHash = undefined;
    user.emailVerificationExpires = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully. You can now log in."
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  verifyEmail
};
