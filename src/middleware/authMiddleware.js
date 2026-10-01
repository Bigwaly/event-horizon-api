const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function protect(req, res, next) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const token = authorization.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select(
      "-password -emailVerificationTokenHash -emailVerificationExpires"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account not found"
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Email verification is required"
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Authentication token has expired"
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid authentication token"
    });
  }
}

module.exports = protect;
