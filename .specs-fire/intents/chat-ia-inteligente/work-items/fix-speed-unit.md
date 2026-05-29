---
id: fix-speed-unit
title: Server - Correção de Unidade de Velocidade
intent: chat-ia-inteligente
complexity: low
mode: autopilot
status: completed
depends_on: []
created: 2026-05-29T16:30:00Z
run_id: run-gps-monorepo-006
completed_at: 2026-05-29T21:56:13.607Z
---

# Work Item: Server - Correção de Unidade de Velocidade

## Description

Corrigir a label de velocidade em `get_vehicle_current_location` que atualmente exibe "mph" mas o valor numérico está em km/h (convertido de knots em `coordinates.ts`). A tool `get_vehicle_speed` já exibe "km/h" corretamente.

## Acceptance Criteria

- [ ] `get_vehicle_current_location` exibe "km/h" ao invés de "mph"
- [ ] `get_vehicle_history` também exibe "km/h" na velocidade média (ao invés de "mph")
- [ ] Lint passa sem erros

## Technical Notes

- Arquivo: `server/src/services/chat/tools.ts`
- Linha da current location: `${c.speed.toFixed(1)} mph` → `${c.speed.toFixed(1)} km/h`
- Linha da history: `${avgSpeed.toFixed(1)} mph` → `${avgSpeed.toFixed(1)} km/h`
- O valor em si está correto (km/h), só o label está errado

## Dependencies

(none)
