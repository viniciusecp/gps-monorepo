---
id: chat-ia-inteligente
title: Chat IA Inteligente - Contexto do Usuário e Mais Ferramentas
status: completed
created: 2026-05-29T16:30:00Z
completed_at: 2026-05-29T22:03:30.749Z
---

# Intent: Chat IA Inteligente - Contexto do Usuário e Mais Ferramentas

## Goal

Tornar o chat com IA mais inteligente, usando contexto do usuário (número de veículos) para evitar perguntas desnecessárias, integrando reverse geocoding para mostrar nomes de ruas, e dando mais ferramentas para a IA consultar velocidades e posições históricas.

## Users

Usuários do app Rastroutions que usam o chat para consultar dados dos seus veículos.

## Problem

Hoje a IA do chat:
- Não sabe quantos veículos o usuário tem, então mesmo com 1 veículo ela pergunta "qual veículo?"
- Não consegue mostrar nome da rua nas localizações
- Tem ferramentas limitadas - não consegue consultar velocidade máxima do dia, nem a posição exata do veículo em um momento específico

## Success Criteria

- [ ] Usuário com 1 veículo: "onde está meu carro?" funciona sem perguntar qual veículo
- [ ] Respostas de localização incluem nome da rua (via reverse geocoding)
- [ ] IA consegue responder "qual a velocidade máxima hoje?"
- [ ] IA consegue responder "onde estava no dia X às Y horas?"
- [ ] Taxa de chamadas ao Nominatim respeita rate limits (só chamar para ponto único)

## Constraints

- Nominatim tem rate limit (~1 chamada/segundo) - só chamar quando houver 1 ponto
- Não quebrar sessões de chat existentes
- Manter compatibilidade com o streaming SSE atual
