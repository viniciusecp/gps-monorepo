## Work Item: server-chat-session

### Test Results
- Passed: N/A (no test framework configured)
- Failed: 0
- Skipped: 0

### Compilation Check
- TypeScript build: ✅ PASS (no errors)
- Biome lint: ✅ PASS (no new errors)

### Acceptance Criteria Validation
- [x] In-memory Map-based store keyed by userId
- [x] `getSession(userId)` — returns existing session or creates new one
- [x] `addMessage(userId, role, content)` — appends message to session
- [x] `getHistory(userId)` — returns message array for API call
- [x] `destroySession(userId)` — clears session
- [x] `clearExpiredSessions()` — periodic cleanup of stale sessions (configurable TTL, default 30min)
- [x] Proper TypeScript typing for messages (ChatMessage, ChatRole, ChatSession)

---

## Work Item: server-chat-openrouter

### Test Results
- Passed: N/A (no test framework configured)
- Failed: 0
- Skipped: 0

### Compilation Check
- TypeScript build: ✅ PASS (no errors)
- Biome lint: ✅ PASS (no new errors)

### Acceptance Criteria Validation
- [x] OpenRouterService class created in `server/src/services/chat/openrouter-service.ts`
- [x] Supports streaming responses (async generator yielding SSE chunks)
- [x] Supports function/tool calling — passes tool schemas to OpenRouter and returns tool call responses
- [x] Configurable via env vars: `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, `OPENROUTER_BASE_URL`
- [x] Proper error handling: timeout (AbortController), rate limiting (429), network errors
- [x] Decorated on Fastify instance as `openrouterService` in `app.ts`

---

## Work Item: server-vehicle-query-tools

### Test Results
- Passed: N/A (no test framework configured)
- Failed: 0
- Skipped: 0

### Compilation Check
- TypeScript build: ✅ PASS (no errors)
- Biome lint: ✅ PASS (no new errors)

### Acceptance Criteria Validation
- [x] Tool definitions created following OpenAI-compatible function schema format
- [x] `list_vehicles` tool — returns user's vehicles
- [x] `get_vehicle_current_location` tool — latest coordinates by IMEI
- [x] `get_vehicle_history` tool — positions by date range
- [x] `get_vehicle_speed` tool — current speed from latest GPS reading
- [x] Each tool handler validates vehicle ownership (`bem.cliente` matches userId)
- [x] Tool handlers use existing services (`gpsService`, `bemService`)
- [x] Query results formatted as readable text for AI to incorporate into responses
- [x] Error responses when vehicle not found or no data available

---

## Work Item: server-chat-endpoint

### Test Results
- Passed: N/A (no test framework configured)
- Failed: 0
- Skipped: 0

### Compilation Check
- TypeScript build: ✅ PASS (no errors)
- Biome lint: ✅ PASS (no new errors)

### Acceptance Criteria Validation
- [x] Route `POST /api/chat` with JWT authentication middleware (`preHandler: authenticate`)
- [x] Request body: `{ message: string }` validated via Zod
- [x] Response is SSE stream (`Content-Type: text/event-stream`)
- [x] Loads session history, sends to OpenRouter with tool definitions, streams response
- [x] Handles tool calls: executes handler, sends result back to AI, streams follow-up response
- [x] Stores messages in session store as conversation progresses
- [x] Proper error handling: sends error events on failures
- [x] Follows existing route pattern (routes → controller → services)

---

## Work Item: app-chat-screen

### Test Results
- Passed: N/A (no test framework configured)
- Failed: 0
- Skipped: 0

### Compilation Check
- ESLint: ✅ PASS (no errors, no warnings)

### Acceptance Criteria Validation
- [x] New screen accessible from app navigation (ChatFloatButton on home screen → `/chat`)
- [x] Message list with user and assistant bubbles, styled consistently with app theme
- [x] Text input field with send button
- [x] Streaming responses displayed in real-time as tokens arrive
- [x] Typing indicator (animated dots) while waiting for response
- [x] SSE client integration using `fetch` + `ReadableStream`
- [x] Session lifecycle: session managed by backend (TTL cleanup)
- [x] Error state handling (network error, API error) with retry option
- [x] Loading/empty state with suggested questions
