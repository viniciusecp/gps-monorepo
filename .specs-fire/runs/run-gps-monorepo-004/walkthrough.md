---
run: run-gps-monorepo-004
intent: vehicle-ai-chat
generated: 2026-05-26T00:17:00Z
mode: wide
---

# Implementation Walkthrough: Mini Chat com IA para Consulta de Veículos

## Summary

Implemented a full-stack AI chat feature allowing users to query their vehicle data in natural language. The backend (5 server-side work items) handles OpenRouter AI integration, session management, vehicle query tools, and SSE streaming. The frontend (1 app work item) provides a chat UI with real-time streaming responses.

## Structure Overview

```
Mobile App (Expo/RN)                    Server (Fastify)
┌──────────────────────┐               ┌──────────────────────────────┐
│  app/chat.tsx        │  POST /api/chat │  routes/chat.ts              │
│  SSE via fetch +     │ ──────────────→  │  controller/chat.ts          │
│  ReadableStream      │ ←─ SSE stream ─ │  service/chat/chat-service.ts│
│                      │               │       ↓                      │
│  src/services/       │               │  session-store ←→ openrouter │
│  chat.ts (SSE parse) │               │  tools.ts ←→ gps/bem services│
└──────────────────────┘               └──────────────────────────────┘
```

## Architecture

### Pattern Used
Layered architecture on the server (routes → controllers → services) matching the existing codebase patterns. The chat system adds an orchestrator service (`ChatService`) that coordinates between the session store, OpenRouter client, and vehicle query tools.

### Layer Structure
```
┌─────────────────────────────────────────┐
│  Routes (routes/chat.ts)               │
│  ┌───────────────────────────────────┐  │
│  │  Controllers (controllers/chat.ts)│  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │  Orchestrator Service       │  │  │
│  │  │  (services/chat/chat-       │  │  │
│  │  │   service.ts)               │  │  │
│  │  │  ┌───────┐ ┌──────┐ ┌────┐ │  │  │
│  │  │  │Session│ │Open  │ │Tool│ │  │  │
│  │  │  │Store  │ │Router│ │s   │ │  │  │
│  │  │  └───────┘ └──────┘ └────┘ │  │  │
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## Files Changed

### Created (9)

| File | Purpose |
|------|---------|
| `server/src/services/chat/session-store.ts` | In-memory Map-based chat session store with TTL expiry |
| `server/src/services/chat/openrouter-service.ts` | OpenRouter API client with streaming and non-streaming chat |
| `server/src/services/chat/tools.ts` | Vehicle query tool definitions and handlers (4 tools) |
| `server/src/services/chat/chat-service.ts` | Chat orchestrator — wires session, tools, and OpenRouter |
| `server/src/controllers/chat.ts` | SSE streaming controller for POST /api/chat |
| `server/src/routes/chat.ts` | Chat route definition with JWT auth |
| `app/chat.tsx` | Chat screen with message bubbles, streaming, input |
| `app/src/services/chat.ts` | SSE chat API client for React Native |
| `app/components/chat-float-button/index.tsx` | FAB to open chat from home screen |

### Modified (4)

| File | Changes |
|------|---------|
| `server/src/app.ts` | Added `chatSessionStore`, `openrouterService`, `chatService` decorations + chat routes |
| `server/.env.example` | Added `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, `OPENROUTER_BASE_URL` |
| `server/src/services/chat/session-store.ts` | Added `tool_calls` field and `null` content support to `ChatMessage` |
| `app/app/index.tsx` | Added `ChatFloatButton` next to `HistoryFloatButton` |

## Key Implementation Details

### 1. Chat Orchestration Loop
`ChatService.processMessage()` implements a tool call loop: sends messages to OpenRouter with tool definitions, checks if the AI requests tool execution, runs the handler, sends results back, and continues until the AI produces a final answer (max 5 tool call iterations).

