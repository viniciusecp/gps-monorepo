---
id: app-map-display-name
title: App - Map Screen Display Name
intent: nominatim-integration
complexity: medium
mode: confirm
status: completed
depends_on:
  - server-geocode-endpoint
created: 2026-05-29T12:00:00Z
run_id: run-gps-monorepo-005
completed_at: 2026-05-29T15:03:00.288Z
---

# Work Item: App - Map Screen Display Name

## Description

Atualizar `app/map.tsx` para chamar o endpoint `/api/geocode/reverse` ao montar a tela e exibir o `display_name` recebido abaixo do `MapView`.

## Acceptance Criteria

- [ ] Ao montar, faz fetch para `EXPO_PUBLIC_API_URL/api/geocode/reverse?lat=&lon=`
- [ ] Exibe `display_name` em texto abaixo do MapView
- [ ] Mostra estado de loading (ex: "Buscando endereço...")
- [ ] Mostra mensagem de erro se o fetch falhar
- [ ] Trata edge cases: coordenadas ausentes, erro de rede, API retornando erro

## Technical Notes

- Usar `useState` + `useEffect` para chamada assíncrona
- URL base vem de `process.env.EXPO_PUBLIC_API_URL`
- Display pode ser um card estilo info com fundo semitransparente sobre o mapa
- Manter o `BackButton` existente

## Dependencies

- server-geocode-endpoint
