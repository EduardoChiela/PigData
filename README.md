# PigData (codinome) - Agora

> **Nome do app na UI:** Agora.
> **Cidade piloto:** Toledo - PR.
> **Estado atual:** prototipo web mock em `src/`.

Documentacao de produto em [`docs/`](./docs/).

## Rodar o prototipo

```sh
npm install
npm run dev
```

Stack: [`docs/stack.md`](./docs/stack.md) · Slice MVP: [`docs/mvp.md`](./docs/mvp.md)

## Como usar a documentacao

1. Identifique as areas tocadas (`README` / `docs/`).
2. Leia os arquivos + `docs/IMPLEMENTACAO.md`.
3. Implemente (UI mock ok na apresentacao).
4. Atualize docs da area + entrada em `IMPLEMENTACAO.md`.

## Rotas atuais

| Rota | Tela |
|------|------|
| `/bem-vindo` | Landing para visitante (busca atividade / cidade / data) |
| `/entrar` | Login / cadastro mock (cliente ou parceiro) |
| `/` | Mapa / busca (público; conta só para solicitar) |
| `/espaco/$slug` | Detalhe do espaço (tela cheia) |
| `/painel` | Painel do parceiro (agenda, solicitacoes, anuncios, cadastro) |
| `/ajuda` | Guia rapido da demo |
| `/minhas-reservas` | Solicitacoes/reservas do cliente + pagamento demo |
| `/buscar` | Redireciona para `/` (compat) |

Contas demo (senha `demo`): `ana.ribeiro@email.com` (cliente) · `parceiro@agora.local` (parceiro).

Proximas etapas reais: backend, auth real, Places API real, pagamento real, e-mail/WhatsApp providers e Google Calendar OAuth.

## Mapa dos documentos

| Arquivo | Parte do sistema |
|---------|------------------|
| [nomenclatura.md](./docs/nomenclatura.md) | Codinome vs nome comercial |
| [stack.md](./docs/stack.md) | Tecnologias e como rodar |
| [mvp.md](./docs/mvp.md) | Slice de apresentacao |
| [visao-geral.md](./docs/visao-geral.md) | Problema, proposta, fases |
| [usuarios-papeis.md](./docs/usuarios-papeis.md) | Papeis |
| [espacos.md](./docs/espacos.md) | Cadastro e perfil |
| [comodidades.md](./docs/comodidades.md) | Catalogo e carrinho |
| [busca-locacao.md](./docs/busca-locacao.md) | Favoritos, filtros, dia/hora |
| [cadastro-assistido-google.md](./docs/cadastro-assistido-google.md) | Places no onboarding |
| [agenda-calendario.md](./docs/agenda-calendario.md) | Disponibilidade |
| [mapa-busca.md](./docs/mapa-busca.md) | Mapa e camadas |
| [parceiros-rede.md](./docs/parceiros-rede.md) | Rede/parceiros |
| [reservas.md](./docs/reservas.md) | Solicitacao para confirmacao |
| [fluxo-telas.md](./docs/fluxo-telas.md) | Wireframe base |
| [guia-usuario.md](./docs/guia-usuario.md) | Guia demo / banca |
| [pagamento-demo.md](./docs/pagamento-demo.md) | Checkout simulado |
| [pagamentos-confianca.md](./docs/pagamentos-confianca.md) | Pagamento real |
| [metricas-impacto.md](./docs/metricas-impacto.md) | KPIs |
| [IMPLEMENTACAO.md](./docs/IMPLEMENTACAO.md) | Historico |

## Pitch rapido

Ver [visao-geral.md](./docs/visao-geral.md#resumo-para-conversa-com-clientes).
