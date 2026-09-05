# Reservas e pedidos

## Objetivo

Converter interesse (data + espaço) em pedido estruturado e, depois, em reserva confirmada — com menos atrito que WhatsApp solto.

## Fase 1 (MVP)

- Pedido de reserva / contato estruturado (data, perfil do evento, capacidade, observações)
- **Comodidades no pedido (carrinho):** o cliente marca itens que o espaço oferece; total estimado em tempo real; snapshot dos preços no pedido — ver [comodidades.md](./comodidades.md)
- Espaço recebe lead qualificado (com cotação estimada espaço + comodidades)
- Comunicação pode ainda ser semi-manual (painel + notificação)
- **Sem cobrança real** no MVP — total = cotação/estimativa

## Fluxo de comodidades no pedido

1. Espaço + data → preço base
2. Aba Comodidades → lista do que aquele espaço oferece
3. Cliente marca itens → soma estimada
4. Pedido enviado com itens + total estimado

## Fase 3 (conversão)

- Confirmação formal
- Políticas de cancelamento
- Instant Book para espaços com agenda 100% confiável
- Pagamento / sinal sobre espaço + comodidades (ver [pagamentos-confianca.md](./pagamentos-confianca.md))

## Estado da implementação

- Modelo de PedidoComodidade definido em produto; ainda sem fluxo de reserva no código.
