---
id: server-nominatim-service
title: Server - NominatimService + Config
intent: nominatim-integration
complexity: medium
mode: confirm
status: completed
depends_on: []
created: 2026-05-29T12:00:00Z
run_id: run-gps-monorepo-005
completed_at: 2026-05-29T14:58:42.521Z
---

# Work Item: Server - NominatimService + Config

## Description

Criar `NominatimService` no servidor seguindo o pattern do `OpenRouterService`. A classe deve usar native `fetch`, configurar `NOMINATIM_BASE_URL` via env var, e expor um método `reverse(lat, lon)` que retorna o `display_name`. Adicionar `NOMINATIM_BASE_URL` ao `.env.example`.

## Acceptance Criteria

- [ ] NominatimService class com método `reverse(lat: number, lon: number): Promise<{ display_name: string }>`
- [ ] Lê `NOMINATIM_BASE_URL` de env var (default: `https://nominatim.openstreetmap.org`)
- [ ] Usa native `fetch` com `AbortController` timeout
- [ ] Seta header `User-Agent` obrigatório pela Nominatim ToS
- [ ] Trata erros: API fora do ar, coordenadas inválidas, rate limit
- [ ] `.env.example` atualizado com `NOMINATIM_BASE_URL`

## Technical Notes

- Seguir exatamente o pattern de `OpenRouterService` (fetch nativo, env vars no constructor, sem axios)
- User-Agent obrigatório: `"GPS-Monorepo/1.0 (mobile-app)"`
- URL de exemplo: `https://nominatim.openstreetmap.org/reverse?lat=-23.5505&lon=-46.6333&format=jsonv2`
- Formato de resposta Nominatim: `{ display_name: "..." }`

## Dependencies

(none)
