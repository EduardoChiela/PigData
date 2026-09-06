# Espaços (cadastro e perfil)

## Objetivo

Cadastro confiável dos locais parceiros: o que o cliente vê antes de pedir reserva — incluindo **classes**, **tipos de evento**, **atributos básicos** e **comodidades** do catálogo (ver [comodidades.md](./comodidades.md)).

## Cadastro: assistido (Google) ou manual

Decisão de produto: **cadastro assistido por Google Places**, com cadastro manual sempre disponível.

- Detalhamento: [cadastro-assistido-google.md](./cadastro-assistido-google.md)
- Google = identificação básica (Place ID + dados públicos revisados)
- PigData = fonte de verdade de locação, agenda, comodidades, preço, ACIT
- Selecionar no Places **não** comprova propriedade
- Duplicidade: um `google_place_id` não deve gerar dois espaços silenciosamente

## Conteúdo mínimo do perfil (MVP)

- Nome e endereço / geolocalização (para o mapa)
- Endereço normalizado: `city`, `state`, `country` (+ lat/lng)
- `google_place_id` (quando vinculado via Places)
- Fotos (próprias do proprietário; não importar fotos Google na v1)
- Capacidade
- **Área locável** `rental_area_m2`
- **Modalidades de locação:** dia/período e/ou horário (+ janelas horárias se aplicável) — [busca-locacao.md](./busca-locacao.md)
- **Classes de espaço** (uma ou mais) — [comodidades.md](./comodidades.md)
- **Tipos de evento atendidos** — inclui Aniversário
- **Atributos / checklist de qualidade** (estacionamento, acessibilidade, ar-condicionado, etc.)
- **Janelas:** `has_windows`, `window_count`
- **Tomadas por tensão:** `space_outlets` (127 V / 220 V) — declaração do proprietário, sem garantia de carga
- **Aceita pets:** `allows_pets` (+ `pet_policy` futuro)
- **Comodidades do catálogo** — oferece / incluso / preço
- Regras de uso
- Preço base (e preço/hora se permitir horário)
- Status na rede (parceiro ACIT / homologado)

## Comodidades

Detalhe completo em [comodidades.md](./comodidades.md). Resumo:

- Termo único: **comodidade** (não usar “add-on” como categoria separada)
- Catálogo mestre único no MVP; proprietário marca e precifica
- Inclusa = R$ 0; opcional = preço fixo do espaço
- No pedido: seleção estilo carrinho → total **estimado** (cotação)

### Exibição na busca e no perfil

1. Filtros/chips podem usar comodidades que o espaço oferece
2. Card: preço base + destaques de comodidades relevantes + selo ACIT se houver
3. Detalhe: separar **incluso** vs **opcional com preço**; atributos básicos de infra à parte

### Regras de qualidade

- Só filtrar/exibir o que o espaço declarou e mantém atualizado
- Declaração falsa = mesma gravidade de agenda desatualizada
- Comodidade opcional sem preço definido não entra como selecionável no carrinho até o dono precificar

## Fora do MVP inicial (ou fase seguinte)

- Filtrar o catálogo de comodidades por classe ou tipo de evento
- Pacotes (vários itens empacotados)
- Preço variável por pessoa/quantidade
- Galeria avançada / tour virtual
- Marketplace de fornecedores terceiros

## Regras de qualidade gerais

- Espaço sem agenda atualizada perde prioridade na busca
- Homologação ACIT concede selo e prioridade no mapa ([mapa-busca.md](./mapa-busca.md), [parceiros-rede.md](./parceiros-rede.md))

## Estado da implementação

- Perfis mock em `src/lib/mock-data.ts` (22 espaços Toledo) com campos do MVP.
- Detalhe (T03) no mapa: painel lateral em `/buscar` (`SpaceDetailPanel`) com galeria, perfil completo e CTA (pedido ainda pendente).
- Cadastro assistido ainda não.
