---
id: "02"
title: "Integrar FABDropdownMenu na tela inicial"
intent: fab-dropdown-menu
complexity: low
mode: autonomous
status: pending
depends_on: ["01-create-fab-dropdown-component.md"]
created: 2026-05-28T00:00:00Z
---

# Work Item: Integrar FABDropdownMenu na tela inicial

## Description

Substituir os dois botões flutuantes atuais (HistoryFloatButton e ChatFloatButton) pelo novo componente FABDropdownMenu na tela inicial.

## Acceptance Criteria

- [ ] Remover imports de `HistoryFloatButton` e `ChatFloatButton` de `app/index.tsx`
- [ ] Adicionar import de `FABDropdownMenu`
- [ ] Configurar duas opções no dropdown: histórico e chat
- [ ] Manter navegação para `/history` e `/chat` funcional
- [ ] Passar `selectedImei` como parâmetro para a opção de histórico

## Technical Notes

- Importar componente de `@/components/fab-dropdown-menu`
- As opções devem usar ícones: "clock-rotate-left" para histórico e "comments" para chat
- Manter comportamento existente: chat sem parâmetros, histórico com imei