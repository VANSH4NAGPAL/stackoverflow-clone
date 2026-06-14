# Code-Quest — Developer Q&A Platform

A full-stack developer community platform built on the foundations of Stack Overflow, extended with a social feed, subscription management, multi-language support, gamification, and advanced authentication controls. The project is divided into two independent applications: a Node.js/Express REST API and a Next.js frontend.

---

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Features](#features)
  - [Core Q&A System](#core-qa-system)
  - [Social Public Space](#social-public-space)
  - [Forgot Password](#forgot-password)
  - [Subscription Plans](#subscription-plans)
  - [Points and Rewards](#points-and-rewards)
  - [Multi-Language Support](#multi-language-support)
  - [Login History and Browser Authentication](#login-history-and-browser-authentication)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Business Rules Summary](#business-rules-summary)
- [Authentication Flow](#authentication-flow)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Code-Quest is a production-grade Q&A platform designed for developer communities. Beyond standard question and answer functionality, it incorporates a public social feed with follower-gated posting, a Stripe-powered subscription system with time-restricted payments, a reputation-based points economy, verified multi-language switching, and detailed login tracking with environment-aware authentication rules.

The platform is designed to enforce trust through verified interactions at every level — from language changes to login attempts to payment processing.

---

## Technology Stack

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Node.js | 18+ | Runtime |
| Express | 5.x | HTTP framework |
| MongoDB | 6.x | Primary database |
| Mongoose | 8.x | ODM and schema modeling |
| JSON Web Token | 9.x | Stateless authentication |
| bcryptjs | 3.x | Password hashing |
| Stripe | 22.x | Payment processing |
| Nodemailer | 8.x | Transactional email (OTP, invoices, password resets) |
| ua-parser-js | 2.x | Browser and device fingerprinting |
| Multer | 2.x | File upload handling |
| Google Auth Library | 10.x | OAuth 2.0 token verification |
| Cloudinary | 1.x | Media storage for social posts |
| Google Generative AI | 2.x | AI-assisted answer generation |

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 15.x | React framework with file-based routing |
| React | 19.x | UI rendering |
| TypeScript | 5.x | Static type safety |
| Tailwind CSS | 4.x | Utility-first styling |
| Radix UI | Latest | Accessible component primitives (dialogs, avatars, labels) |
| Stripe.js and React Stripe.js | 9.x / 6.x | Embedded Stripe payment UI |
| Axios | 1.x | HTTP client |
| Lucide React | 0.525 | Icon set |
| React Toastify | 11.x | Notification toasts |

---

## Project Structure

```
stackoverflow-clone/
│
├── server/                          Node.js + Express REST API
│   ├── index.js                     Entry point: middleware, routes, DB connection
│   ├── .env                         Runtime environment variables (not committed)
│   ├── .env.example                 Template listing all required environment keys
│   │
│   ├── controller/
│   │   ├── auth.js                  Registration, login, OTP verification, OAuth, UA parsing
│   │   ├── social.js                Social posts, likes, comments, shares, follow/unfollow
│   │   ├── forgotPassword.js        Rate-limited OTP reset, letter-only password generation
│   │   ├── subscription.js          Stripe payment intent, confirmation, plan management
│   │   ├── points.js                Point award, deduction, transfer, user search
│   │   ├── language.js              Language switch OTP delivery and verification
│   │   ├── loginHistory.js          Login record retrieval
│   │   ├── question.js              Question creation, retrieval, voting
│   │   ├── answer.js                Answer posting, voting, point triggers
│   │   ├── ai.js                    AI-assisted answer generation
│   │   ├── article.js               Community articles
│   │   ├── challenge.js             Coding challenges
│   │   ├── chat.js                  Messaging
│   │   ├── company.js               Company profiles
│   │   ├── saves.js                 Saved questions
│   │   └── search.js                Global search
│   │
│   ├── models/
│   │   ├── auth.js                  User schema (points, subscription, followers, tags)
│   │   ├── post.js                  Social post schema (media, likes, comments, shares)
│   │   ├── loginHistory.js          Login attempt record schema
│   │   ├── otp.js                   Unified OTP schema (login / forgot-password / language)
│   │   ├── question.js              Question schema
│   │   └── answer.js                Answer schema
│   │
│   ├── routes/                      One route file per controller domain
│   │
│   ├── middleware/
│   │   └── auth.js                  JWT verification middleware (populates req.userid)
│   │
│   └── utils/
│       ├── stripe.js                Plan definitions and createPaymentIntent helper
│       └── mailer.js                Nodemailer helpers for OTP, invoice, and reset emails
│
└── stack/                           Next.js 15 Frontend (TypeScript)
    └── src/
        ├── pages/
        │   ├── _app.tsx             Global providers (Auth, Language, Google OAuth, Toast)
        │   ├── index.tsx            Home page
        │   ├── auth/                Login page with Chrome OTP verification step
        │   ├── signup/              Registration page
        │   ├── forgot-password/     Three-step password reset flow
        │   ├── social/              Public social feed
        │   ├── subscription/        Subscription plans and Stripe checkout
        │   ├── questions/           Question list and question detail
        │   ├── users/[id]/          User profile: points, login history, point transfer
        │   ├── ai-assist/           AI assistant page
        │   ├── articles/            Community articles
        │   ├── challenges/          Coding challenge browser
        │   ├── chat/                Messaging interface
        │   ├── companies/           Company directory
        │   ├── saves/               Bookmarked questions
        │   ├── search/              Global search results
        │   └── tags/                Tag browser
        │
        ├── components/
        │   ├── Navbar.tsx           Top navigation, language selector, OTP dialog
        │   ├── Sidebar.tsx          Left navigation with mobile hamburger menu support
        │   └── RightSideBar.tsx     Right panel showing tags and community stats
        │
        └── lib/
            ├── AuthContext.js       Authentication state, login, logout, OTP verification
            ├── LanguageContext.tsx  Language switching with OTP verification flow
            ├── translations.ts      UI string translations for all six supported languages
            └── axiosinstance.js    Axios instance configured with the backend base URL
```

---

## Features

### Core Q&A System

The foundational feature set mirrors the Stack Overflow model. Users can post questions with tags, write answers, upvote and downvote both questions and answers, and save questions for later review. An AI-assist page provides generated answer suggestions powered by the Google Generative AI API. A global search indexes questions, answers, and users.

Question posting is gated by the user's active subscription plan. Refer to the [Subscription Plans](#subscription-plans) section for daily limits per tier.

---

### Social Public Space

**Route:** `/social`

A public social feed separate from the Q&A system. Users can share text posts, photos, videos, and YouTube embeds. Interactions include likes, comments, and shares. Users can follow and unfollow one another directly from the feed or from any user profile.

**Posting limits are enforced server-side based on the user's follower count:**

| Follower Count | Daily Post Limit |
|---|---|
| 0 | No posting permitted |
| 1 | 1 post per day |
| 2 | 2 posts per day |
| 3 to 10 | 2 posts per day |
| More than 10 | Unlimited |

The limit is evaluated at the time of posting on the server. The daily count is calculated from midnight to midnight in the server's local timezone.

---

### Forgot Password

**Route:** `/forgot-password`

A three-step OTP-verified password reset flow.

1. The user submits their registered email address.
2. A 6-digit OTP is delivered to that email address and expires after 10 minutes.
3. After a valid OTP is submitted, a new password is generated automatically and emailed to the user.

**Constraints:**

- Each email address is permitted one reset request per calendar day. A second attempt within the same day returns the message: `You can use this option only one time per day.`
- The generated password contains only uppercase and lowercase letters. No digits and no special characters are included.
- The OTP is marked as consumed upon successful verification and cannot be reused.

---

### Subscription Plans

**Route:** `/subscription`

A Stripe-powered subscription system that determines how many questions a user may post each day. Payment is handled through Stripe's embedded `PaymentElement` component. Upon a successful charge, a subscription confirmation and invoice are sent to the user's registered email address.

**Available plans:**

| Plan | Monthly Price | Daily Question Limit |
|---|---|---|
| Free | No charge | 1 question per day |
| Bronze | 100 INR per month | 5 questions per day |
| Silver | 300 INR per month | 10 questions per day |
| Gold | 1000 INR per month | Unlimited |

**Payment time restriction:**

Payments are only accepted between **10:00 AM and 11:00 AM IST**. The server computes the current IST time before creating a Stripe payment intent and rejects all requests outside this window. This cannot be circumvented from the client.

**Subscription validity:** Each paid plan remains active for 30 calendar days from the payment date. After expiry, the account reverts to the Free plan limits automatically.

---

### Points and Rewards

Points are displayed on each user's public profile and serve as a reputation indicator within the community.

**Point events:**

| Event | Points |
|---|---|
| Posting an answer | +5 |
| An answer receives 5 upvotes | +5 (awarded once, as a bonus) |
| An answer is deleted or removed | -5 |
| An answer is downvoted | Points deducted |

**Point transfers:**

Users may transfer points to other users via a search dialog on their own profile page. The recipient is located by searching by name.

Rules governing transfers:

- The sender must have more than 10 points to initiate any transfer.
- The transfer amount cannot exceed the sender's current balance.
- A user cannot transfer points to their own account.

---

### Multi-Language Support

The platform supports six languages across all pages and components. Language preference is stored in `localStorage` and restored on the user's next visit.

**Supported languages:** English, Spanish, Hindi, Portuguese, Chinese, French.

**Verification on language switch:**

Authenticated users must complete an OTP verification step before a language change is applied. The OTP delivery channel depends on the target language selected:

| Target Language | OTP Delivery Channel |
|---|---|
| French | OTP sent to the user's registered email address |
| All other non-English languages | OTP sent to the user's registered mobile number |
| English (default) | No verification required |

Guest users who are not logged in may switch language without any verification step.

---

### Login History and Browser Authentication

Every login attempt is recorded to the database regardless of whether it succeeds or is blocked. The full history is accessible only to the authenticated account owner, displayed in a table on their profile page.

**Recorded fields per attempt:**

| Field | Description |
|---|---|
| Browser | Detected from the User-Agent header via ua-parser-js |
| Operating system | Parsed from the User-Agent string |
| Device type | Classified as desktop, mobile, or tablet |
| IP address | Extracted from `x-forwarded-for` or the socket remote address |
| Timestamp | The exact date and time of the attempt |
| Status | Either `success` or `blocked` |

**Conditional authentication rules applied at login:**

| Condition | Behaviour |
|---|---|
| Login from Google Chrome | A 6-digit OTP is sent to the registered email. The session token is issued only after the OTP is verified. |
| Login from Microsoft Edge or Internet Explorer | Access is granted directly without any additional step. |
| Login from a mobile device between 10:00 AM and 1:00 PM IST | The request is processed normally and proceeds to browser checks. |
| Login from a mobile device outside the permitted window | The request is rejected, the attempt is recorded with status `blocked`, and a 403 response is returned. |

---

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm 9 or later
- A MongoDB instance (MongoDB Atlas or a local installation)
- A Stripe account with a test secret key and publishable key
- A Gmail account with an App Password configured (for Nodemailer)
- A Google Cloud project with an OAuth 2.0 Web Client ID (for Google Sign-In)
- A Cloudinary account (for social post media uploads)
- A Google AI Studio API key (for the AI-assist feature)

---

### Backend Setup

```bash
# Navigate to the server directory
cd server

# Install all dependencies
npm install

# Copy the environment variable template
cp .env.example .env

# Open .env and fill in all required values (see Environment Variables section)

# Start the development server with hot reload
npm start
```

The API server listens on `http://localhost:5000` by default. The port can be changed by setting the `PORT` variable in `.env`.

---

### Frontend Setup

```bash
# Navigate to the frontend directory
cd stack

# Install all dependencies
npm install

# Create the local environment file and populate it (see Environment Variables section)
# On Windows:
copy .env.local.example .env.local
# On macOS/Linux:
cp .env.local.example .env.local

# Start the Next.js development server
npm run dev
```

The application will be available at `http://localhost:3000`.

To produce a production build:

```bash
npm run build
npm start
```

---

## Environment Variables

### Backend (`server/.env`)

```env
PORT=5000
MONGODB_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/<dbname>
JWT_SECRET=<a long, randomly generated secret string>
EMAIL_USER=<your-gmail-address>@gmail.com
EMAIL_PASS=<your-gmail-app-password>
STRIPE_SECRET_KEY=sk_test_<your-stripe-secret-key>
GOOGLE_CLIENT_ID=<your-google-oauth-client-id>
CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>
CLOUDINARY_API_KEY=<your-cloudinary-api-key>
CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>
GEMINI_API_KEY=<your-google-ai-studio-api-key>
```

The `EMAIL_PASS` field requires a Gmail App Password, not the standard Gmail account password. App Passwords are generated at `myaccount.google.com/apppasswords` and require 2-Step Verification to be enabled on the Gmail account.

### Frontend (`stack/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_<your-stripe-publishable-key>
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<your-google-oauth-client-id>
```

Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser bundle. Do not place secret keys in this file.

---

## API Reference

All endpoints are served from the backend base URL. Endpoints marked as requiring authentication expect a `Bearer` token in the `Authorization` request header, obtained from the login or OTP verification response.

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/user/signup` | No | Register a new user account |
| POST | `/user/login` | No | Login with conditional browser and device checks |
| POST | `/user/verify-login-otp` | No | Submit the OTP issued for Chrome-browser logins |
| GET | `/user/getalluser` | No | Retrieve all registered users |
| PATCH | `/user/update/:id` | Yes | Update user profile fields |
| POST | `/user/oauth` | No | Authenticate via Google OAuth credential |

### Questions

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/question/get` | No | Retrieve all questions |
| POST | `/question/ask` | Yes | Post a new question (daily limit from subscription applied) |
| PATCH | `/question/upvote/:id` | Yes | Upvote a question |
| PATCH | `/question/downvote/:id` | Yes | Downvote a question |
| DELETE | `/question/delete/:id` | Yes | Delete a question |

### Answers

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/answer/post/:id` | Yes | Post an answer to a question (awards +5 points) |
| PATCH | `/answer/upvote/:id` | Yes | Upvote an answer |
| PATCH | `/answer/downvote/:id` | Yes | Downvote an answer (deducts points) |
| DELETE | `/answer/delete/:id` | Yes | Delete an answer (deducts points) |

### Social Feed

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/social/getall` | No | Fetch all posts, sorted by newest, limited to 50 |
| POST | `/social/create` | Yes | Create a post (follower-based daily limit enforced) |
| PATCH | `/social/like/:id` | Yes | Toggle like or unlike on a post |
| POST | `/social/comment/:id` | Yes | Add a comment to a post |
| PATCH | `/social/share/:id` | No | Increment the share count of a post |
| PATCH | `/social/follow/:id` | Yes | Follow or unfollow another user |

### Forgot Password

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/forgot-password/request-otp` | No | Request a password reset OTP (one per day per email) |
| POST | `/forgot-password/reset` | No | Submit OTP and receive a generated replacement password |

### Subscriptions

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/subscription/plans` | No | List all available subscription plans |
| POST | `/subscription/create-intent` | Yes | Create a Stripe PaymentIntent (time-gated to 10–11 AM IST) |
| POST | `/subscription/confirm` | Yes | Confirm a successful payment and activate the subscription |
| GET | `/subscription/my-subscription` | Yes | Retrieve the current user's active subscription and daily limit |

### Points

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/points/:id` | No | Retrieve a specific user's current point total |
| POST | `/points/transfer` | Yes | Transfer points from the authenticated user to another |
| GET | `/points/search?query=` | Yes | Search users by name to select a transfer recipient |

### Language

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/language/request-otp` | Yes | Send an OTP to verify a language switch request |
| POST | `/language/verify` | Yes | Verify the OTP and apply the new language preference |

### Login History

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/login-history` | Yes | Retrieve the full login history for the authenticated user |

---

## Business Rules Summary

The following rules are enforced on the server and cannot be overridden from the client application.

| Domain | Rule |
|---|---|
| Social posting | Users with zero followers cannot post. Users with exactly 1 follower may post once per day. Users with 2 to 10 followers may post twice per day. Users with more than 10 followers have no daily posting limit. |
| Password reset | Each email address may initiate only one password reset request per calendar day. |
| Generated password | Reset passwords contain only uppercase and lowercase alphabetic characters. No digits or special characters are generated. Minimum length is 12 characters. |
| Subscription payment | The payment intent endpoint only accepts requests between 10:00 AM and 11:00 AM IST. The time check is performed server-side using UTC offset conversion. |
| Question posting | The number of questions a user may post per day is determined by their active subscription plan: Free allows 1, Bronze allows 5, Silver allows 10, and Gold has no limit. |
| Point transfer | A user must hold more than 10 points to initiate any outgoing transfer. |
| Mobile login | Login requests from mobile devices are accepted only between 10:00 AM and 1:00 PM IST. Requests outside this window are rejected and logged as blocked. |
| Chrome login | Login attempts made from Google Chrome initiate an OTP verification step. The session token is not issued until the OTP is confirmed. |
| Language switch | Switching to French requires verification via an OTP sent to the registered email address. Switching to any other non-English language requires an OTP sent to the registered mobile number. |

---

## Authentication Flow

The following diagram describes the server-side logic applied on every call to `POST /user/login`.

```
POST /user/login
        |
        v
Validate credentials
(check email exists, compare password with bcrypt hash)
        |
        v
Parse User-Agent header using ua-parser-js
Extract: browser name, OS, device type
        |
        +-------> Device type is "mobile"?
        |                   |
        |                   +-- Yes --> Current IST time is between 10:00 AM and 1:00 PM?
        |                   |                   |
        |                   |                   +-- No --> Record attempt as "blocked"
        |                   |                   |          Return HTTP 403
        |                   |                   |
        |                   |                   +-- Yes --> Proceed to browser check below
        |
        +-------> Browser is Google Chrome?
        |                   |
        |                   +-- Yes --> Generate 6-digit OTP
        |                   |          Save OTP to database with 10-minute expiry
        |                   |          Send OTP to user's email via Nodemailer
        |                   |          Record attempt as "success"
        |                   |          Return HTTP 200 with { requiresOTP: true }
        |                   |          (Frontend then calls POST /user/verify-login-otp)
        |                   |
        |                   +-- No --> Proceed to token issuance below
        |
        v
Record attempt as "success" in loginHistory collection
Sign and return JWT (expires in 1 hour)
Return HTTP 200 with { data: user, token }
```

---

## Contributing

1. Fork the repository on GitHub.
2. Create a descriptive feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes. Ensure all new server-side rules are enforced in the controller, not the route or middleware layer.
4. Commit using a conventional commit message:
   ```bash
   git commit -m "feat: add description of your change"
   ```
5. Push the branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
6. Open a pull request against the `main` branch of this repository.

Please do not commit `.env` files or any files containing credentials. The `.gitignore` at the project root covers these by default.

---

## License

This project is licensed under the ISC License.
