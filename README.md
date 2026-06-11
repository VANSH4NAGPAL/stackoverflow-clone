# StackOverflow Clone Architecture and API Documentation

## Executive Summary

This repository contains a full-stack, enterprise-grade clone of StackOverflow. The system is engineered to facilitate technical discussions, question-and-answer interactions, and community moderation through a comprehensive point-based economy. The architecture strictly enforces security protocols, conditional user constraints, and dynamic payment integrations to ensure a robust, production-ready environment.

This document serves as the comprehensive technical reference for the assignment, detailing the core systems, database schema, and Application Programming Interface (API) design.

---

## 1. Core Architecture

The system utilizes a modern technology stack separated into distinct layers:

### Frontend Layer
- Framework: Next.js (React)
- Styling: TailwindCSS and shadcn/ui components
- State Management: React Context API
- Payment Integration: Stripe React SDK

### Backend Layer
- Runtime: Node.js
- Framework: Express.js
- Authentication: JSON Web Tokens (JWT) and Google OAuth
- Media Storage: Cloudinary Cloud Object Storage

### Database Layer
- Database: MongoDB (Atlas Cloud Cluster)
- Object Data Modeling: Mongoose

---

## 2. Advanced Feature Implementations

The platform incorporates six core functionalities, specifically engineered to demonstrate advanced backend logic, rate-limiting, and client-side profiling.

### 2.1 Posting Constraints Based on Follower Graph
To mathematically throttle content generation for unverified accounts, public posting privileges are coupled to the user's follower count. A strict `followerCount` matrix regulates daily allowances:
- 0 Followers: 0 posts allowed.
- 1 Follower: 1 post allowed per 24 hours.
- 2 Followers: 2 posts allowed per 24 hours.
- >10 Followers: Infinite posts allowed.

### 2.2 Secure Automated Password Generation
The account recovery flow bypasses manual user input to mitigate weak password vectors. The backend programmatically generates a secure, randomized 12-character cryptographic string comprised exclusively of alphabetical characters (omitting numbers and special characters). This system automatically dispatches the generated password to the user's verified email address.

### 2.3 Tiered Subscription Quotas and Time-Based Access Control
User question limits are dynamically throttled based on their active Stripe subscription tier (Free: 1, Bronze: 5, Silver: 10, Gold: Infinite). Furthermore, financial transactions within the application are historically sandboxed via a strict Time-Based Access Control (TBAC) mechanism, restricting payment attempts to a specified administrative window.

### 2.4 Proprietary Gamified Economy
The platform utilizes a tokenized economy to incentivize community moderation.
- Answer Submission: +5 Points
- Threshold Upvotes: +5 Points (triggered upon reaching 5 upvotes)
Users may transfer points to peers; however, to combat synthetic account farming, the platform enforces a minimum balance threshold, requiring >10 points prior to authorizing peer-to-peer ledger transfers.

### 2.5 Localization and Verification Routing
The application dynamically adapts its One-Time Password (OTP) verification channel based on the linguistic context defined by the user. Standard locales trigger SMS-based routing, whereas the French locale explicitly triggers an SMTP email payload, demonstrating complex context-aware dispatch routing.

### 2.6 Client Profiling and Authentication Firewalls
The authentication infrastructure leverages `UAParser` to map incoming connection vectors. This matrix directly influences friction requirements:
- Google Chrome: High friction; triggers mandatory secondary Email OTP.
- Microsoft Edge: Low friction; bypasses secondary challenges.
- Mobile Browsers: Restricted environment; subject to strict Time-Based blocks (authentication prohibited outside of an administrative window).
All connection vectors are systematically appended to a `loginHistory` audit schema.

---

## 3. Database Schema Design (MongoDB)

### User Entity
- `name` (String, Required)
- `email` (String, Required, Unique)
- `password` (String, Required)
- `about` (String)
- `tags` (Array of Strings)
- `joinedOn` (Date, Default: Date.now)
- `points` (Number, Default: 0)
- `following` (Array of Strings)
- `followers` (Array of Strings)
- `language` (String, Default: "en")

### Question Entity
- `questionTitle` (String, Required)
- `questionBody` (String, Required)
- `questionTags` (Array of Strings, Required)
- `noOfAnswers` (Number, Default: 0)
- `upVote` (Array of Strings, Default: [])
- `downVote` (Array of Strings, Default: [])
- `userPosted` (String, Required)
- `userId` (String)
- `askedOn` (Date, Default: Date.now)
- `answer` (Array of Subdocuments)

### Post Entity (Social Feed)
- `userId` (String, Required)
- `userName` (String, Required)
- `caption` (String, Required)
- `mediaType` (String, Enum: ['image', 'video', 'text'])
- `mediaUrl` (String)
- `likes` (Array of Strings, Default: [])
- `comments` (Array of Subdocuments)
- `shares` (Number, Default: 0)

### Subscription Entity
- `userId` (String, Required)
- `plan` (String, Enum: ['free', 'bronze', 'silver', 'gold'])
- `stripeSubscriptionId` (String)
- `stripeCustomerId` (String)
- `status` (String, Enum: ['active', 'inactive', 'canceled'])

---

## 4. RESTful API Documentation

### Authentication Routes (`/user`)
- `POST /user/signup`: Registers a new user and returns a JWT.
- `POST /user/login`: Authenticates a user. Returns a JWT or a `requiresOTP` status code based on client profiling constraints.
- `POST /user/oauth`: Authenticates a user via Google OAuth Identity Providers.

### Password Management (`/forgot-password`)
- `POST /forgot-password/request-otp`: Dispatches a verification code to the user.
- `POST /forgot-password/reset`: Validates the verification code, algorithmically generates a new password, and dispatches it via email.

### Question Routes (`/questions`)
- `POST /questions/Ask`: Submits a question. Throws a 403 Forbidden error if the user has exceeded their subscription-tier quota.
- `GET /questions/get`: Retrieves the global question pool.
- `DELETE /questions/delete/:id`: Removes a specific question.
- `PATCH /questions/vote/:id`: Upvotes or downvotes a question, triggering point ledger updates if thresholds are met.

### Social Routes (`/social`)
- `GET /social/getall`: Retrieves the public feed.
- `POST /social/create`: Publishes a new post to Cloudinary. Throws a 403 Forbidden error if the user has exceeded their follower-graph limit.
- `PATCH /social/follow/:id`: Toggles the follower state between the current user and a target identifier.

### Gamification Routes (`/points`)
- `PATCH /points/transfer`: Initiates a peer-to-peer point transaction. Fails if the initiator possesses 10 or fewer points.

### Language and Verification Routes (`/language`)
- `POST /language/request-otp`: Analyzes the target locale and dispatches an OTP via the assigned protocol (SMS/Email).
- `POST /language/verify`: Consumes the OTP and commits the locale modification to the User entity.

---

## 5. Security Measures

1. **Password Hashing:** All passwords are mathematically hashed utilizing `bcrypt` (12 computational rounds) prior to database insertion.
2. **Stateless Authentication:** Session state is managed purely via signed JSON Web Tokens (`jsonwebtoken`), ensuring stateless scalability.
3. **Role-Based Access Control (RBAC):** Critical endpoints enforce middleware validation (`auth.js`) to assert token validity and user identity.
4. **Cloudinary Asset Storage:** Media uploads bypass the physical application server and upload directly to Cloudinary, ensuring persistence across ephemeral hosting environments and preventing local disk saturation.
5. **CORS Policies:** Cross-Origin Resource Sharing is strictly configured to authorize communication solely from the designated frontend host origin.
