---
id: enhanced-history-speed-tools
title: Server - Aprimorar Ferramentas de Histórico e Velocidade
intent: chat-ia-inteligente
complexity: medium
mode: confirm
status: completed
depends_on:
  - reverse-geocode-tool
created: 2026-05-29T16:30:00Z
run_id: run-gps-monorepo-006
completed_at: 2026-05-29T22:03:30.742Z
---

# Work Item: Server - Aprimorar Ferramentas de Histórico e Velocidade

## Description

Aprimorar as tools de histórico e velocidade para a IA conseguir responder perguntas como "qual a velocidade máxima hoje?" e "onde estava no dia X às Y horas?". Incluir: (1) parâmetro `specificTime` em `get_vehicle_history` para buscar ponto mais próximo de um momento, (2) retornar velocidade máxima do período, (3) integrar reverse geocoding nos resultados quando for ponto único.

## Acceptance Criteria

- [ ] `get_vehicle_history` aceita parâmetro opcional `specificTime` (ISO string)
- [ ] Quando `specificTime` é fornecido, retorna o ponto GPS mais próximo daquele horário (lat, lon, speed, timestamp)
- [ ] Quando `specificTime` é fornecido e retorna 1 ponto, incluir `address` via reverse_geocode
- [ ] `get_vehicle_history` sempre retorna `max_speed` do período
- [ ] System prompt instrui IA a usar `specificTime` para perguntas "onde estava no dia X às Y"
- [ ] Lint passa sem erros

## Technical Notes

- Modificar a tool `get_vehicle_history` em `tools.ts`
- Para `specificTime`: buscar dados no range [specificTime - 1min, specificTime + 1min] e achar o ponto com menor diferença de tempo
- `max_speed` pode ser calculado no JavaScript a partir dos resultados (sem query SQL extra)
- Reverse geocode no resultado: chamar `geocodeService.reverse(lat, lon)` para o ponto único
- Retorno sugerido:
  ```typescript
  {
    total_points: number,
    max_speed: number | null,
    closest_point?: { lat, lon, speed, timestamp, address? },
    first_point?: { lat, lon, speed, timestamp },
    last_point?: { lat, lon, speed, timestamp },
    average_speed: number
  }
  ```

## Dependencies

- reverse-geocode-tool (para ter o geocodeService disponível nas tools)
