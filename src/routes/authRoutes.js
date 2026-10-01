const express = require("express");

const {
  register,
  login,
  verifyEmail
} = require("../controllers/authController");
const validate = require("../middleware/validate");
const {
  registerSchema,
  loginSchema,
  verifyEmailSchema
} = require("../validations/authValidation");

const router = express.Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post(
  "/verify-email",
  validate(verifyEmailSchema),
  verifyEmail
);

module.exports = router;
