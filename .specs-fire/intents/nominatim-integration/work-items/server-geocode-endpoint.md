---
id: server-geocode-endpoint
title: Server - Geocode Route & Controller
intent: nominatim-integration
complexity: low
mode: autopilot
status: completed
depends_on:
  - server-nominatim-service
created: 2026-05-29T12:00:00Z
run_id: run-gps-monorepo-005
completed_at: 2026-05-29T14:59:49.975Z
---

# Work Item: Server - Geocode Route & Controller

## Description

Criar rota `GET /api/geocode/reverse` com controller. Instanciar `NominatimService` em `app.ts`, decorar na instância Fastify e registrar a nova rota.

## Acceptance Criteria

- [ ] `GET /api/geocode/reverse?lat=&lon=` retorna `{ display_name: string }`
- [ ] Valida que lat/lon são números válidos
- [ ] Controller chama `NominatimService.reverse(lat, lon)`
- [ ] Rota registrada em `app.ts` com prefixo `/api`
- [ ] `NominatimService` instanciado e decorado como `geocodeService` em `app.ts`

## Technical Notes

- Seguir pattern de `routes/coordinates.ts` para validação de query params
- Controller em `controllers/geocode-controller.ts`
- Rota em `routes/geocode.ts`
- Rota NÃO precisa de autenticação (dados públicos)

## Dependencies

- server-nominatim-service
