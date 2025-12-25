# Database Schema Summary

This file summarizes the core database schema for the `real_estate_db` used by the platform.

## Core Tables

- `users` - user accounts (buyers, sellers, admin)
- `agents` - agent profiles connected to users
- `properties` - property listings with seller and agent linkage
- `property_images` - images per property
- `conversations` - messaging conversations
- `messages` - messages with attachments
- `offers` - offers and negotiation history
- `favorites` - saved properties
- `transactions` - recorded transactions
- `appointments` - scheduled viewings and meetings
- `reviews` / `property_reviews` - rating systems
- `password_reset_tokens` - secure password reset workflow
- `notifications` - user notification tracking
- `user_settings` - user preferences (language, dark mode)

## Important Notes

- Character set: `utf8mb4` with unicode collation
- Engine: `InnoDB` for FK and transactions
- Indexes and performance tweaks live in `backend/migrations/add_performance_indexes.sql`

---

For full CREATE TABLE DDLs, see `db/init.sql` and the SQL files in `backend/migrations/`.