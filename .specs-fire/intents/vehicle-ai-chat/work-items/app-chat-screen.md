---
id: app-chat-screen
title: App - Chat Screen UI
intent: vehicle-ai-chat
complexity: medium
mode: confirm
status: completed
depends_on:
  - server-chat-endpoint
created: 2026-05-25T14:00:00Z
run_id: run-gps-monorepo-004
completed_at: 2026-05-26T00:17:05.184Z
---

# Work Item: App - Chat Screen Screen

## Description

Create the chat screen in the Expo React Native app. The screen displays a conversation UI with message bubbles, text input, and streaming response display. It connects to the backend SSE endpoint to send messages and receive streamed responses.

## Acceptance Criteria

- [ ] New screen accessible from the app navigation (e.g., tab or button)
- [ ] Message list with user and assistant bubbles, styled consistently with the app
- [ ] Text input field with send button
- [ ] Streaming responses displayed in real-time as tokens arrive
- [ ] Typing indicator while waiting for response
- [ ] SSE client integration using `EventSource` or fetch-based streaming reader
- [ ] Session lifecycle: session starts on screen mount, destroyed on unmount
- [ ] Error state handling (network error, API error) with retry option
- [ ] Loading state on initial render
- [ ] Empty state when no messages yet (suggest example questions)

## Technical Notes

Use Expo Router's file-based routing (`app/chat.tsx`). Follow existing patterns in `app/` for API calls (see `@/services/api` or similar). For SSE streaming in React Native, use fetch with `ReadableStream` reader or a polyfill. If no existing API client patterns exist, create a simple `chatApi` module.

## Dependencies

- server-chat-endpoint
