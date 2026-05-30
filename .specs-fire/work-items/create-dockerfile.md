---
id: create-dockerfile
title: Create production Dockerfile for server package
intent: docker-backend-deploy
complexity: low
mode: autopilot
status: pending
created: 2026-05-30T23:00:00Z
---

# Work Item: Create production Dockerfile for server package

## Description

Create a production-ready Dockerfile that builds and runs the Fastify backend API server. The Dockerfile should use multi-stage build for optimization, install only production dependencies, and run the compiled application.

## Acceptance Criteria

- [ ] Dockerfile placed in `server/` directory
- [ ] Multi-stage build with builder and runtime stages
- [ ] Production dependencies only installed in final image
- [ ] TypeScript compiled during build phase
- [ ] App runs on port 3333 (configurable via PORT env var)
- [ ] Proper node environment set for production

## Technical Notes

Uses Node.js LTS base image. Build step runs `pnpm install --prod` after compiling TypeScript. Entry point should be `node dist/index.js`.

## Dependencies

(none)