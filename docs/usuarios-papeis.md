# Usuarios e papeis

## Papeis ativos

| Papel | Descricao | Necessidade principal |
|-------|-----------|------------------------|
| **Cliente final** | Quem precisa de um espaco para evento | Achar local livre rapido, solicitar e acompanhar reserva |
| **Parceiro** | Dono/gestor do espaco anunciado | Gerenciar agenda, solicitacoes, anuncios e regras de reserva |

## Responsabilidades

### Cliente final

- Buscar por cidade, data, periodo/horario e filtros.
- Ver detalhes do espaco.
- Enviar solicitacao com cotacao de comodidades.
- Acompanhar status em `Minhas reservas`.
- Pagar somente apos aprovacao, no modo demo.

### Parceiro

- Cadastrar o espaco, via fluxo manual ou assistido por Google mock.
- Completar dados comerciais: capacidade, area, fotos, preco, regras, comodidades e modalidades.
- Manter agenda confiavel.
- Analisar solicitacoes.
- Aprovar, recusar ou confirmar pagamento demo.
- Definir regras de reserva manual ou automatica.

## Decisao atual

O papel de organizador foi removido do sistema. A plataforma assume a organizacao da rede; no produto ficam apenas cliente e parceiro.

## Estado da implementacao

- Contas mock em `src/lib/mock-session.ts`: cliente Ana e parceiro Marcos.
- Login/cadastro mock em `/entrar`.
- Cliente vai para o mapa (`/`).
- Parceiro vai para `/painel` e tambem pode acessar o mapa.
- A rota `/painel-acit` e o painel de organizador foram removidos.
