const nodemailer = require("nodemailer");

function createTransporter() {
  const port = Number(process.env.SMTP_PORT || 587);

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: String(process.env.SMTP_SECURE).toLowerCase() === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

async function sendVerificationEmail({ email, name, token }) {
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS ||
    !process.env.EMAIL_FROM
  ) {
    throw new Error("SMTP email configuration is incomplete");
  }

  const transporter = createTransporter();
  const frontendUrl = (process.env.FRONTEND_URL || "").replace(/\/$/, "");
  const verificationUrl = `${frontendUrl}/verify-email?token=${encodeURIComponent(token)}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Verify your EventHorizon email address",
    text: `Hello ${name},\n\nPlease verify your EventHorizon account by visiting:\n${verificationUrl}\n\nThis link expires in ${process.env.VERIFICATION_TOKEN_EXPIRES_HOURS || 24} hours.\n\nIf you did not create an account, you can ignore this email.`,
    html: `
      <p>Hello ${escapeHtml(name)},</p>
      <p>Thanks for signing up for EventHorizon.</p>
      <p>
        <a href="${verificationUrl}">Verify your email address</a>
      </p>
      <p>This link expires in ${process.env.VERIFICATION_TOKEN_EXPIRES_HOURS || 24} hours.</p>
      <p>If you did not create an account, you can ignore this email.</p>
    `
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

module.exports = sendVerificationEmail;
