---
id: server-chat-session
title: Server - Chat Session Store
intent: vehicle-ai-chat
complexity: low
mode: autopilot
status: completed
depends_on: []
created: 2026-05-25T14:00:00Z
run_id: run-gps-monorepo-004
completed_at: 2026-05-25T23:54:56.199Z
---

# Work Item: Server - Chat Session Store

## Description

Create an in-memory session store for chat conversations. Each session is tied to a userId and holds the message history (system prompt + user messages + assistant responses). Sessions expire after inactivity or are destroyed when the user closes the chat.

## Acceptance Criteria

- [ ] In-memory Map-based store keyed by userId
- [ ] `getSession(userId)` — returns existing session or creates new one
- [ ] `addMessage(userId, role, content)` — appends message to session
- [ ] `getHistory(userId)` — returns message array for API call
- [ ] `destroySession(userId)` — clears session (called on chat close)
- [ ] `clearExpiredSessions()` — periodic cleanup of stale sessions (configurable TTL, default 30min)
- [ ] Proper TypeScript typing for messages

## Technical Notes

Simple implementation using `Map<string, Session>`. No database persistence needed per requirements. Keep system prompt concise: define the AI's role as a vehicle data assistant that uses tools to answer questions.

## Dependencies

(none)
