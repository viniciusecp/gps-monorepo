---
id: server-vehicle-query-tools
title: Server - Vehicle Query Tools for AI
intent: vehicle-ai-chat
complexity: medium
mode: confirm
status: completed
depends_on:
  - server-chat-openrouter
created: 2026-05-25T14:00:00Z
run_id: run-gps-monorepo-004
completed_at: 2026-05-25T23:58:51.060Z
---

# Work Item: Server - Vehicle Query Tools for AI

## Description

Define the function/tool schemas that the AI can invoke to query vehicle data, and implement the handlers that execute database queries using existing services. Each tool must respect user ownership — only return data for vehicles the authenticated user has access to.

## Acceptance Criteria

- [ ] Tool definitions created following OpenAI-compatible function schema format
- [ ] At minimum: `get_vehicle_current_location`, `get_vehicle_history` (by period), `list_vehicles`, `get_vehicle_speed` tools
- [ ] Each tool handler receives `userId` and validates vehicle ownership before querying
- [ ] Tool handlers use existing services (`gpsService`, `bemService`) or repositories
- [ ] Query results formatted as readable text for the AI to incorporate into responses
- [ ] Error responses when vehicle not found or no data available

## Technical Notes

Create in `server/src/services/chat/tools.ts` or similar. Each tool is defined as `{ type: "function", function: { name, description, parameters } }` plus a handler function. The endpoint service will pass these to the OpenRouter service.

## Dependencies

- server-chat-openrouter
