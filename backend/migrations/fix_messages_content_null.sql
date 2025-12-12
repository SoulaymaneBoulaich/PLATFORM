-- Allow NULL content in messages table for audio-only messages
ALTER TABLE messages MODIFY COLUMN content TEXT NULL;
