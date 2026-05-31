# RastroApp

Aplicativo mobile de rastreamento veicular em tempo real, construído com Expo e React Native. Consome a API `gps-api` para exibir coordenadas GPS, histórico de rotas e assistência por IA.

## Tecnologias

- **Framework**: Expo SDK 54 (React Native 0.81)
- **Roteamento**: Expo Router 6 (file-based)
- **Mapas**: react-native-maps com Google Maps
- **Navegação**: @react-navigation (bottom-tabs, elements)
- **Armazenamento**: AsyncStorage
- **Animação**: react-native-reanimated
- **Ícones**: @expo/vector-icons (Symbols)
- **Tema**: Dark mode (palheta escura com azul primário `#1447e6`)

## Scripts

```bash
pnpm start          # Inicia servidor de desenvolvimento Expo
pnpm android        # Executa no Android (expo run:android)
pnpm ios            # Executa no iOS (expo run:ios)
pnpm web            # Executa no navegador (expo start --web)
pnpm lint           # Linter (ESLint)
pnpm build:android  # Build EAS Android APK (perfil preview)
```

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do pacote baseado no `.env.example`:

```
EXPO_PUBLIC_API_URL=  # URL base da API (obrigatório, sem fallback)
GOOGLE_MAPS_API_KEY=  # Chave Google Maps para Android
EAS_PROJECT_ID=       # ID do projeto no EAS
```

Para builds de produção, as variáveis também devem estar em `eas.json`.

## Funcionalidades

### Adicionar Conta (`add-account.tsx`)
Tela de login que aceita email ou apelido + senha. Após autenticar, busca os veículos do usuário e armazena a conta no AsyncStorage. Permite múltiplas contas simultâneas.

### Home / Coordenadas (`index.tsx`)
Exibe uma barra horizontal com contas e seus veículos. Ao selecionar um veículo, mostra a lista das últimas coordenadas GPS (latitude, longitude, velocidade, data/hora). Inclui um FAB com atalhos para **Histórico** e **Chat**. Quando nenhum veículo está selecionado, exibe um estado vazio animado.

### Mapa (`map.tsx`)
Tela fullscreen com `react-native-maps` exibindo uma coordenada específica. Inclui:
- Marker pulsante com animação glow (react-native-reanimated)
- Painel inferior com endereço (reverse geocode via API), velocidade e data/hora
- Gradiente overlay para legibilidade

### Histórico (`history.tsx`)
Consulta o histórico de coordenadas de um veículo em um intervalo de datas. Oferece:
- Seletor de data/hora início e fim (modal no iOS, inline no Android)
- Chips de atalho: "Última hora" e "Hoje"
- Visualização em **Lista** (FlatList animada) ou **Mapa** (Polyline com marcadores verde/vermelho)
- Mapa com estilo escuro customizado

### Chat IA (`chat.tsx`)
Assistente veicular com IA (**Rastro AI**) via SSE streaming. Permite perguntas em linguagem natural como "Onde está meu carro agora?", "Qual a velocidade máxima hoje?", "Liste meus veículos". Inclui:
- Bolhas de chat com gradiente (usuário) e barra de destaque (assistant)
- Streaming de resposta em tempo real
- Indicador de digitação animado
- Botões de sugestão rápida
- Suporte a formatação markdown

## Autenticação

- Múltiplas contas armazenadas no AsyncStorage como JSON array (`"users"`)
- Cada conta possui `accessToken` (curta duração) e `refreshToken` (longa duração)
- Em caso de 401, o `tryAuthRequest` automaticamente renova o token via `POST /api/cliente/refresh`
- Sessões expiradas são removidas automaticamente

## Build com EAS

O projeto usa **EAS (Expo Application Services)** para builds de produção.

Perfis disponíveis em `eas.json`:

| Perfil | Uso |
|---|---|
| `development` | Build de desenvolvimento |
| `preview` | APK interno (distribuição via link) |
| `production` | Build de produção (App Store / Play Store) |

```bash
pnpm build:android  # eas build -p android --profile preview
```

## Estrutura do Projeto

```
app/
  _layout.tsx           # Layout raiz: auth check, ErrorPopupProvider
  index.tsx             # Home (veículos, coordenadas)
  add-account.tsx       # Login / adicionar conta
  map.tsx               # Mapa com marker animado
  history.tsx           # Histórico de rotas
  chat.tsx              # Chat IA

components/
  accounts/             # Seletor de contas/veículos
  coordinates/          # Lista de coordenadas
  empty-state/          # Estado vazio animado
  error-popup/          # Popup de erro global
  fab-dropdown-menu/    # FAB com opções
  submit-button/        # Botão com loading

src/
  context/              # Contextos React (ErrorPopupContext)
  services/             # API client (auth, chat SSE, geocode)
  theme/                # Tema escuro (cores, tipografia, espaçamento)

common/
  model.ts              # Interfaces compartilhadas (User, Vehicle, Coordinate)
```
