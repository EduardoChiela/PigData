# Guia do usuário — Ágora (Espaços ACIT)

Guia para demonstração, banca e uso do **protótipo mock**. Versão in-app: rota [`/ajuda`](../src/routes/ajuda.tsx).

Relacionados: [fluxo-telas.md](./fluxo-telas.md), [usuarios-papeis.md](./usuarios-papeis.md), [mvp.md](./mvp.md), [rascunhos/planejamento-gabriel.md](./rascunhos/planejamento-gabriel.md).

## Contas demo

Senha de todas: `demo`

| Papel | E-mail | Para quê |
|-------|--------|----------|
| Cliente | `ana.ribeiro@email.com` | Mapa, detalhe, enviar solicitação |
| Parceiro ACIT | `parceiro@acit.toledo.br` | Painel `/painel` (agenda, solicitações, anúncios, cadastro) |
| Organizador ACIT | `organizador@acit.toledo.br` | Painel `/painel-acit` — **legado**; sujeito a remoção (backlog R2) |

Atalho na landing: **Ver espaços** entra automaticamente como cliente Ana e abre o mapa (`/`).

## Caminho do cliente

```text
/bem-vindo → Ver espaços (ou busca) → / (mapa)
  → detalhe do espaço → Escolher data e solicitar
  → data/evento → comodidades → revisão → solicitação enviada
```

1. Abra `/bem-vindo` (visitante).
2. Clique **Ver espaços** ou use a barra (cidade + data + período).
3. No mapa, selecione um espaço e envie a solicitação.
4. Acompanhe em `/minhas-reservas` e no sino. **Solicitação ≠ reserva.**
5. Se aprovada: **Continuar para pagamento** (demo) → reserva confirmada.

## Caminho do parceiro (administrativo)

1. Em `/entrar`, use a conta parceiro → redireciona para `/painel`.
2. **Agenda** — solicitações, hold, confirmadas, bloqueios.
3. **Solicitações** — aprovar / recusar / confirmar pagamento demo.
4. **Regras de reserva** — modo manual ou automático (requisitos).
5. **Meus anúncios** — listings publicados / status de homologação.
6. **Cadastrar espaço** — wizard (Places mock ou manual).
7. **Ajuda** (sidebar) → `/ajuda` com este resumo.

## Organizador ACIT (nota)

O painel `/painel-acit` existe no protótipo (calendário da rede, filiados, mensagens). O backlog da equipe prevê **retirar o papel organizador** (R2 — Rafael): a plataforma organiza; restam parceiros e clientes. Não dependa deste painel para a narrativa principal da demo.

## O que não pedir nesta demo

- Pagamento real / gateway
- Google Places API real
- Providers de e-mail / WhatsApp (só notificações in-app no mock)
- Autenticação real (sessão é mock em `localStorage`)

## Checklist — usar sem explicação oral (G5)

Critério compartilhado com a revisão de banca (Amabilly A3/A4):

| # | Pessoa sem briefing consegue… | Depende de |
|---|-------------------------------|------------|
| 1 | Da landing chegar ao mapa e ver espaços | CTA Ver espaços |
| 2 | Entender solicitação ≠ reserva pela própria UI | Landing “Como funciona” + copy |
| 3 | Enviar uma solicitação mock | Fluxo T04–T06 |
| 4 | No parceiro, achar e aceitar/recusar solicitação | `/painel` + este guia |
| 5 | Saber qual conta demo usar sem perguntar ao grupo | Tabela acima / `/ajuda` |

## Rotas úteis

| Rota | Quem |
|------|------|
| `/bem-vindo` | Visitante |
| `/entrar` | Login / cadastro mock |
| `/` | Mapa (autenticado) |
| `/painel` | Parceiro |
| `/painel-acit` | Organizador (legado) |
| `/ajuda` | Todos |
| `/minhas-reservas` | Cliente autenticado |
