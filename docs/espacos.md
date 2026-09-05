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
- `google_place_id` (quando vinculado via Places)
- Fotos (próprias do proprietário; não importar fotos Google na v1)
- Capacidade
- **Classes de espaço** (uma ou mais) — busca/filtro; lista em [comodidades.md](./comodidades.md)
- **Tipos de evento atendidos** — busca/filtro; inclui Aniversário
- **Atributos / checklist de qualidade** (infra básica: estacionamento, acessibilidade, ar-condicionado, etc.) — não são itens do catálogo de comodidades
- **Comodidades do catálogo** — o que oferece, se incluso ou opcional, preço por item
- Regras de uso
- Preço base (ou faixa)
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

- Cadastro assistido + modelo de comodidades definidos em produto; ainda sem código.
- Na implementação: modelo de dados com classes, tipos de evento, atributos básicos, `EspacoComodidade`, `google_place_id`.
