---
id: server-chat-openrouter
title: Server - OpenRouter Integration Service
intent: vehicle-ai-chat
complexity: medium
mode: confirm
status: completed
depends_on: []
created: 2026-05-25T14:00:00Z
run_id: run-gps-monorepo-004
completed_at: 2026-05-25T23:56:40.201Z
---

# Work Item: Server - OpenRouter Integration Service

## Description

Create an OpenRouter client service in the server that handles streaming API calls to OpenRouter. The service must support function calling (tools) so the AI can request vehicle data queries. Configuration via env vars (API key, model selection, base URL).

## Acceptance Criteria

- [ ] OpenRouterService class created in `server/src/services/`
- [ ] Supports streaming responses (returns async iterable or event emitter)
- [ ] Supports function/tool calling — passes tool schemas to OpenRouter and returns tool call responses
- [ ] Configurable via env vars: `OPENROUTER_API_KEY`, `OPENROUTER_MODEL` (default: `openai/gpt-4o`), `OPENROUTER_BASE_URL`
- [ ] Proper error handling: timeout, rate limiting, network errors
- [ ] Decorated on Fastify instance as `openrouterService` in `app.ts`

## Technical Notes

Follow existing service patterns in `server/src/services/`. Use `undici` or Node 18+ `fetch` for HTTP calls. Streaming should use Server-Sent Events format from OpenRouter. Tool definitions follow OpenAI-compatible function calling schema.

## Dependencies

(none)
