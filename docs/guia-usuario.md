# Guia do usuario - Agora

Guia para demonstracao, banca e uso do prototipo mock. Versao in-app: rota [`/ajuda`](../src/routes/ajuda.tsx).

## Contas demo

Senha de todas: `demo`

| Papel | E-mail | Para que |
|-------|--------|----------|
| Cliente | `ana.ribeiro@email.com` | Mapa, detalhe, solicitacao e minhas reservas |
| Parceiro | `parceiro@agora.local` | Painel `/painel`: agenda, solicitacoes, anuncios, cadastro e regras |

## Caminho do cliente

```text
/bem-vindo -> Ver espacos -> / (mapa)
  -> detalhe do espaco -> Escolher data e solicitar
  -> data/evento -> comodidades -> revisao -> solicitacao enviada
  -> minhas reservas / sino -> pagamento demo se aprovado
```

1. Abra `/bem-vindo`.
2. Clique em **Ver espacos** ou use a busca.
3. No mapa, selecione um espaco.
4. Envie a solicitacao.
5. Acompanhe em `/minhas-reservas` e no sino.
6. Se aprovada, use **Continuar para pagamento** demo.

## Caminho do parceiro

1. Em `/entrar`, use a conta parceiro.
2. O login abre `/painel`.
3. **Agenda** mostra solicitacoes, holds, confirmadas e bloqueios.
4. **Solicitacoes** permite aprovar, recusar ou confirmar pagamento demo.
5. **Regras de reserva** alterna entre modo manual e automatico.
6. **Meus anuncios** lista os espacos da conta.
7. **Cadastrar espaco** abre o wizard mock.

## Fora desta demo

- Backend real.
- Auth real.
- Pagamento real / gateway.
- Google Places API real.
- Google Calendar OAuth real.
- Providers de e-mail / WhatsApp.

## Rotas uteis

| Rota | Quem |
|------|------|
| `/bem-vindo` | Visitante |
| `/entrar` | Login / cadastro mock |
| `/` | Cliente e parceiro autenticados |
| `/painel` | Parceiro |
| `/ajuda` | Todos |
| `/minhas-reservas` | Cliente autenticado |
