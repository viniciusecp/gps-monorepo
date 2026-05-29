---
id: fab-dropdown-menu
title: FAB Dropdown Menu para Ações da Tela Inicial
status: in_progress
created: 2026-05-28T00:00:00Z
---

# Intent: FAB Dropdown Menu para Ações da Tela Inicial

## Goal

Substituir dois botões flutuantes (histórico + chat) por um único botão FAB com dropdown animado contendo três pontos.

## Users

Usuários do app RastroApp que acessam a tela inicial.

## Problem

Interface atual com dois botões flutuantes ocupa espaço visual e não é escalável para futuras opções. A solução atual requer mudanças manuais em cada tela.

## Success Criteria

- Único botão FAB com ícone "três pontos" no canto inferior direito da tela inicial
- Dropdown com animação slide-up + zoom ao abrir
- Overlay sutil ao fundo que fecha o menu ao clicar
- Ícones coerentes para as opções (histórico e chat)
- Componente reutilizável tipado para uso entre telas do sistema
- Aplicado na tela inicial (`app/index.tsx`)

## Constraints

- Expo SDK 54 (React Native 0.81) + Expo Router 6
- Animação slide-up com zoom (combinação)
- Overlay sutil, não intrusivo
- Ícones da Expo/vector-icons ou libreria existente no projeto

## Notes

- As opções atuais são: histórico e chat
- O componente deve ser flexível para futuras adições
- Manter posição no canto inferior direito, similar aos botões atuais