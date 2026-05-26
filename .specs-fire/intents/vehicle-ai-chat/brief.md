---
id: vehicle-ai-chat
title: Mini Chat com IA para Consulta de Veículos
status: completed
created: 2026-05-25T14:00:00Z
completed_at: 2026-05-26T00:17:05.192Z
---

# Intent: Mini Chat com IA para Consulta de Veículos

## Goal

Adicionar um mini chat no app mobile onde o usuário faz perguntas em linguagem natural sobre seus veículos. O backend (Fastify) orquestra a conversa com um modelo de IA via OpenRouter, consulta o banco de dados para responder com dados reais, e entrega a resposta em streaming.

## Users

Usuários do app Rastroutions que possuem contas de rastreamento veicular cadastradas no app.

## Problem

Hoje o usuário precisa navegar por telas e filtros para encontrar informações sobre seus veículos. Não há uma interface conversacional que permita perguntas rápidas em linguagem natural como "onde está meu carro agora?" ou "qual a velocidade máxima hoje?".

## Success Criteria

- Chat funcional no app mobile com perguntas em linguagem natural
- Modelo de IA (OpenRouter) interpreta a pergunta e consulta o banco de dados
- Respostas entregues em streaming para o usuário
- Usuário só vê dados de veículos vinculados às contas que ele tem acesso
- Histórico da conversa mantido apenas na sessão (perdido ao fechar a tela)
- Backend expõe API de chat reutilizável para futura versão web

## Constraints

- Backend Fastify com integração OpenRouter
- Streaming de respostas via SSE
- Autenticação JWT garantindo isolationamento por usuário
- Histórico da conversa em memória (não persiste no banco)
- Apenas dados dos veículos do usuário autenticado são acessíveis

## Notes

(none)
