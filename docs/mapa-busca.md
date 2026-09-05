# Mapa e busca

## Objetivo

Descoberta **disponibilidade-first**: o usuário entra pela data e vê no mapa, com prioridade, o que está livre — enriquecido por comodidades e com **parceiros ACIT em destaque**. Cobertura extra da cidade pode vir de uma camada Google (limitada).

## Fluxo de pesquisa desejado

1. Entrada principal: “Quando você precisa?” (data)
2. Capacidade / tipo de evento (opcional)
3. Filtros de comodidades (chips): o que o espaço oferece no catálogo
4. Mapa + lista com indicadores de disponibilidade
5. Clique no pin → card resumido (preço base, comodidades pedidas, selo ACIT) → pedido/reserva
6. Se indisponível → alternativas da rede parceira ([parceiros-rede.md](./parceiros-rede.md))

## Filtros

- Capacidade, bairro/região, **classe de espaço**, tipo de evento, preço
- Comodidades do catálogo que o espaço oferece — ver [comodidades.md](./comodidades.md)
- Atributos básicos de infraestrutura (checklist do espaço), se expostos na UI — separados do catálogo de comodidades
- Toggle: “Só verificados ACIT”
- Toggle (opcional, off por padrão): “Mostrar outros locais da cidade” (camada Google)

## Hierarquia visual no mapa e na lista

| Camada | Quem | Visual | Ação permitida |
|--------|------|--------|----------------|
| **A — ACIT verificado** | Cadastrado + homologado | Pin maior / cor da marca + selo “Verificado ACIT” | Agenda, comodidades, pedido/reserva |
| **B — Cadastrado** | Conta no sistema, sem selo forte | Pin médio | Pedido (regras a definir) |
| **C — Catálogo aberto (Google)** | Places/Maps, sem cadastro nosso | Pin discreto / cinza | Só “Abrir no Google” ou “Sugerir cadastro” — **sem agenda nem reserva** |

**Ordenação padrão da lista:** A → B → C (C só se o toggle estiver ligado).

Na indisponibilidade, priorizar alternativas da rede ACIT antes de qualquer sugestão genérica.

## Provedores Google (decisão)

- **Google Maps JavaScript API** — mapa interativo do PigData
- **Places API (New)** — dois usos distintos:
  1. **Onboarding do proprietário** (cadastro assistido) — ver [cadastro-assistido-google.md](./cadastro-assistido-google.md)
  2. **Camada C de descoberta** (pins limitados na busca do cliente) — abaixo

Não confundir: ajudar o dono a cadastrar ≠ exibir locais não cadastrados no mapa de busca.

## Camada Google Maps / Places na busca (viabilidade)

### Papel no produto

Complemento de **cobertura visual** no piloto (“existem outros lugares na cidade”), **não** substituto dos parceiros. O diferencial continua sendo data livre + comodidades + reserva + rede ACIT.

### O que a API entrega (típico)

Nome, endereço, localização, avaliação geral, fotos (com regras), tipos de lugar; às vezes telefone/site.

### O que a API **não** entrega (limitação de produto)

- Disponibilidade por data de evento
- Capacidade real para evento
- Comodidades/add-ons com preço
- Pedido/reserva na plataforma
- Selo ACIT / parceria
- Preço confiável de aluguel de salão

### Limitações de custo e uso

- Cobrança por chamada (Nearby/Text Search, detalhes, fotos); crédito mensal Google ajuda no início, mas escala com tráfego
- Atribuição obrigatória ao Google e regras de cache/armazenamento de dados Places (ToS)
- Qualidade irregular para “espaço de evento” (resultados genéricos)
- Risco de poluir o mapa e diluir o destaque ACIT
- Risco de o usuário sair da plataforma sem conversão

### Limitações que **nós** impomos de propósito (obrigatórias)

1. Sem indicador livre/ocupado no pin Google (não inventar disponibilidade)
2. Sem filtro fino de comodidades de evento nessa camada
3. Sem botão de reserva — só “Abrir no Google” / “Quero que este espaço entre na rede”
4. Quantidade limitada (ex.: poucos resultados perto / só com zoom alto)
5. Toggle desligado por padrão: “Mostrar outros locais da cidade”
6. CTA claro: espaços ACIT têm agenda e comodidades verificáveis

### Decisão de abordagem

| Abordagem | Veredito |
|-----------|----------|
| Só cadastrados no mapa | Mais limpo e conversível; pior percepção de “poucos lugares” no início |
| **Cadastrados + Google limitado** | **Escolhida:** cobertura + destaque ACIT |
| Google com a mesma UI dos parceiros | Evitar — dilui confiança e monetização |

## Relação com outras áreas

- Consome agenda de [agenda-calendario.md](./agenda-calendario.md)
- Lista, classes e comodidades: [espacos.md](./espacos.md), [comodidades.md](./comodidades.md)
- Cadastro assistido Places: [cadastro-assistido-google.md](./cadastro-assistido-google.md)
- Destaque e alternativas de [parceiros-rede.md](./parceiros-rede.md)
- Monetização de add-ons em [pagamentos-confianca.md](./pagamentos-confianca.md)

## Estado da implementação

- Decisões de produto documentadas (Maps JS + Places New; camada C limitada; cadastro assistido separado); ainda sem mapa/código de busca.
- Na implementação: custos estimados do piloto, Field Masks, session tokens e regras de ToS/atribuição.
