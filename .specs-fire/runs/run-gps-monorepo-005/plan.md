---
run: run-gps-monorepo-005
work_item: server-nominatim-service
intent: nominatim-integration
mode: confirm
checkpoint: plan
approved_at:
---

# Implementation Plan: Server - NominatimService + Config

## Approach

Criar `NominatimService` em `server/src/services/geocode/nominatim-service.ts` seguindo o pattern do `OpenRouterService`. A classe terá um método `reverse(lat, lon)` que chama a Nominatim API via native `fetch`, com `AbortController` timeout, headers apropriados (User-Agent obrigatório), e tratamento de erros (timeout, HTTP errors, JSON malformed). Adicionar `NOMINATIM_BASE_URL` ao `.env.example`.

## Files to Create

| File | Purpose |
|------|---------|
| `server/src/services/geocode/nominatim-service.ts` | NominatimService class com método reverse() |

## Files to Modify

| File | Changes |
|------|---------|
| `server/.env.example` | Adicionar NOMINATIM_BASE_URL |

## Tests

| Test File | Coverage |
|-----------|----------|
| (no test framework configured) | N/A |

## Technical Details

- Seguir pattern do OpenRouterService: constructor lê env vars, fetch nativo com AbortController
- URL: `{baseUrl}/reverse?lat={lat}&lon={lon}&format=jsonv2`
- User-Agent header: `"GPS-Monorepo/1.0 (mobile-app)"` (obrigatório Nominatim ToS)
- Timeout: 10s (Nominatim é mais rápida que OpenRouter)
- Resposta esperada: `{ display_name: "Rua ABC, 123 - Cidade, Estado" }`
- Erros: lançar Error com mensagem descritiva para o controller tratar

---

## Work Item: server-geocode-endpoint

### Approach

Criar controller `controllers/geocode-controller.ts` e rota `routes/geocode.ts` para `GET /api/geocode/reverse?lat=&lon=`. Instanciar `NominatimService` em `app.ts`, decorar como `geocodeService`, e registrar a nova rota. Controller valida lat/lon via Zod schema, chama `NominatimService.reverse()`, retorna `{ display_name }`.

### Files to Create

| File | Purpose |
|------|---------|
| `server/src/controllers/geocode-controller.ts` | Controller que chama NominatimService.reverse() |
| `server/src/routes/geocode.ts` | Rota GET /api/geocode/reverse |

### Files to Modify

| File | Changes |
|------|---------|
| `server/src/app.ts` | Import NominatimService, instanciar, decorar, registrar rota |

### Tests

| Test File | Coverage |
|-----------|----------|
| (no test framework configured) | N/A |

---

## Work Item: app-map-display-name

### Approach

Atualizar `app/app/map.tsx` para buscar o `display_name` da API ao montar a tela. Adicionar `useState` para `displayName`, `loading` e `error`. Usar `useEffect` para fazer fetch para `${EXPO_PUBLIC_API_URL}/api/geocode/reverse?lat=&lon=`. Exibir o endereço em um card semitransparente sobreposto ao mapa.

### Files to Modify

| File | Changes |
|------|---------|
| `app/app/map.tsx` | Adicionar fetch ao endpoint, exibir display_name em card sobreposto |

### Tests

| Test File | Coverage |
|-----------|----------|
| (no test framework configured in app/) | N/A |

---
