# RFC 002: Adaptar App para Server v2

## Contexto

O backend (`server/`) foi refatorado para a v2, alterando toda a estrutura, endpoints, métodos de autenticação (JWT), e formatos de resposta. O aplicativo mobile (`app/`) ainda utiliza endpoints desatualizados, armazena credenciais em texto plano no AsyncStorage, e faz chamadas `fetch` brutas diretamente nos componentes.

## Objetivo

Preciso atualizar o aplicativo mobile para que atenda ao novo formato de endpoints do server.
Não quero fazer alterações visuais, ou seja, ter o mínimo de impacto possível na interface.
Garantir que não quebre em nada o fluxo atual.
Gerir a nova forma de autenticação com jwt e refresh token.
Novo fluxo:
  - quando usuario entrar no app e não tiver nenhum usuário já cadastrado, ele precisa ir para tela de login (neste momento, a tela de login não terá botão de voltar)
  - os erros da API precisam ser mostrados em algum tipo de poupup.
  - após logar o primeiro usuário, ele vai pra home do projeto e faz a busca pelos veículos das contas cadastradas.
  - e assim o fluxo segue normal.
  - caso usuário já tenha usuário cadastrado, ao entrar no app, ele vai direto pra tela index.
  - quando o token atual do usuário expirar, irá usar o refreshToken para pegar um token novo.
  - quando o token de algum usuário expirar, ele deve receber um popup avisando e remover esse usuário da lista de usuários. Caso seja o ultimo usuário da lista, precisa retornar o usuário a tela de login.
  - valide se os novos dados retornados pelo backend estão coerente e adapte se necessário.
