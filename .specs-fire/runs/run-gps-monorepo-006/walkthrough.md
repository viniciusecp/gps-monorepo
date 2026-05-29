---
run: run-gps-monorepo-006
intent: chat-ia-inteligente
generated: 2026-05-29T22:03:30Z
status: completed
---

# Walkthrough: Chat IA Inteligente

## Overview

Run `run-gps-monorepo-006` implementou 4 work items para tornar o chat com IA mais inteligente — contexto do usuário, reverse geocoding, e ferramentas enriquecidas de histórico/velocidade.

## Work Items

### 1. fix-speed-unit (autopilot)

**Arquivo**: `server/src/services/chat/tools.ts`

Correção de label de velocidade: "mph" → "km/h" em duas tools que já retornavam valores em km/h.
- `get_vehicle_current_location`: linha 91
- `get_vehicle_history`: linha 153

**Decisão**: Apenas label, sem mudança de comportamento.

### 2. context-aware-prompt (confirm)

**Arquivos**:
- `server/src/services/chat/session-store.ts` — Adicionado `metadata?: Record<string, unknown>` em `ChatSession`
- `server/src/services/chat/chat-service.ts` — System prompt dinâmico

**Como funciona**:
- Na primeira mensagem da sessão (`messages.length === 0`), carrega `bemService.getUserVehicles(userId)`
- Constrói prompt contextualizado:
  - **0 veículos**: prompt base, sem contexto extra
  - **1 veículo**: informa nome e IMEI, instrui IA a usar automaticamente
  - **Múltiplos**: informa quantidade, instrui IA a perguntar qual veículo

**Decisão**: Carregar veículos a cada sessão (não cachear) porque o método é chamado apenas uma vez por sessão e os dados são atualizados.

### 3. reverse-geocode-tool (confirm)

**Arquivos**:
- `server/src/services/chat/tools.ts` — Nova tool `reverse_geocode`, `geocodeService` no contexto das tools
- `server/src/services/chat/chat-service.ts` — `geocodeService` injetado no `ChatService`
- `server/src/app.ts` — `geocodeService` passado ao construtor do `ChatService`

**Nova tool**: `reverse_geocode(lat: number, lon: number)`
- Chama `NominatimService.reverse(lat, lon)`
- Retorna endereço formatado ou "Serviço de geolocalização indisponível" em caso de erro
- System prompt instrui: usar APENAS para ponto único

**Decisão**: Proteção contra rate limit via instrução no system prompt (não throttle técnico).

### 4. enhanced-history-speed-tools (confirm)

**Arquivo**: `server/src/services/chat/tools.ts`

**Melhorias no `get_vehicle_history`**:
- Novo parâmetro opcional `specificTime` (ISO string)
- Quando `specificTime` é fornecido:
  - Query em range [specificTime - 5min, +5min]
  - Encontra ponto GPS mais próximo da hora exata
  - Chama `reverse_geocode` automaticamente para mostrar endereço
- Sempre retorna `velocidade máxima` do período
- System prompt instrui IA a usar `specificTime` para perguntas "onde estava no dia X às Y"

## Estrutura Final das Tools

| Tool | Descrição |
|------|-----------|
| `list_vehicles` | Lista veículos do usuário |
| `get_vehicle_current_location` | Última localização (lat, lon, speed km/h) |
| `reverse_geocode` | Endereço a partir de coordenadas |
| `get_vehicle_history` | Histórico com specificTime, max_speed, reverse geocode |
| `get_vehicle_speed` | Velocidade atual |

## Fluxo de Dados

```
Usuário → POST /api/chat → ChatController → ChatService.processMessage()
                                                      │
                                          ┌───────────┴───────────┐
                                          │ 1ª msg? Load vehicles │
                                          │ Build system prompt   │
                                          └───────────────────────┘
                                                      │
                                          OpenRouter streamChat()
                                                      │
                                          ┌───────────┴───────────┐
                                          │ Tool call?            │
                                          │ → executeTool()       │
                                          │   ├─ GpsService       │
                                          │   ├─ BemService       │
                                          │   └─ GeocodeService   │
                                          └───────────────────────┘
                                                      │
                                          SSE events: token / tool_call / done
```

## Verificação

1. Iniciar servidor: `pnpm dev` em `server/`
2. Fazer login, obter JWT
3. Testar chat:
   ```bash
   curl -X POST http://localhost:3333/api/chat \
     -H "Authorization: Bearer <jwt>" \
     -H "Content-Type: application/json" \
     -d '{"message":"Onde esta meu carro?"}'
   ```
4. Verificar SSE events: deve retornar localização sem perguntar qual veículo (se tiver 1)
5. Testar "Qual a velocidade maxima hoje?" — deve usar get_vehicle_history com max_speed
6. Testar "Onde estava ontem as 14h?" — deve usar get_vehicle_history com specificTime
