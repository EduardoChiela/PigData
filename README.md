# PigData (codinome) — Ágora (Espaços ACIT)

> **Nome do app (UI):** Ágora — [`docs/nomenclatura.md`](./docs/nomenclatura.md).  
> **Rede / selo:** Espaços ACIT.  
> **Cidade piloto:** Toledo - PR.  
> **Visual:** topbar charcoal + marca Ágora; acento verde ACIT nos selos.

Documentação de produto em [`docs/`](./docs/). Protótipo web mock em `src/`.

## Rodar o protótipo

```sh
npm install
npm run dev
```

Stack: [`docs/stack.md`](./docs/stack.md) · Slice MVP: [`docs/mvp.md`](./docs/mvp.md)

## Como usar a documentação

1. Identifique as áreas tocadas (`README` / `docs/`).
2. Leia os arquivos + `docs/IMPLEMENTACAO.md`.
3. Implemente (UI mock ok na apresentação).
4. Atualize docs da área + entrada em `IMPLEMENTACAO.md`.

## Rotas atuais

| Rota | Tela |
|------|------|
| `/bem-vindo` | Landing (T01) — visitante |
| `/entrar` | Login / cadastro mock (cliente ou parceiro ACIT) |
| `/` | Mapa / busca — home do **cliente** |
| `/painel` | Painel do **parceiro** (agenda, solicitações, anúncios) |
| `/buscar` | Redireciona para `/` (compat) |

Contas demo (senha `demo`): `ana.ribeiro@email.com` (cliente) · `parceiro@acit.toledo.br` (parceiro ACIT).

Próximas (ainda não): formulário completo de cadastro de espaço, `/minhas-reservas`, `/favoritos`, pagamento real.

## Mapa dos documentos

| Arquivo | Parte do sistema |
|---------|------------------|
| [nomenclatura.md](./docs/nomenclatura.md) | Codinome vs nome comercial |
| [stack.md](./docs/stack.md) | Tecnologias e como rodar |
| [mvp.md](./docs/mvp.md) | Slice de apresentação |
| [visao-geral.md](./docs/visao-geral.md) | Problema, proposta, fases |
| [usuarios-papeis.md](./docs/usuarios-papeis.md) | Papéis |
| [espacos.md](./docs/espacos.md) | Cadastro e perfil |
| [comodidades.md](./docs/comodidades.md) | Catálogo e carrinho |
| [busca-locacao.md](./docs/busca-locacao.md) | Favoritos, filtros, dia/hora… |
| [cadastro-assistido-google.md](./docs/cadastro-assistido-google.md) | Places no onboarding |
| [agenda-calendario.md](./docs/agenda-calendario.md) | Disponibilidade |
| [mapa-busca.md](./docs/mapa-busca.md) | Mapa e camadas |
| [parceiros-rede.md](./docs/parceiros-rede.md) | Rede ACIT |
| [reservas.md](./docs/reservas.md) | Solicitação → confirmação |
| [fluxo-telas.md](./docs/fluxo-telas.md) | Wireframe base |
| [pagamento-demo.md](./docs/pagamento-demo.md) | Checkout simulado |
| [pagamentos-confianca.md](./docs/pagamentos-confianca.md) | Pagamento real |
| [metricas-impacto.md](./docs/metricas-impacto.md) | KPIs |
| [IMPLEMENTACAO.md](./docs/IMPLEMENTACAO.md) | Histórico |

## Pitch rápido

Ver [visao-geral.md](./docs/visao-geral.md#resumo-para-conversa-com-clientes).
