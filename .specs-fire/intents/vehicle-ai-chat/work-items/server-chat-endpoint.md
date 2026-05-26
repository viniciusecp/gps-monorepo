---
id: server-chat-endpoint
title: Server - Chat SSE Endpoint
intent: vehicle-ai-chat
complexity: medium
mode: confirm
status: completed
depends_on:
  - server-chat-openrouter
  - server-vehicle-query-tools
  - server-chat-session
created: 2026-05-25T14:00:00Z
run_id: run-gps-monorepo-004
completed_at: 2026-05-26T00:08:48.228Z
---

# Work Item: Server - Chat SSE Endpoint

## Description

Create the `POST /api/chat` endpoint that receives user messages, orchestrates the AI conversation, and streams responses back via Server-Sent Events (SSE). The endpoint wires together the session store, vehicle query tools, and OpenRouter service.

## Acceptance Criteria

- [ ] Route `POST /api/chat` with JWT authentication middleware
- [ ] Request body: `{ message: string }`
- [ ] Response is SSE stream (`Content-Type: text/event-stream`)
- [ ] On each request: loads session history, sends to OpenRouter with tool definitions, streams assistant response back
- [ ] Handles tool calls: when AI requests a tool, executes handler, sends result back to AI, streams the follow-up response
- [ ] Stores messages in session store as conversation progresses
- [ ] Proper error handling: sends error events on failures
- [ ] Client can send `destroy` event or endpoint to close session
- [ ] Follows existing route pattern in `server/src/routes/`

## Technical Notes

Use Fastify's reply.raw for SSE streaming. Wire everything in a controller at `server/src/controllers/chat.ts` following the `controller → service` pattern. The service orchestrator (`chatService`) coordinates between session, tools, and OpenRouter.

## Dependencies

- server-chat-openrouter
- server-vehicle-query-tools
- server-chat-session
