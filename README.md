# EventHorizon API

A secure Node.js/Express/MongoDB REST API foundation for the EventHorizon event management system.

## Features

- Node.js + Express REST API
- MongoDB with Mongoose
- Joi validation for registration, login, and email verification
- bcrypt password hashing
- JWT authentication
- Protected user profile route
- Secure, time-limited email verification token
- Verification token stored as a SHA-256 hash
- Nodemailer SMTP email delivery
- Helmet security headers
- CORS
- Centralized error handling
- Postman collection included

## Requirements

- Node.js 18+
- MongoDB 6+ (local or MongoDB Atlas)
- SMTP account/provider for sending verification emails

## Installation

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd eventhorizon-api
npm install
```

Create your environment file:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Update `.env` with your actual values.

## Environment variables

| Variable | Description | Example |
|---|---|---|
| `NODE_ENV` | Runtime environment | `development` |
| `PORT` | API port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/eventhorizon` |
| `JWT_SECRET` | Long random JWT signing secret | `use-a-long-random-value` |
| `JWT_EXPIRES_IN` | JWT lifetime | `1h` |
| `VERIFICATION_TOKEN_EXPIRES_HOURS` | Email verification lifetime | `24` |
| `FRONTEND_URL` | Frontend base URL | `http://localhost:3000` |
| `SMTP_HOST` | SMTP hostname | `smtp.example.com` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_SECURE` | Use TLS/SSL | `false` |
| `SMTP_USER` | SMTP username | `user@example.com` |
| `SMTP_PASS` | SMTP password/app password | `secret` |
| `EMAIL_FROM` | Sender address | `EventHorizon <no-reply@example.com>` |

For production, generate a strong JWT secret rather than using the example value.

## Run

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

Health check:

```text
GET http://localhost:5000/api/health
```

## API endpoints

### Register

```text
POST /api/auth/register
Content-Type: application/json
```

Body:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Password123"
}
```

Password requirements:

- At least 8 characters
- Must contain at least one letter
- Must contain at least one number
- Alphanumeric characters only

A successful registration creates an unverified account and sends a verification email.

### Verify email

```text
POST /api/auth/verify-email
Content-Type: application/json
```

Body:

```json
{
  "token": "token-from-verification-link"
}
```

The frontend verification page receives the token from:

```text
http://localhost:3000/verify-email?token=YOUR_TOKEN
```

The frontend should then send that token to the API.

Verification tokens:

- Are generated using Node's cryptographically secure `crypto.randomBytes`
- Are never stored in plaintext
- Are stored as SHA-256 hashes
- Expire after the configured period
- Are removed after successful verification

### Login

```text
POST /api/auth/login
Content-Type: application/json
```

Body:

```json
{
  "email": "jane@example.com",
  "password": "Password123"
}
```

Unverified users receive `403 Forbidden` and cannot receive a JWT.

### Profile

```text
GET /api/user/profile
Authorization: Bearer YOUR_JWT
```

Only verified users with a valid JWT can access this endpoint.

## HTTP status codes

- `200` — Successful request
- `201` — Resource created
- `400` — Validation failure or invalid/expired verification token
- `401` — Authentication required/invalid credentials/invalid JWT
- `403` — Account is not verified
- `404` — Route/resource not found
- `409` — Duplicate email
- `503` — Verification email could not be delivered
- `500` — Unexpected server error

## Email provider

This project uses Nodemailer with SMTP. You can use an SMTP provider such as your organization's mail server, Gmail SMTP with an appropriate app password, or a transactional email provider.

Never commit SMTP credentials or `.env` to Git.

## MongoDB Atlas

For MongoDB Atlas, set `MONGO_URI` to your Atlas connection string, for example:

```text
mongodb+srv://USERNAME:PASSWORD@cluster.example.mongodb.net/eventhorizon
```

Make sure the appropriate database network access and database user are configured in Atlas.

## Postman

Import:

```text
postman/EventHorizon.postman_collection.json
```

The collection includes:

1. Health Check
2. Register
3. Verify Email
4. Login
5. Get Profile

After login, copy the returned JWT into the collection variable:

```text
jwt
```

For email verification, copy the token from the verification email into:

```text
verificationToken
```

## Suggested testing flow

1. Start MongoDB.
2. Configure `.env`.
3. Start the API.
4. Call Health Check.
5. Register a user.
6. Open the verification email.
7. Copy the token.
8. Verify the email.
9. Login.
10. Copy the returned JWT.
11. Call Get Profile.

## Security notes

- Passwords are hashed with bcrypt using a work factor of 12.
- Password hashes are excluded from normal Mongoose queries using `select: false`.
- Verification tokens are hashed before database storage.
- JWTs are separate from email verification tokens.
- JWT secrets and SMTP credentials are supplied through environment variables.
- Request bodies are limited to 10 KB.
- Helmet supplies common HTTP security headers.
- Unknown request fields are stripped by Joi validation.
- Error responses avoid returning password or token secrets.

## Project structure

```text
src/
├── config/
│   └── db.js
├── controllers/
│   ├── authController.js
│   └── userController.js
├── middleware/
│   ├── authMiddleware.js
│   ├── errorMiddleware.js
│   └── validate.js
├── models/
│   └── User.js
├── routes/
│   ├── authRoutes.js
│   └── userRoutes.js
├── utils/
│   ├── email.js
│   └── tokens.js
├── validations/
│   └── authValidation.js
└── app.js
```

## Publishing to GitHub

After creating an empty GitHub repository:

```bash
git init
git add .
git commit -m "Initial EventHorizon API"
git branch -M main
git remote add origin <YOUR_GITHUB_REPOSITORY_URL>
git push -u origin main
```

Do not commit `.env`.

## License

MIT
