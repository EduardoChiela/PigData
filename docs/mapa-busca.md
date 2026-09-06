# Mapa e busca

## Objetivo

Descoberta **disponibilidade-first**: o usuário entra pela data (ou período/horário) e vê no mapa, com prioridade, o que está livre — enriquecido por comodidades e com **parceiros ACIT em destaque**. Cobertura extra da cidade pode vir de uma camada Google (limitada).

Funcionalidades novas de filtro, favoritos e modalidades de locação: [busca-locacao.md](./busca-locacao.md).

## Fluxo de pesquisa desejado

1. Escolhe **cidade** (uma por vez no MVP)
2. Define **quando**: dia/período ou horário (se o espaço permitir)
3. Capacidade / tipo de evento / área (m²) / pets / comodidades (opcional)
4. Mapa + lista com indicadores de disponibilidade
5. Favoritar; abrir detalhes → pedido/reserva
6. Se indisponível → alternativas da rede parceira ([parceiros-rede.md](./parceiros-rede.md))

## Filtros

- **Cidade** (troca atualiza lista + viewport do mapa)
- Data / período / horário + modalidade de locação — [busca-locacao.md](./busca-locacao.md), [agenda-calendario.md](./agenda-calendario.md)
- Área mínima/máxima (m²), capacidade, classe de espaço, tipo de evento, preço
- Aceita pets
- Comodidades do catálogo — [comodidades.md](./comodidades.md)
- Atributos de infra no anúncio (janelas, tomadas/tensão) — filtro de janelas não obrigatório no MVP
- Toggle: “Só verificados ACIT”
- Toggle (opcional, off por padrão): “Mostrar outros locais da cidade” (camada Google)

Filtros aplicados no **backend**, não só no frontend.

## Favoritos

Ver [busca-locacao.md](./busca-locacao.md#1-favoritos). Disponível em cards, mapa, detalhes e lista; persistência para autenticados.

## Hierarquia visual no mapa e na lista

| Camada | Quem | Visual | Ação permitida |
|--------|------|--------|----------------|
| **A — ACIT verificado** | Cadastrado + homologado | Pin maior / cor da marca + selo “Verificado ACIT” | Agenda, comodidades, pedido/reserva |
| **B — Cadastrado** | Conta no sistema, sem selo forte | Pin médio | Pedido (regras a definir) |
| **C — Catálogo aberto (Google)** | Places/Maps, sem cadastro nosso | Pin discreto / cinza | Só “Abrir no Google” ou “Sugerir cadastro” — **sem agenda nem reserva** |

**Ordenação padrão da lista:** A → B → C (C só se o toggle estiver ligado).

Na indisponibilidade, priorizar alternativas da rede ACIT antes de qualquer sugestão genérica.

## Provedores Google (decisão)

- **Google Maps JavaScript API** — mapa **vetorial** em vista oblíqua (`tilt` ~45° + `heading`, `roadmap` + Map ID) com **pins** nos espaços cadastrados. Sem textura/recoloração de prédios nesta fase.
- **Photorealistic 3D / `maps3d`:** adiados; podem voltar quando a cobertura e o custo fizerem sentido.
- **Fallback sem chave:** mapa mock isométrico local (mesmos pins) se `VITE_GOOGLE_MAPS_API_KEY` estiver vazia.
- **Places API (New)** — dois usos distintos:
  1. **Onboarding do proprietário** (cadastro assistido) — [cadastro-assistido-google.md](./cadastro-assistido-google.md)
  2. **Camada C de descoberta** (pins limitados na busca do cliente) — abaixo (toggle off no MVP atual)

Não confundir: ajudar o dono a cadastrar ≠ exibir locais não cadastrados no mapa de busca.

## Camada Google Maps / Places na busca (viabilidade)

### Papel no produto

Complemento de **cobertura visual** no piloto (“existem outros lugares na cidade”), **não** substituto dos parceiros. O diferencial continua sendo data livre + comodidades + reserva + rede ACIT.

### O que a API entrega (típico)

Nome, endereço, localização, avaliação geral, fotos (com regras), tipos de lugar; às vezes telefone/site.

### O que a API **não** entrega (limitação de produto)

- Disponibilidade por data/horário de evento
- Capacidade, área locável, pets, tomadas
- Comodidades com preço
- Pedido/reserva na plataforma
- Selo ACIT / parceria
- Preço confiável de aluguel

### Limitações de custo e uso

- Cobrança por chamada; crédito mensal Google ajuda no início
- Atribuição e regras de cache/ToS
- Qualidade irregular para “espaço de evento”
- Risco de poluir o mapa e diluir o destaque ACIT

### Limitações que **nós** impomos (obrigatórias)

1. Sem indicador livre/ocupado no pin Google
2. Sem filtro fino de comodidades nessa camada
3. Sem reserva — só “Abrir no Google” / “Sugerir cadastro”
4. Quantidade limitada
5. Toggle desligado por padrão
6. CTA: espaços ACIT têm agenda e comodidades verificáveis

### Decisão de abordagem

| Abordagem | Veredito |
|-----------|----------|
| Só cadastrados no mapa | Mais limpo; pior percepção de cobertura no início |
| **Cadastrados + Google limitado** | **Escolhida** |
| Google com a mesma UI dos parceiros | Evitar |

## Relação com outras áreas

- [busca-locacao.md](./busca-locacao.md) — favoritos, cidade, m², horário, pets, etc.
- [agenda-calendario.md](./agenda-calendario.md)
- [espacos.md](./espacos.md), [comodidades.md](./comodidades.md)
- [cadastro-assistido-google.md](./cadastro-assistido-google.md)
- [parceiros-rede.md](./parceiros-rede.md)
- [pagamentos-confianca.md](./pagamentos-confianca.md)

## Estado da implementação

- `/buscar`: mapa full-bleed; busca colapsável; filtros ao lado da lista; pins teardrop (ACIT verde claro / cinza); tags de comodidades nos cards.
- Clique no card/pin abre painel de detalhe (~80% da área à frente do mapa), com a lista aberta.
