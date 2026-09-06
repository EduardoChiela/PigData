# Pagamentos e confiança

## Objetivo

Fechar o ciclo marketplace: pagamento seguro, reputação e regras claras — incluindo monetização sobre **espaço + comodidades** (+ seguro quando houver parceiro).

## Camadas de pagamento

| Camada | Quando | Doc |
|--------|--------|-----|
| Cotação/estimativa no pedido | MVP sem cobrança | [comodidades.md](./comodidades.md), [reservas.md](./reservas.md) |
| **Pagamento simulado (demo)** | Apresentações / testes | [pagamento-demo.md](./pagamento-demo.md) |
| Pagamento real | Fase comercial | Este arquivo + provedor (Mercado Pago, Stripe, etc.) |
| Seguro | Demo até haver parceiro; depois integração real | [busca-locacao.md](./busca-locacao.md#8-seguro-opcional) |

## Itens previstos (pagamento real)

- Pagamento / sinal / comissão ou assinatura de parceiro
- PIX e práticas locais
- Avaliações pós-evento
- Políticas de cancelamento e no-show
- Seguro com parceiro autorizado (sem apresentar seguro “real” sem integração)

## Monetização e comodidades

Composição:

1. Preço do espaço (diária/período ou horas)
2. Comodidades selecionadas
3. Seguro (se contratado)
4. Receita da plataforma — preferencialmente comissão sobre o total

**Prioridade no piloto:** agenda + catálogo honestos; demo de checkout para apresentar; monetizar de verdade depois.

## Hipóteses de monetização

1. Comissão por reserva (espaço + comodidades [+ seguro])
2. Assinatura do espaço/organizador
3. Híbrido
4. Patrocínio / selo ACIT / destaque na busca

## Confiança

- Selo “Verificado ACIT”
- Separação visual parceiro vs pin Google
- Banner claro em ambiente demo de pagamento
- Avaliações e políticas na fase de conversão

## Estado da implementação

- Diretrizes documentadas; gateway real ainda sem código. Simulador demo também foi removido com o `src/`.
