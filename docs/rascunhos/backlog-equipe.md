# Backlog da equipe — Ágora (Espaços ACIT)

> **Status:** rascunho de planejamento  
> **Data:** 2026-09-14  
> **Integrantes:** Gabriel, Eduardo, Matheus, Rafael, Amabilly

## 1. Propósito

Este documento registra, de forma formal, os pontos de **correção**, **evolução** e **revisão** levantados pelo grupo para o sistema Ágora (Espaços ACIT).

Nesta etapa o objetivo é apenas **inventariar e distribuir** os itens. Cada integrante pesquisará o seu pacote; em seguida o grupo formalizará planejamentos detalhados e só então procederá à implementação no código e à atualização dos documentos oficiais em `docs/`.

Este arquivo **não substitui** a documentação de produto (`fluxo-telas.md`, `reservas.md`, `usuarios-papeis.md`, etc.). Alterações que mudem regras de negócio já documentadas deverão ser refletidas nos docs oficiais na fase de implementação.

## 2. Como usar

1. Cada integrante assume o pacote indicado na seção 3.
2. Pesquisa e anotações ficam sob responsabilidade individual (escopo, impacto, referências externas ou internas).
3. O grupo retorna com propostas de planejamento para discussão e implementação.
4. Itens marcados como alteração de regra de produto exigem atualização de `docs/` na mesma mudança de código.

**Status padrão dos itens:** `a pesquisar`.

## 3. Distribuição por integrante

### 3.1 Gabriel — UX, home e fluxo de telas

| # | Ponto | Tipo | Notas | Status |
|---|--------|------|-------|--------|
| G1 | Botão **Ver espaços** na home | Correção | CTA → mapa com login mock Ana; footer alinhado. | feito |
| G2 | Padronizar as linhas da página inicial | Correção / revisão visual | Ritmo `py-16 md:py-20`, CTAs hierárquicos, ícones distintos. | feito |
| G3 | Primeira tela e fluxo das páginas | Revisão | Bloco Como funciona + nota T01–T06 vs T07+ em `fluxo-telas.md`. | feito |
| G4 | Guia do usuário (foco administrativo) | Feature / documentação | `docs/guia-usuario.md` + rota `/ajuda` + link no painel. | feito |
| G5 | Usabilidade sem explicação oral | Revisão | Checklist no guia e em `/ajuda`. | feito |

**Docs de referência sugeridos:** `fluxo-telas.md`, `mvp.md`, `README.md` (rotas), `guia-usuario.md`.  
**Planejamento:** [planejamento-gabriel.md](./planejamento-gabriel.md).

---

### 3.2 Eduardo — Reservas, calendário e comunicação

| # | Ponto | Tipo | Notas | Status |
|---|--------|------|-------|--------|
| E1 | Conflito de datas (fila de datas) | Feature | Múltiplas solicitações; só confirmed bloqueia; concorrentes → waitlisted. | feito (mock) |
| E2 | Solicitações no calendário | Feature | Pendente / hold / confirmada / bloqueio / externo na agenda do parceiro. | feito (mock) |
| E3 | Locação estilo Airbnb (requisitos do dono) | Feature / regra de produto | Manual vs automática em Regras de reserva. | feito (mock) |
| E4 | Reserva por e-mail / WhatsApp | Feature | Spec: canais futuros; protótipo mantém Ágora como fonte de verdade (sem providers). | parcial (spec + in-app only) |
| E5 | Notificação na tela do cliente ao aceitar reserva | Feature | Sino + toast + `/minhas-reservas` + pagamento demo. | feito (mock) |

**Docs de referência sugeridos:** `reservas.md`, `agenda-calendario.md`, `busca-locacao.md`, rascunhos de painel do proprietário.  
**Especificação:** [planejamento-eduardo.md](./planejamento-eduardo.md).

---

### 3.3 Matheus — Confiança, avaliação e monetização

| # | Ponto | Tipo | Notas | Status |
|---|--------|------|-------|--------|
| M1 | Avaliação interna (local e cliente) | Feature | Sistema de avaliação mútua: cliente avalia o espaço; espaço/parceiro avalia o cliente. | a pesquisar |
| M2 | Porcentagem na reserva em vez de mensalidade | Feature / regra de produto | Modelo de cobrança baseado em percentual sobre a reserva, substituindo ou rivalizando a lógica de mensalidade. **Altera regra de produto** — alinhar com `pagamentos-confianca.md` / `parceiros-rede.md` na implementação. | a pesquisar |
| M3 | Perfil premium | Feature (ideia) | Conceito de perfil ou plano premium (benefícios, destaque ou funcionalidades extras a detalhar). | a pesquisar |
| M4 | Marcadores na mesma cor; avaliações por estrela | Correção / feature | Unificar a cor dos marcadores no mapa; representar avaliações em escala de estrelas. | a pesquisar |
| M5 | Selo de verificado da plataforma | Feature | Selo visual de verificação emitido pela plataforma (distinto ou complementar ao selo de rede já existente). | a pesquisar |