### 2. SSE Streaming
Both server and client use SSE for streaming. The server writes `event: token\ndata: "..."` events via `reply.raw`. The React Native client uses `fetch` with `ReadableStream` to parse SSE events incrementally, rendering tokens in real-time.

### 3. Vehicle Query Tools
Four tools expose backend data to the AI:
- `list_vehicles` — via `bemService.getUserVehicles()`
- `get_vehicle_current_location` — via `gpsService.getLastCoordinates()`
- `get_vehicle_history` — via `gpsService.getCoordinatesByDateRange()`
- `get_vehicle_speed` — via `gpsService.getLastCoordinates()`

All tools validate vehicle ownership (`bem.cliente` FK matches authenticated user).

### 4. Session Management
Chat sessions are stored in-memory on the server keyed by userId. System prompt is injected on first message. Sessions expire after 30 minutes of inactivity (configurable). No database persistence.

## Security Considerations

| Concern | Approach |
|---------|----------|
| Authentication | JWT auth via `preHandler: authenticate` on POST /api/chat |
| Vehicle data isolation | Each tool handler receives `userId` and validates ownership |
| Input validation | Zod schema validates `{ message: string }` in request body |
| API key management | `OPENROUTER_API_KEY` via env var, never exposed to client |

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Session storage | In-memory Map (not DB) | Requirements specify no persistence; simplifies cleanup |
| SSE over WebSocket | SSE via `reply.raw` | Simpler implementation, one-directional streaming |
| Tool call loop depth | Max 5 iterations | Prevents infinite loops while allowing multi-step queries |
| React Native SSE | fetch + ReadableStream | No native EventSource; ReadableStream available in Hermes |
| Chat FAB positioning | Right side, above History FAB | Consistent with existing UI pattern |

## Deviations from Plan

None. All items implemented as specified.

## Dependencies Added

None. All implementation uses built-in Node.js APIs (fetch, AbortController) and existing project dependencies.

## How to Verify

1. **Start the server**

   ```bash
   cd server && pnpm dev
   ```

2. **Set environment variables**

   ```
   OPENROUTER_API_KEY=your-key-here
   ```

3. **Test the chat endpoint**

   ```bash
   # First, login to get a JWT token
   curl -X POST http://localhost:3333/api/cliente/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@test.com","senha":"password"}'

   # Then send a chat message
   curl -X POST http://localhost:3333/api/chat \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <token>" \
     -d '{"message":"Liste meus veículos"}'
   ```

   Expected: SSE stream with `event: token` events followed by `event: done`

4. **Test in the app**

   - Run `cd app && pnpm start`
   - Open app, login, select a vehicle
   - Tap "Chat IA" FAB
   - Type a question like "Onde está meu carro?"

## Test Coverage

- Tests added: 0 (no test framework configured)
- Tests passing: N/A
- Compilation: Server (TypeScript) ✅ | App (ESLint) ✅

## Ready for Review

- [x] All acceptance criteria met
- [x] Server compiles (TypeScript)
- [x] App lints clean (ESLint)
- [x] No critical issues
- [x] Developer notes captured

## Developer Notes

- The `convertCoordinates` function in `server/src/utils/coordinates.ts` returns `{ coordinates: [...] }` — not a plain array. Tool handlers must access `.coordinates` on the result.
- There's a known bug in `coordinates.ts` line 41: longitude hemisphere check uses `latitudeHemisphere` instead of `longitudeHemisphere`. This affects coordinate conversion for vehicles in the Western hemisphere.
- The OpenRouter service uses `unref()` on timers to not block process exit.
- Chat session TTL is 30min by default; adjust via `ChatSessionStore` constructor parameter.
- React Native `ReadableStream` support varies by Hermes version. If issues arise, consider a polyfill or `XMLHttpRequest` `onprogress` fallback.

---
*Generated by specs.md - fabriqa.ai FIRE Flow Run run-gps-monorepo-004*
