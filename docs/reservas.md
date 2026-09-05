# Reservas e solicitações

## Objetivo

Converter interesse (data/horário + espaço) em **solicitação**, depois em **reserva confirmada** — com análise do estabelecimento e pagamento só após aprovação.

Fluxo de telas (wireframe base): [fluxo-telas.md](./fluxo-telas.md).

## Princípio

```text
Solicitar → Aguardar análise → Aprovar → Pagar → Confirmar
```

`Solicitação ≠ Reserva confirmada`. Sem etapa de visitação.

## Fluxo do cliente (alinhado ao wireframe)

1. Busca e detalhes ([mapa-busca.md](./mapa-busca.md), [busca-locacao.md](./busca-locacao.md))
2. Data/período + dados do evento
3. Comodidades (cotação) — [comodidades.md](./comodidades.md)
4. Revisão e **envio da solicitação** (sem pagamento)
5. Acompanhamento (aguardando / fila / aprovada / etc.)
6. Se aprovada: pagamento no prazo → reserva confirmada
7. Se recusada/expirada: outras opções ou próximo da fila

## Estados

| Estado | Significado |
|--------|-------------|
| Aguardando resposta | Estabelecimento ainda não decidiu |
| Na fila de interesse | Mesmo espaço+data+período; aguardando vez |
| Aprovada — aguardando pagamento | Pode pagar; reserva ainda não confirmada |
| Reserva confirmada | Aprovação + pagamento OK |
| Recusada | Estabelecimento recusou |
| Expirada | Ex. não pagou no prazo |
| Cancelada | Cancelamento explícito |

## Fila de interesse

Vinculada a **espaço + data + período/horário** (não é fila de visitação). Detalhe e regras: [fluxo-telas.md](./fluxo-telas.md#fila-de-interesse).

## Comodidades no pedido

Carrinho com snapshot de preços; total pré-aprovação = **estimativa**. Ver [comodidades.md](./comodidades.md).

## Pagamento

- Só após aprovação  
- Demo: [pagamento-demo.md](./pagamento-demo.md)  
- Real / monetização: [pagamentos-confianca.md](./pagamentos-confianca.md)  
- Seguro opcional (quando houver): [busca-locacao.md](./busca-locacao.md)  

## Indisponibilidade

Priorizar alternativas da rede ACIT ([parceiros-rede.md](./parceiros-rede.md)).

## Estado da implementação

- Modelo de estados e wireframe base documentados; ainda sem fluxo de reserva no código.