**Docs de referência sugeridos:** `mapa-busca.md`, `pagamentos-confianca.md`, `parceiros-rede.md`, `espacos.md`.

---

### 3.4 Rafael — Busca, IA e papéis

| # | Ponto | Tipo | Notas | Status |
|---|--------|------|-------|--------|
| R1 | Pesquisa assistida por IA / pesquisa rápida | Feature | Barra de pesquisa com assistência de IA e atalho de pesquisa rápida; priorizar recomendações relevantes no topo dos resultados. | a pesquisar |
| R2 | Remover lógica de organizador | Feature / regra de produto | A plataforma passa a ser a organizadora. No sistema restam apenas **parceiros** e **clientes**. Papel `organizador`, rota `/painel-acit` e painel associado removidos. | feito |

**Docs de referência sugeridos:** `busca-locacao.md`, `mapa-busca.md`, `usuarios-papeis.md`.

---

### 3.5 Amabilly — Backend, publicação e preparação para banca

| # | Ponto | Tipo | Notas | Status |
|---|--------|------|-------|--------|
| A1 | Trabalhar backend | Infra / evolução | Evoluir a camada de backend além do protótipo mock atual (persistência, APIs, autenticação real — escopo a definir na pesquisa). | a pesquisar |
| A2 | Disponibilização na internet e QR code | Infra / divulgação | Estudar publicação do sistema em ambiente acessível e uso de QR code para acesso (etapa posterior à estabilização do fluxo). | a pesquisar |
| A3 | Revisão transversal para a banca | Revisão | Garantir que o caminho das telas comunique o funcionamento da solução de ponta a ponta, não apenas o acabamento visual. | a pesquisar |
| A4 | Checklist de coerência telas × narrativa | Revisão | Coordenar um checklist: rotas, papéis, reserva e mensagem de produto alinhados para demonstração sem explicação oral. | a pesquisar |

**Docs de referência sugeridos:** `stack.md`, `mvp.md`, `fluxo-telas.md`, `visao-geral.md`.

## 4. Visão consolidada

| ID | Responsável | Ponto (resumo) | Tipo |
|----|-------------|----------------|------|
| G1 | Gabriel | Ver espaços → mapa | Correção |
| G2 | Gabriel | Padronizar linhas da home | Correção / revisão |
| G3 | Gabriel | Fluxo da primeira tela / páginas | Revisão |
| G4 | Gabriel | Guia do usuário (admin) | Feature / docs |
| G5 | Gabriel | Uso sem explicação prévia | Revisão |
| E1 | Eduardo | Conflito / fila de datas | Feature |
| E2 | Eduardo | Solicitações no calendário | Feature |
| E3 | Eduardo | Aprovação automática (estilo Airbnb) | Feature / regra |
| E4 | Eduardo | Reserva e-mail / WhatsApp | Feature |
| E5 | Eduardo | Notificação ao aceitar reserva | Feature |
| M1 | Matheus | Avaliação local e cliente | Feature |
| M2 | Matheus | % na reserva vs mensalidade | Feature / regra |
| M3 | Matheus | Perfil premium | Feature (ideia) |
| M4 | Matheus | Marcadores unificados + estrelas | Correção / feature |
| M5 | Matheus | Selo verificado da plataforma | Feature |
| R1 | Rafael | Pesquisa IA / rápida + recomendar | Feature |
| R2 | Rafael | Remover papel organizador | Feito |
| A1 | Amabilly | Backend | Infra |
| A2 | Amabilly | Deploy + QR code | Infra |
| A3 | Amabilly | Revisão para banca | Revisão |
| A4 | Amabilly | Checklist coerência | Revisão |

## 5. Próximos passos

1. **Pesquisa individual** por pacote (escopo, impacto em telas/docs, referências).
2. **Retorno ao grupo** com propostas de planejamento por item ou por pacote.
3. **Implementação** coordenada no repositório, com atualização dos documentos oficiais afetados e registro em `IMPLEMENTACAO.md`.

---

*Documento de backlog da equipe. Planejamentos detalhados e código serão tratados em etapas posteriores.*
