# Reservas e pedidos

## Objetivo

Converter interesse (data/horário + espaço) em pedido estruturado e, depois, em reserva confirmada — com menos atrito que WhatsApp solto.

## Fase 1 (MVP)

- Pedido estruturado: cidade implícita do espaço, data ou intervalo, horário se aplicável, perfil do evento, capacidade, observações
- **Comodidades no pedido (carrinho):** cotação estimada — [comodidades.md](./comodidades.md)
- Modalidades de locação respeitando configuração do espaço — [busca-locacao.md](./busca-locacao.md)
- Espaço recebe lead qualificado
- Comunicação pode ser semi-manual
- Cotação sem cobrança real **ou** checkout via [pagamento-demo.md](./pagamento-demo.md) em apresentações

## Fluxo de comodidades no pedido

1. Espaço + data/horário → preço base (diária ou horas × preço/hora)
2. Aba Comodidades → lista do espaço
3. Cliente marca itens → soma estimada
4. Opcional: seguro demonstrativo (se habilitado) — [busca-locacao.md](./busca-locacao.md#8-seguro-opcional)
5. Pedido/reserva com snapshot de preços

## Fase 3 (conversão)

- Confirmação formal
- Políticas de cancelamento (locação ≠ seguro)
- Instant Book para agendas confiáveis
- Pagamento real (espaço + comodidades [+ seguro]) — [pagamentos-confianca.md](./pagamentos-confianca.md)

## Estado da implementação

- PedidoComodidade e modalidades definidos em produto; ainda sem fluxo de reserva no código.
- Pagamento demo: ver [pagamento-demo.md](./pagamento-demo.md).
