# Pagamento simulado (demonstração)

## Status

**Decisão temporária:** modo de pagamento simulado só para demonstrações, apresentações e testes internos.

Nenhum valor real deve ser cobrado; nenhuma transação deve ir a adquirente, banco ou gateway enquanto `PAYMENT_MODE=demo` (ou equivalente) estiver ativo.

Codinome do repositório: PigData — nome comercial do app a definir ([nomenclatura.md](./nomenclatura.md)). Relacionado: [pagamentos-confianca.md](./pagamentos-confianca.md), [reservas.md](./reservas.md), seguro em [busca-locacao.md](./busca-locacao.md).

## Objetivo

Demonstrar ponta a ponta: método → processamento → aprovação/recusa → confirmação de reserva → histórico/status — **sem movimentar dinheiro**.

## Princípio

Checkout demo claramente separado do pagamento real. Banner obrigatório, por exemplo:

```text
Ambiente de demonstração
Nenhum pagamento real será processado.
```

Proibido no modo demo: enviar cartão a gateway real; persistir número completo ou CVV; PIX real; APIs financeiras de produção; sugerir liquidação real.

## Configuração

```env
PAYMENT_MODE=demo
```

```text
if demo → simulador interno
else    → provedor real
```

## Arquitetura desejada (migrável)

```text
Checkout
   → Payment Service
        ├── DemoPaymentProvider
        └── RealPaymentProvider
```

Contrato conceitual: `createPayment()`, `getStatus()`, `cancelPayment()`.

## Dados

```text
payments
--------------------------------
id, reservation_id, amount, method, status, demo_mode, created_at, updated_at
```

- `method`: `card` | `pix`
- `status`: `pending` | `processing` | `paid` | `failed`
- `demo_mode`: sempre `true` nessas transações
- `amount`: valor calculado da reserva (realista na UI)

Status da **reserva** separado do pagamento (ex.: `awaiting_payment` → `confirmed` só se `paid`).

## Fluxo

```text
Reserva → resumo → método (cartão demo / PIX demo)
  → processing (~1–2 s visual) → paid | failed → atualiza reserva
```

Endpoint conceitual: `POST /payments/demo` (ou padrão alinhado à API do projeto).

### Cartão demo

Campos só para UX. Não persistir PAN/CVV. Preferir enviar `scenario` (`approved` / `declined` / `error`).

Atalhos fictícios internos (convenção, não validação financeira):

| Número fictício | Resultado |
|-----------------|-----------|
| 4242…4242 | aprovado |
| 4000…0002 | recusado |
| 4000…9995 | erro |

### PIX demo

QR fictício (ex. payload interno `…-DEMO-PAYMENT-…`), confirmação automática após poucos segundos. Sem polling bancário.

## Cenários de apresentação

1. Aprovado → reserva confirmada  
2. Recusado → reserva não confirma; “Tentar novamente”  
3. Erro → mensagem sem cobrança; tentar de novo  

Histórico: marcar tipo **DEMONSTRAÇÃO**; nunca misturar com receita real.

## Segurança e isolamento

- Flag explícita; sem credenciais de produção no simulador  
- Sem adquirente, PIX real, webhooks reais, NF/comprovante fiscal real  
- Em produção só se isolado (ambiente/tenant/conta de apresentação) — usuários normais não podem “pagar de mentira” quando o produto for comercial  

## Fora do escopo do demo

Antifraude real, liquidação, conciliação, chargeback, split, repasse a proprietários, estorno bancário, emissão fiscal, etc.

## Critérios de aceite (resumo)

Banner demo; zero dinheiro real; cartão aprova/recusa; PIX QR fictício + auto-confirma; estados corretos; reserva só confirma se pago; `demo_mode` no banco; sem persistir cartão/CVV; substituível por provedor real.

## Estado da implementação

- Código do protótipo removido (`src/` apagado). Checkout demo continua a spec.
