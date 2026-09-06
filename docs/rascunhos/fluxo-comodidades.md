# Fluxo de Telas — Comodidades no site

> Status: **rascunho de discussão**, ainda não incorporado aos docs oficiais do projeto (`docs/comodidades.md`, `docs/reservas.md`, `docs/fluxo-telas.md`). Guardar aqui até fecharmos o desenho e decidirmos formalizar.

## 1. Objetivo

Detalhar **onde e como o catálogo de comodidades aparece pro cliente**, do card de busca até o pedido final — complementando `docs/comodidades.md` (que já define a mecânica de preço/carrinho) com o desenho de tela por tela.

## 2. Fluxo completo

```mermaid
flowchart TD
    A[Card do espaço na busca<br/>mostra tags de comodidades] --> B[Cliente clica no card/pin]
    B --> C[Perfil do espaço abre<br/>lista comodidades: inclusas vs opcionais com preço]
    C --> D[Cliente clica em<br/>"Solicitar reserva"]
    D --> E[Tela 1 do pedido:<br/>data, tipo de evento, capacidade]
    E --> F[Tela 2: aba Comodidades<br/>checklist com preço ao lado]
    F --> G[Cliente marca os itens<br/>que quer]
    G --> H[Continha soma em tempo real<br/>no rodapé/lateral]
    H --> I[Tela 3: Revisão final<br/>resumo + total estimado]
    I --> J[Envia pedido ao espaço]
```

## 3. Por que separar em dois momentos (vitrine vs seleção)

- **No perfil do espaço**, comodidades são só informação — ajuda o cliente a decidir se aquele espaço serve, sem compromisso nenhum
- **No pedido**, comodidades viram seleção real com preço somando — é o momento de decisão, com a mecânica de carrinho já documentada em `docs/comodidades.md`

Evita uma tela só gigante misturando "conhecer o espaço" com "montar o carrinho" — cada etapa tem um único objetivo.

## 4. Wireframes das telas

### Tela 0 — Card na busca
*(já existe no protótipo: `src/components/amenity-tags.tsx`)*

```
┌─────────────────────────────┐
│ [foto]                      │
│ Salão Vila Verde             │
│ 150 pessoas · R$ 1.500/4h    │
│ 🏷️ Wi-Fi dedicado  🏷️ Gerador │
└─────────────────────────────┘
```

As tags mostram um "gostinho" das comodidades antes de abrir o perfil — funciona como isca visual na lista/mapa.

### Tela 1 — Perfil do espaço
*(já existe no protótipo: `src/components/space-detail-panel.tsx`)*

```
Salão Vila Verde
[galeria de fotos]

Comodidades
✓ Wi-Fi dedicado — incluso
✓ Estacionamento — incluso
+ Cascata de chocolate — R$ 250 (opcional)
+ Coffee break — R$ 300 (opcional)

[ Solicitar reserva ]   [ Agendar visita ]
```

Aqui o cliente já vê preço, mas **ainda não marca nada** — é vitrine, não carrinho.

### Tela 2 — Pedido, aba "Comodidades"
*(ainda não construída — é o "T04" pendente citado em `docs/mvp.md`)*

```
Seu pedido — Salão Vila Verde

Data: 15/09/2026   Tipo: Aniversário   Convidados: 80

── Comodidades ──────────────────────
☑ Cascata de chocolate         R$ 250
☐ Coffee break                 R$ 300
☑ Iluminação cênica programável R$ 180

──────────────────────────────────────
Espaço (4h)          R$ 1.500
Cascata de chocolate  R$   250
Iluminação cênica     R$   180
──────────────────────────────────────
Total estimado        R$ 1.930

[ Continuar ]
```

### Tela 3 — Revisão final antes de enviar

```
Revise seu pedido

Salão Vila Verde — 15/09/2026, Aniversário, 80 convidados
Comodidades: Cascata de chocolate, Iluminação cênica
Total estimado: R$ 1.930 (cotação, não é cobrança)

[ Enviar pedido ]   [ Voltar e editar ]
```

## 5. Estado da implementação

- **Já existe**: card com tags (`amenity-tags.tsx`) e perfil do espaço com lista de comodidades incluso/opcional (`space-detail-panel.tsx`)
- **Protótipo**: Telas 1–3 do pedido em `BookingRequestFlow` (data/evento → comodidades + continha → revisão/envio mock)

## 6. Relação com os docs existentes

- Mecânica de preço/carrinho: `docs/comodidades.md`
- Fluxo de pedido: `docs/reservas.md`
- Telas gerais do produto: `docs/fluxo-telas.md` (T04–T06)

---
*Gerado a partir da conversa de definição de produto — reflete decisões até o momento, sujeito a mudança até ser formalizado nos docs oficiais do repositório.*
