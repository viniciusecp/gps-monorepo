---
id: reverse-geocode-tool
title: Server - Reverse Geocoding Tool para IA
intent: chat-ia-inteligente
complexity: medium
mode: confirm
status: completed
depends_on:
  - context-aware-prompt
created: 2026-05-29T16:30:00Z
run_id: run-gps-monorepo-006
completed_at: 2026-05-29T22:00:50.456Z
---

# Work Item: Server - Reverse Geocoding Tool para IA

## Description

Adicionar uma nova ferramenta `reverse_geocode(lat, lon)` que usa o `NominatimService` já existente para obter o nome da rua/endereço a partir de coordenadas. Incluir instruções no system prompt para a IA só chamar esta tool quando estiver falando de um único ponto (para evitar rate limit da API pública do Nominatim).

## Acceptance Criteria

- [ ] Nova tool `reverse_geocode` registrada em `tools.ts` com parâmetros `lat` (number) e `lon` (number)
- [ ] Handler chama `NominatimService.reverse(lat, lon)` via `geocodeService`
- [ ] Retorna `display_name` ou mensagem "Endereço não encontrado"
- [ ] System prompt inclui instrução: "Use reverse_geocode APENAS quando estiver se referindo a um único ponto. Não use para listas ou múltiplas localizações."
- [ ] Erro de timeout/rede tratado graciosamente (retorna "Serviço de geolocalização indisponível")
- [ ] Lint passa sem erros

## Technical Notes

- `NominatimService` já está decorado no fastify como `geocodeService`
- Tools precisam acessar `geocodeService` — injetar via `executeTool` params (similar a `gpsService` e `bemService`)
- Adicionar `geocodeService` aos parâmetros de `executeTool()` e `ToolContext`
- Rate limit: Nominatim permite ~1 chamada/segundo — a tool em si não precisa throttle, a proteção é via instrução no system prompt
- Tratar `GeocodeError` se o serviço lançar

## Dependencies

- context-aware-prompt (system prompt base já modificado, só adicionar nova instrução)
