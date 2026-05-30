---
id: create-docker-compose
title: Create docker-compose.yml for production deployment
intent: docker-backend-deploy
complexity: low
mode: autopilot
status: pending
depends_on:
  - create-dockerfile
created: 2026-05-30T23:00:00Z
---

# Work Item: Create docker-compose.yml for production deployment

## Description

Create a docker-compose.yml file that orchestrates the backend API container for production deployment. Should reference the Dockerfile, configure restart policy, and load environment variables.

## Acceptance Criteria

- [ ] docker-compose.yml placed in `server/` directory
- [ ] Service uses the Dockerfile from create-dockerfile work item
- [ ] Restart policy set to `always`
- [ ] Environment variables loaded from `.env` file
- [ ] Port 3333 exposed and mapped
- [ ] Container name clearly identifies the service

## Technical Notes

No database service included — uses external MySQL. Environment file path relative to server directory.

## Dependencies

- create-dockerfile