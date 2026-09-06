# Fluxo de telas (wireframe base)

## Status

**Base de UX — não definitiva.** Usar como referência para implementar e validar; telas e cópias podem mudar.

Codinome do repo: PigData ([nomenclatura.md](./nomenclatura.md)). Relacionados: [mapa-busca.md](./mapa-busca.md), [busca-locacao.md](./busca-locacao.md), [comodidades.md](./comodidades.md), [reservas.md](./reservas.md), [parceiros-rede.md](./parceiros-rede.md), [pagamento-demo.md](./pagamento-demo.md).

## Objetivo

Fluxo do **cliente** até a contratação. Visita presencial é **opcional** (atalho WhatsApp — ver [rascunhos/agendar-visita.md](./rascunhos/agendar-visita.md)); a reserva **não** exige visitação:

1. Informar quando precisa do espaço  
2. Encontrar disponíveis  
3. Ver detalhes  
4. Escolher comodidades  
5. Enviar **solicitação** (não é reserva ainda)  
6. Acompanhar análise do estabelecimento  
7. Aprovado ou recusado  
8. Pagar **só após aprovação**  
9. Reserva confirmada após pagamento  

---

## Fluxo principal

```text
Início → Buscar (data/período + local + filtros) → Resultados (lista + mapa)
  → Detalhes → Data/período + evento → Comodidades (cotação)
  → Revisar → Solicitação enviada → Estabelecimento analisa
       ├─ Recusada → próximas opções / fila
       └─ Aprovada → Pagamento → Reserva confirmada
```

**Regra-chave:** `Solicitação ≠ Reserva confirmada`. Confirmação = aprovação + pagamento.

---

## Telas (T01–T12)

| ID | Tela | Função |
|----|------|--------|
| T01 | Página inicial | Iniciar busca (onde, data, período) |
| T02 | Busca / resultados | Lista + mapa; filtros; destaque ACIT |
| T03 | Detalhes do espaço | Decidir solicitar; favoritar |
| T04 | Data, período e evento | Confirmar contratação |
| T05 | Comodidades | Carrinho / cotação estimada |
| T06 | Revisão | Conferir; **enviar sem pagar** |
| T07 | Solicitação enviada | Aguardando resposta |
| T08 | Acompanhamento | Timeline de status |
| T09 | Solicitação aprovada | Prazo para pagar |
| T10 | Reserva confirmada | Sucesso pós-pagamento |
| T11 | Minhas reservas | Lista solicitações/reservas |
| T12 | Detalhes da reserva | Consulta pós-confirmação |

### T01 — Página inicial (visitante)

Hero com busca rápida disponibilidade-first: Onde (cidade) | Data | Período (ou horário) → **Buscar espaços** → T02.

No protótipo: rota `/bem-vindo`, exibida quando o usuário **não** está autenticado. Com sessão mock ativa, a home é o mapa (`/`).

### T02 — Busca / resultados

**Layout atual:** mapa full-bleed; **busca colapsável** (chip resumo → expandir); **filtros** dropdown limpo ao lado da lista; **lista colapsável** com cards + tags de comodidades.

- Só espaços **disponíveis** no período  
- Destaque verificados ACIT; mapa prioriza parceiros  
- Pins: ACIT verde 3D (gradiente + highlight); demais cinza flat  
- Alterar data/filtros sem reiniciar tudo  
- Google Places: cobertura limitada, **sem** agenda/reserva na plataforma ([mapa-busca.md](./mapa-busca.md))

### T03 — Detalhes

Galeria, selo ACIT, endereço, capacidade, área, tipos de evento, comodidades/atributos, regras, preço base, favoritar → **Escolher data e solicitar** → T04.

No protótipo atual: painel à direita da lista em `/` (~80% do espaço restante sobre o mapa); a lista permanece aberta para trocar de espaço. Exemplos de itens no wireframe são ilustrativos; catálogo oficial em [comodidades.md](./comodidades.md).

### T04 — Data, período e evento (Tela 1 do pedido)

Ao tocar **Escolher data e solicitar**, o painel **expande em tela cheia** e inicia o pedido ([fluxo-comodidades](./rascunhos/fluxo-comodidades.md)):

