---
id: "01"
title: "Criar componente FABDropdownMenu reutilizável"
intent: fab-dropdown-menu
complexity: medium
mode: autonomous
status: pending
depends_on: []
created: 2026-05-28T00:00:00Z
---

# Work Item: Criar componente FABDropdownMenu reutilizável

## Description

Criar um componente de botão flutuante (FAB) com dropdown que exibe opções expandíveis com animação. O componente deve ser genérico e aceitar um array de opções, cada uma com ícone, label e ação.

## Acceptance Criteria

- [ ] Componente tipado com interface `DropdownOption` (icon, label, onPress)
- [ ] Botão principal com ícone "ellipsis-vertical" (três pontos)
- [ ] Estado aberto/fechado com `useSharedValue`
- [ ] Animação slide-up + zoom para opções usando `react-native-reanimated`
- [ ] Overlay sutil (semi-transparente, escuro) que cobre tela e fecha menu ao clicar
- [ ] Posição no canto inferior direito

## Technical Notes

- Usar `react-native-reanimated` v3 (já presente no projeto)
- Estilos usando `Colors` e `getSpacing` do tema
- `TouchableOpacity` com press states animados (scale 0.96 → 1.0)
- Overlay com `TouchableOpacity` style `flex: 1` que captura cliques fora