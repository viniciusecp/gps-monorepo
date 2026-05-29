---
id: context-aware-prompt
title: Server - System Prompt com Contexto do Usuário
intent: chat-ia-inteligente
complexity: medium
mode: confirm
status: completed
depends_on: []
created: 2026-05-29T16:30:00Z
run_id: run-gps-monorepo-006
completed_at: 2026-05-29T21:57:50.579Z
---

# Work Item: Server - System Prompt com Contexto do Usuário

## Description

Injetar contexto do usuário no system prompt da sessão de chat. Quando o usuário inicia uma conversa, o sistema deve carregar os veículos do usuário e, se houver apenas 1, incluir IMEI, nome e identificação no prompt para a IA responder perguntas como "onde está meu carro?" sem precisar perguntar qual veículo.

## Acceptance Criteria

- [ ] Na primeira mensagem da sessão, `ChatService` carrega veículos do usuário via `bemService.getUserVehicles()`
- [ ] Se usuário tem 1 veículo: system prompt inclui "Você tem 1 veículo cadastrado: {nome} (IMEI: {imei})" e instrução para usar este IMEI automaticamente
- [ ] Se usuário tem múltiplos veículos: system prompt inclui "Você tem N veículos cadastrados. Use list_vehicles para listá-los e pergunte qual o usuário quer consultar"
- [ ] Contexto é persistido na sessão (não recarregado a cada mensagem)
- [ ] Chat continua funcionando para usuários sem veículos
- [ ] Lint passa sem erros

## Technical Notes

- Modificar `chat-service.ts` no método que inicia a sessão
- `bemService.getUserVehicles()` já existe no `ChatService` (injetado no constructor)
- System prompt atual está inline no `chat-service.ts` — extrair para um template ou const estruturada
- Usar `getUserVehicles()` apenas na primeira mensagem (session.messageCount === 0) e armazenar no session.metadata
- IMPORTANTE: a lista de veículos pode vir sem `identificacao` — tratar como optional

## Dependencies

(none)
