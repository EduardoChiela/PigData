# Reservas e solicitações

## Objetivo

Converter interesse (data/horário + espaço) em **solicitação**, depois em **reserva confirmada** — com análise do estabelecimento (manual ou automática) e pagamento só após aprovação.

Fluxo de telas: [fluxo-telas.md](./fluxo-telas.md). Spec detalhada E1–E5: [rascunhos/planejamento-eduardo.md](./rascunhos/planejamento-eduardo.md).

## Princípio

```text
Solicitar → (manual: pending | auto: regras) → Aprovar → Pagar → Confirmar
```

`Solicitação ≠ Reserva confirmada`. Visita presencial é **opcional**.

**Fonte de verdade:** no protótipo, motor mock em `src/lib/reservations.ts` (localStorage). E-mail/WhatsApp/Google Calendar **não** criam estado paralelo.

## Fluxo do cliente

1. Busca e detalhes
2. Data/período + evento + comodidades
3. Envio da solicitação (sem pagamento)
4. Acompanhamento em `/minhas-reservas` e sino de notificações
5. Se aprovada: pagamento demo → reserva confirmada
6. Se período já confirmado: fila de interesse (`waitlisted`)

## Estados (técnicos → UI)

| Técnico | Cliente |
|---------|---------|
| pending / requested | Aguardando aprovação |
| auto_approved / approved / awaiting_payment | Aguardando pagamento |
| confirmed | Reserva confirmada |
| waitlisted / conflict | Na fila / período ocupado |
| rejected / cancelled / expired | Recusada / cancelada / expirada |

Só `confirmed` e `awaiting_payment` (hold) **bloqueiam** o período no calendário. Solicitações pendentes **não** bloqueiam.

## Concorrência e fila (E1)

- Várias solicitações no mesmo espaço + intervalo são permitidas.
- Sobreposição: `startA < endB && endA > startB` (períodos do mock: manhã/tarde/noite/dia inteiro).
- Ao **confirmar** uma: concorrentes sobrepostos → `waitlisted`.
- Cancelamento de confirmada notifica interessados na fila (não confirma automaticamente).

## Aprovação (E3) — alteração de regra de produto

| Antes | Depois |
|-------|--------|
| Toda solicitação depende de análise manual | Proprietário escolhe **manual** ou **automática** por requisitos |

Regras automáticas no mock: capacidade, tipo de evento, antecedência mínima, data não busy, sem conflito confirmado/hold. Falha → `pending` (não rejeita sozinho). Conflito tem prioridade.

Configuração: painel parceiro → **Regras de reserva**.

## Calendário (E2)

Agenda do parceiro exibe: solicitação pendente, hold/pagamento, confirmada, visita, bloqueio manual, ocupação externa (busyDates).

## Comunicação (E4) e notificações (E5)

- E-mail/WhatsApp: preparados na spec; no protótipo só **in-app** (persistente + toast).
- Sino no header; CTA “Continuar para pagamento” quando aprovada.

## Pagamento

- Só após aprovação  
- Demo: botão de confirmação (cliente ou parceiro)  
- Real: [pagamentos-confianca.md](./pagamentos-confianca.md)

## Estado da implementação

- Motor mock: estados, conflito/fila, hold, autoaprovação, histórico leve, notificações.
- UI: calendário com estados, solicitações no painel, regras, `/minhas-reservas`, sino.
- Ainda não: backend real, e-mail/WhatsApp providers, Google Calendar OAuth, race condition transacional.
