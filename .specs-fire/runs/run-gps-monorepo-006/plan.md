---
run: run-gps-monorepo-006
work_item: context-aware-prompt
intent: chat-ia-inteligente
mode: confirm
checkpoint: plan
approved_at: 
---

# Implementation Plan: context-aware-prompt

## Work Item: context-aware-prompt

### Approach
No início da sessão (primeira mensagem), carregar veículos do usuário via `bemService.getUserVehicles()` e montar um system prompt contextualizado. Adicionar campo `metadata` opcional no `ChatSession` para guardar os veículos e evitar recarregar a cada mensagem.

### Files to Modify

| File | Changes |
|------|---------|
| `server/src/services/chat/session-store.ts` | Adicionar `metadata?: Record<string, unknown>` em `ChatSession` |
| `server/src/services/chat/chat-service.ts` | Na primeira mensagem, carregar veículos e montar system prompt contextualizado |

### Files to Create
(none)

### Tests
(none — projeto não tem test framework configurado, validar via lint)

---

### Detalhamento da Lógica

**System Prompt** será dinâmico com base na quantidade de veículos:

**0 veículos:**
```
Você é um assistente especializado em consulta de veículos de rastreamento.
Você tem acesso a ferramentas que permitem consultar dados reais de veículos do usuário.
Responda sempre em português brasileiro de forma clara e objetiva.
Use as ferramentas disponíveis para buscar informações quando necessário.
Se o usuário perguntar algo que não pode ser respondido com os dados disponíveis, informe educadamente.
Nenhuma interação fora desse escopo deve ser respondida.
```

**1 veículo:**
```
Você é um assistente especializado em consulta de veículos de rastreamento.
[MESMO TEXTO BASE...]

CONTEXTO DO USUÁRIO:
Você tem 1 veículo cadastrado: {nome} (IMEI: {imei})
Use este IMEI automaticamente nas consultas — não pergunte qual veículo.
Quando o usuário disser "meu carro" ou "meu veículo", refira-se a este.
```

**Múltiplos veículos:**
```
[MESMO TEXTO BASE...]

CONTEXTO DO USUÁRIO:
Você tem N veículos cadastrados. Use list_vehicles para listá-los.
Pergunte ao usuário qual veículo ele quer consultar antes de usar as ferramentas.
```

---

---

## Work Item: reverse-geocode-tool

### Approach
Adicionar `geocodeService` (NominatimService) ao contexto das tools e registrar nova tool `reverse_geocode(lat, lon)`.

### Files to Modify

| File | Changes |
|------|---------|
| `server/src/services/chat/tools.ts` | Adicionar `geocodeService` no `ToolHandler`/`executeTool`; criar tool `reverse_geocode` |
| `server/src/services/chat/chat-service.ts` | Aceitar `geocodeService` no constructor e passar para `executeTool`; adicionar instrução de rate limit no system prompt |
| `server/src/app.ts` | Passar `geocodeService` ao construtor do `ChatService` |

### Detalhamento

1. **tools.ts**: `ToolHandler` passa a receber `{ gpsService, bemService, geocodeService }`. Nova tool `reverse_geocode` com parâmetros `lat` (number, -90~90) e `lon` (number, -180~180).
2. **chat-service.ts**: Constructor recebe `geocodeService: NominatimService`. `executeTool()` passa o service. Adicionar no system prompt: "Use reverse_geocode APENAS quando estiver falando de um único ponto. Não use para listas ou múltiplas localizações."
3. **app.ts**: `new ChatService(..., geocodeService)`

---

---

## Work Item: enhanced-history-speed-tools

### Approach
Aprimorar `get_vehicle_history` com `specificTime` opcional, `max_speed`, e reverse geocode no ponto único.

### Files to Modify

| File | Changes |
|------|---------|
| `server/src/services/chat/tools.ts` | Adicionar `specificTime` opcional; calcular `max_speed`; reverse geocode no ponto único; retornar resultado formatado enriquecido |
| `server/src/services/chat/chat-service.ts` | Adicionar instrução no system prompt sobre uso de `specificTime` |

### Detalhamento

1. **`get_vehicle_history`**: Adicionar parâmetro opcional `specificTime` (string ISO). Quando fornecido, usar [specificTime - 5min, specificTime + 5min] como range, achar o ponto mais próximo. Sempre calcular `max_speed` do período completo. Se `specificTime` resultar em ponto único, incluir `reverse_geocode` no resultado.
2. **system prompt**: Adicionar "Para perguntas 'onde estava no dia X às Y horas', use get_vehicle_history com o parâmetro specificTime."

---

Aprova o plano para `enhanced-history-speed-tools`? [Y/n/edit]
