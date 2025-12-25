# Backend Architecture Overview

This document summarizes the backend architecture, routing, middleware, models, and real-time features.

## Key Points

- **Framework**: Express.js
- **Database**: MySQL (connection pooling in `config/database.js`)
- **Authentication**: JWT + bcrypt
- **File Uploads**: Multer + Cloudinary
- **Real-time**: Socket.io (`socketHandler.js`) with JWT-based socket authentication

## Routes

All API routes are prefixed with `/api`. Route files are located in `backend/routes/`.

## Middleware

- `middleware/auth.js` - Protects routes via JWT
- `middleware/roleAuth.js` - Role-based access control
- `middleware/validators.js` - `express-validator` validation chains
- `middleware/errorHandler.js` - Centralized error handling

## Models

Models are implemented as query helpers using the MySQL connection pool. Look in `backend/models/` for `User.js`, `Property.js`, `Message.js`, `Offer.js`, etc.

## Real-time

Socket.io is initialized in `server.js` with handlers implemented in `socketHandler.js`. Online user tracking is implemented with an in-memory `Map` and emits `user_online` / `user_offline` events.

---

For API endpoint details and request/response examples, see `TECHNICAL_DOCUMENTATION_REPORT.md`.