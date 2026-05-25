---
id: vehicle-history
title: Histórico de Coordenadas por Período
status: completed
created: 2026-05-24T23:37:32Z
completed_at: 2026-05-25T00:38:32.200Z
---

# Intent: Histórico de Coordenadas por Período

## Goal

Permitir que o usuário do app consulte o histórico de coordenadas de um veículo em um período específico (data/hora inicial e final), visualizando os dados em lista ou rota no mapa.

## Users

Usuários do app mobile (motoristas, frotistas, administradores de frota) que precisam rastrear trajetos passados dos veículos.

## Problem

Atualmente o app exibe apenas as últimas 10 coordenadas em tempo real. Não há como consultar trajetos históricos por período, obrigando o usuário a usar sistemas externos ou simplesmente não ter acesso a esses dados.

## Success Criteria

- Usuário informa dia inicial, hora inicial, dia final, hora final
- Sistema retorna todas as coordenadas do veículo selecionado naquele período
- Visualização em lista com data/hora/velocidade; ao clicar, abre no mapa
- Visualização em rota no mapa (polyline) com alternância entre lista e mapa
- Funciona em Android e iOS
- Implementado no server (API) e no app

## Constraints

- Ordem cronológica (mais antigo primeiro)
- Sem limite de quantidade de registros
- Mesmo padrão de autenticação JWT existente
- Suporte a ambas as plataformas (Android e iOS)

## Notes

(none)