1. Calendário (livre / parcial / ocupado)
2. Pergunta de visita opcional ([agendar-visita](./rascunhos/agendar-visita.md))
3. Período, tipo de evento, convidados → **Continuar para comodidades**

Vínculo obrigatório: espaço + data + período/horário.

### T05 — Comodidades (Tela 2 do pedido)

Checklist só do que o espaço oferece; inclusas listadas; opcionais marcáveis com preço; **total estimado em tempo real** (cotação) → T06.

### T06 — Revisão (Tela 3 do pedido)

Espaço, data/horário, evento, convidados, comodidades, total estimado.  
**Enviar solicitação** não realiza pagamento.

### T07 — Solicitação enviada

Status `AGUARDANDO RESPOSTA`; acompanhar ou voltar à busca.

### T08 — Acompanhamento

Timeline: enviada → aguardando → aprovação → pagamento → confirmada.

Estados possíveis: aguardando resposta | na fila de interesse | aprovada — aguardando pagamento | reserva confirmada | recusada | expirada | cancelada.

### T09 — Aprovada

Aprovação **não** confirma reserva. Estado: `Aprovada → aguardando pagamento`. Exibir prazo; CTA pagar.

### T10 — Reserva confirmada

Após pagamento OK.

### T11 / T12 — Minhas reservas e detalhes

Abas (todas / pendentes / confirmadas); detalhe com evento, comodidades, pagamento.

---

## Fila de interesse

**Não** é fila de visitação. É interesse no **mesmo espaço + mesma data + mesmo período/horário**.

- Ordem = ordem de entrada  
- Entrar na fila **não** garante reserva  
- Se a da frente for recusada/cancelada/expirar → próximo pode receber a oportunidade  
- Se alguém **confirma** (aprovação + pagamento) → demais daquela oportunidade encerram por indisponibilidade  
- Estabelecimento não fica pendente indefinidamente: **prazo de resposta** no sistema  

Wireframe conceitual: “Espaço temporariamente disputado” → entrar na fila **ou** escolher outro espaço.

---

## Pagamento (no fluxo de telas)

```text
Solicitação → Aprovação → Aguardando pagamento → Pago → Reserva confirmada
```

- Sem pagamento no envio da solicitação  
- Prazo para pagar; expiração libera o próximo da fila  
- Meios (PIX, cartão…) conforme [pagamento-demo.md](./pagamento-demo.md) / [pagamentos-confianca.md](./pagamentos-confianca.md)  
- Status de pagamento ≠ status da reserva  

---

## Indisponibilidade e rede ACIT

```text
Espaço indisponível → parceiros da rede na mesma data/período → exibir alternativas
```

Priorizar ACIT antes de opções genéricas externas ([parceiros-rede.md](./parceiros-rede.md)).

---

## Fluxo de estados (resumo)

```text
Solicitação criada → Aguardando resposta
  ├─ Recusada
  └─ Aprovada → Aguardando pagamento
        ├─ Expirada → próximo da fila
        └─ Pagamento OK → Reserva confirmada
```

---

## Regras de negócio (RB)

| ID | Regra |
|----|--------|
| RB01 | Solicitação ≠ reserva confirmada |
| RB02 | Pagar só após aprovação |
| RB03 | Fila = espaço + data + período/horário |
| RB04 | Ordem da fila = ordem de entrada |
| RB05 | Liberação da oportunidade se recusa/cancelamento/expiração |
| RB06 | Confirmada = aprovada + pago; demais da oportunidade encerram |
| RB07 | Prazo de pagamento após aprovação |
| RB08 | Comodidades e preços por espaço |
| RB09 | Valor pré-aprovação = cotação |
| RB10 | Agenda da plataforma = fonte de disponibilidade |
| RB11 | Destaque ACIT na busca e alternativas |
| RB12 | Google Places sem agenda/reserva por padrão |
| RB13 | Reserva não exige visita; visita opcional via WhatsApp ([agendar-visita](./rascunhos/agendar-visita.md)) |

---

## Estado da implementação

- T02 map-first é a home autenticada (`/`); T01 em `/bem-vindo` para visitante (sessão mock).
- T03: painel de detalhe (vitrine de comodidades incluso/opcional).
- T04–T06 no painel fullscreen (`BookingRequestFlow`): data/evento → comodidades com total → revisão/envio mock.
- Marca **Ágora**; login real pendente. T07+ ainda não.
