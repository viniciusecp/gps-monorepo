---
id: docker-backend-deploy
title: Docker Build and Compose for Backend Production Deployment
status: ready
created: 2026-05-30T23:00:00Z
---

# Intent: Docker Build and Compose for Backend Production Deployment

## Goal

Create Docker build and docker-compose configuration to enable production deployment of the Fastify backend API server.

## Users

System administrators and CI/CD pipelines deploying the GPS tracking API to production environments.

## Problem

No containerization exists for the backend API, making production deployments manual and inconsistent across environments. Need a standardized Docker setup that can be used with external MySQL database.

## Success Criteria

- Dockerfile builds the server package successfully
- docker-compose.yml starts the backend with restart:always policy
- Environment variables are properly loaded from .env
- API is accessible on port 3333 (or configured port)
- Container restarts automatically on failure

## Constraints

- Use existing `.env` variables (DB_* and JWT_SECRET)
- No database container - external MySQL already in use
- Simple, production-focused Dockerfile (no hot-reload)
- No reverse proxy (nginx/traefik) needed
- Restart policy: always

## Notes

(none)