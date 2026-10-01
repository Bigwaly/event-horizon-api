const Joi = require("joi");

const passwordSchema = Joi.string()
  .min(8)
  .max(128)
  .pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/)
  .required()
  .messages({
    "string.pattern.base":
      "Password must be at least 8 characters and contain both letters and numbers."
  });

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().trim().lowercase().email().max(254).required(),
  password: passwordSchema
});

const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().max(254).required(),
  password: Joi.string().required()
});

const verifyEmailSchema = Joi.object({
  token: Joi.string().trim().min(32).max(512).required()
});

module.exports = {
  registerSchema,
  loginSchema,
  verifyEmailSchema
};
