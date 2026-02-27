-- Seed data for messaging: only Elly's conversations and messages (use username=elly to load)
-- Schema: users.username, conversations.user1_username/user2_username, messages.sender_username

INSERT INTO users (username, display_name) VALUES
('elly', 'Elly'),
('alice', 'Alice Chen'),
('bob', 'Bob Smith');

INSERT INTO conversations (id, user1_username, user2_username) VALUES
(1, 'elly', 'bob'),
(2, 'elly', 'alice');

INSERT INTO messages (conversation_id, sender_username, content, created_at, is_read) VALUES
-- Conversation 1: Elly & Bob
(1, 'bob', 'Hello Elly!', '2026-02-15 09:00:00', FALSE),
(1, 'bob', 'Did you get my email?', '2026-02-15 09:30:00', FALSE),
(1, 'elly', 'Yes, got it!', '2026-02-15 10:00:00', TRUE),
(1, 'bob', 'Thanks for the update!', '2026-02-15 10:30:00', FALSE),
-- Conversation 2: Elly & Alice
(2, 'alice', 'See you tomorrow', '2026-02-14 12:00:00', TRUE);
