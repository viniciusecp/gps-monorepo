---
id: nominatim-integration
title: Integração com Nominatim Reverse Geocoding
status: completed
created: 2026-05-29T12:00:00Z
completed_at: 2026-05-29T15:03:00.298Z
---

# Intent: Integração com Nominatim Reverse Geocoding

## Goal

Integrar a API Nominatim OpenStreetMap Reverse Geocoding para exibir o endereço (display_name) de uma coordenada quando o usuário clica em um marcador na tela de mapa.

## Users

Usuários do rastreador GPS que querem ver o endereço correspondente a uma coordenada no mapa.

## Problem

Hoje a tela de mapa exibe apenas um marcador genérico "Ultima localização" sem qualquer informação de endereço, tornando a experiência pobre para o usuário que precisa entender onde a coordenada está localizada.

## Success Criteria

- Endpoint `GET /api/geocode/reverse?lat=&lon=` no servidor que faz proxy para Nominatim
- Serviço NominatimService estruturado seguindo padrão OpenRouterService
- Tela map.tsx exibe display_name vindo da API
- Config via env var NOMINATIM_BASE_URL

## Constraints

- Chamada sob demanda (sem cache)
- Rate limit da Nominatim (1 req/s) — risco aceito
- Endpoint não precisa de autenticação

## Notes

(none)
