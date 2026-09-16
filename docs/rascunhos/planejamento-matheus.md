# Especificação de Implementação — Confiança, avaliação e monetização (Matheus)

> **Pacote:** Matheus (M1–M5) · [backlog-equipe.md](./backlog-equipe.md)
> **No repo:** `docs/rascunhos/planejamento-matheus.md`

## Status

| ID | Tema | Decisão |
|---|---|---|
| M1 | Avaliação mútua | **Aprovado.** Cliente avalia o espaço, espaço/parceiro avalia o cliente, liberado após o evento. Modelo **cego**: nota só fica visível quando ambos avaliarem ou o prazo expirar. |
| M2 | Comissão em vez de mensalidade | **Aprovado o modelo** (comissão por reserva). Percentual exato fica em aberto — ver seção 7. |
| M3 | Perfil premium | **Ainda ideia — não aprovado.** Ver seção 8; precisa de decisão do grupo antes de virar spec fechada. |
| M4 | Marcadores + estrelas | **Aprovado, com reinterpretação** do problema real (ver seção 9). |
| M5 | Selo de verificado da plataforma | **Aprovado**, como selo complementar ao "Verificado ACIT" já existente. |

---

## Objetivo geral

Fechar o ciclo de confiança e monetização do Ágora sem depender de backend real: avaliação mútua, comissão sobre reserva, um conceito inicial de plano premium, marcadores de mapa coerentes com a hierarquia já documentada, e um selo de verificação próprio da plataforma. Tudo em mock/localStorage, seguindo o padrão já usado em `reservations.ts`.

---

# 1. M1 — Avaliação mútua (cega)

## 1.1 Por que depende da reserva, não do espaço direto

Uma avaliação só faz sentido presa a uma reserva que de fato aconteceu — senão qualquer pessoa poderia avaliar qualquer espaço sem nunca ter reservado. Hoje o sistema não tem status "concluída": o ciclo para em `confirmed` (`reservations.ts`). A liberação é **calculada**, comparando a data da reserva com hoje:

```text
reserva.status === "confirmed" E reserva.date < hoje → elegível
```

## 1.2 Por que o modelo é cego

Se a nota aparecer assim que enviada, quem avalia por último tem vantagem — pode reagir à nota do outro lado, ou evitar dar nota baixa por medo de retaliação (ex.: parceiro rebaixa o cliente que reclamou do espaço). Escondendo os dois lados até que ambos avaliem — ou até o prazo expirar — cada nota é independente. Mesmo raciocínio do Airbnb/Uber. O custo: precisa guardar um estado extra de visibilidade, não só a nota.

## 1.3 Modelo de dados

Novo arquivo `src/lib/reviews.ts`:

```text
Review = {
  id: string
  reservationId: string     // 1 review por lado, por reserva
  spaceSlug: string
  clientUserId: string
  authorType: "client" | "partner"
  rating: 1 | 2 | 3 | 4 | 5
  comment?: string
  createdAt: string
}
```

Regra de visibilidade:

```text
visível quando:
  existe review dos DOIS authorType para essa reservationId
  OU
  hoje > reservation.date + PRAZO_VISIBILIDADE_DIAS (sugestão: 14 dias)
```

Funções: `canReview`, `submitReview`, `isReviewVisible`, `getVisibleReviewsForSpace` / `getAverageRatingForSpace`, `getVisibleReviewsForClient` / `getAverageRatingForClient`.

**Ponto não óbvio:** a média só deve contar reviews visíveis — senão a nota vaza indiretamente pela média antes da hora, e o modelo cego perde o sentido.

## 1.4 Telas

- Cliente, em "Minhas reservas": botão `Avaliar espaço` (estrelas + comentário opcional) nas reservas elegíveis.
- Parceiro, no painel, reservas passadas do espaço: botão `Avaliar cliente`.
- Card de espaço e perfil do cliente: média + contagem (`★ 4.6 (12)`), só com reviews visíveis.

## 1.5 Testes obrigatórios

- Reserva futura → botão não aparece; passada e `confirmed` → aparece pros dois lados.
- `cancelled`/`rejected` → nunca aparece.
- Duplo review do mesmo lado/reserva → bloqueado.
- Só um lado avaliou, dentro do prazo → invisível pro outro e fora da média.
- Ambos avaliaram → visível na hora.
- Só um lado avaliou, prazo expirado → visível mesmo sem o outro.

---

# 2. M2 — Comissão por reserva em vez de mensalidade

## 2.1 Contexto

`pagamentos-confianca.md` já lista duas hipóteses de monetização sem decidir entre elas: comissão por reserva e assinatura do parceiro. Nada disso está implementado — o checkout hoje (`pagamento-demo.md`) só simula aprovação/recusa, sem calcular comissão.

## 2.2 Decisão

Adotar **comissão por reserva** como modelo principal do piloto, substituindo a lógica de mensalidade/assinatura do parceiro. A comissão incide sobre o total da reserva (espaço + comodidades [+ seguro]), como já previsto em `pagamentos-confianca.md`.

**Em aberto — não improvisar durante a implementação:** o percentual exato (ex.: 8%? 12%?) precisa ser definido pelo grupo. A spec trata isso como uma constante única e configurável, nunca um número espalhado pelo código.

## 2.3 Modelo de dados

- Constante `COMMISSION_RATE` em um único lugar (ex.: `src/lib/pricing.ts` ou junto de `reservations.ts`).
- No registro de pagamento (`payments`, de `pagamento-demo.md`), adicionar `commission_amount` calculado a partir de `amount * COMMISSION_RATE`.
- O cliente continua vendo só o total normal — a comissão é uma dedução da plataforma sobre o repasse ao parceiro, não um acréscimo visível pro cliente.

## 2.4 Telas

- Resumo de checkout do cliente: sem mudança visual (comissão é interna).
- Painel do parceiro: exibir, por reserva confirmada, o valor bruto, a comissão retida e o valor líquido a receber — transparência é o ponto chave aqui.

## 2.5 Testes obrigatórios

- Comissão calculada corretamente sobre `amount` de cada pagamento aprovado.
- Mudar `COMMISSION_RATE` reflete em todos os cálculos futuros sem tocar em código espalhado.
- Painel do parceiro mostra bruto/comissão/líquido consistentes com o pagamento.

---

# 3. M3 — Perfil premium (ideia)

## 3.1 Por que isso continua "a pesquisar" e não "aprovado"

O próprio backlog marca M3 como "Feature (ideia)" — não tem um problema concreto nem uma regra de negócio definida, ao contrário de M1/M2/M4/M5. Fechar uma spec de implementação sobre uma ideia ainda solta corre o risco de travar decisão de produto que devia ser do grupo. Por isso esta seção lista direções possíveis, não uma decisão.

## 3.2 Direções possíveis (para o grupo escolher, não implementar direto)

1. **Destaque de busca**: perfil premium aparece com prioridade extra dentro da própria camada A (ACIT verificado), sem se confundir com o selo ACIT (que é sobre parceria de rede, não sobre plano pago).
2. **Ferramentas para o parceiro**: relatórios de conversão, estatísticas de visualização do anúncio — recursos internos, não visíveis ao cliente.
3. **Benefícios de comissão**: taxa de comissão (M2) reduzida para parceiros premium.

## 3.3 Próximo passo

Antes de virar spec de implementação, o grupo precisa decidir: (a) qual das direções acima (ou combinação), (b) se há cobrança envolvida e como ela se relaciona com M2, (c) critério de elegibilidade. Sem isso, qualquer código seria regra de negócio inventada durante a implementação — o que a própria equipe já evita fazer, como visto no tratamento do E3 do Eduardo.

---

# 4. M4 — Marcadores do mapa e avaliações por estrela

## 4.1 Reinterpretação do problema (baseada no código atual)

O backlog pede "marcadores na mesma cor". Olhando `spaces-map.tsx`, os pins hoje já usam só duas cores: verde (ACIT verificado) e cinza (tudo mais). O problema real é o oposto do que o texto sugere: esse "tudo mais" cinza junta a **Camada B** (cadastrado no Ágora, pode receber reserva) com a **Camada C** (pin do Google, sem agenda nem reserva) — e `mapa-busca.md` documenta essas duas camadas como visualmente diferentes por design. Unificar ainda mais a cor pioraria essa confusão, não resolveria.

**Decisão:** manter o verde exclusivo pra camada A (ACIT); diferenciar visualmente B de C (ex.: pin cinza preenchido para B — pode reservar — vs. contorno/ícone distinto para C — só "abrir no Google"), em vez de igualar tudo.

## 4.2 Avaliações por estrela

Depende do M1: usar `getAverageRatingForSpace` (só reviews visíveis) para exibir a nota no pin (ou no card ao lado do pin) e na lista de busca.

## 4.3 Telas

- Pin do mapa: manter cor por camada (A/B/C), adicionar nota por estrela quando o espaço tiver reviews visíveis.
- Card de busca: nota ao lado do preço, junto do selo ACIT quando houver.

## 4.4 Testes obrigatórios

- Espaço camada A, B e C aparecem visualmente distintos entre si.
- Espaço sem nenhuma review visível não mostra nota quebrada (nem "0 estrelas") — mostra ausência de avaliação.
- Nota no pin/card bate com `getAverageRatingForSpace`.

---

# 5. M5 — Selo de verificado da plataforma

## 5.1 Diferença em relação ao selo já existente

`parceiros-rede.md` já documenta o selo **"Verificado ACIT"**, que representa homologação pela rede/parceria. M5 pede um selo da própria plataforma — não deve ser o mesmo selo renomeado, e sim um selo complementar com critério próprio.

## 5.2 Decisão

Criar o selo **"Verificado Ágora"**, calculado (não atribuído manualmente) a partir de critérios objetivos:

```text
perfil completo (todos os campos do MVP preenchidos, ver espacos.md)
E nota média mínima como espaço (depende de M1, ex.: ≥ 4.0 com no mínimo N reviews)
E baixa taxa de cancelamento pelo parceiro
```

Os valores exatos de corte (nota mínima, N reviews, taxa de cancelamento) ficam como parâmetro a definir com o grupo — mesma lógica do `COMMISSION_RATE` em M2: constante única, não espalhada.

## 5.3 Telas

- Ícone "Verificado Ágora" ao lado do selo "Verificado ACIT" no card e no perfil do espaço — visualmente distinto, nunca substituindo o selo ACIT.

## 5.4 Testes obrigatórios

- Espaço que atende todos os critérios ganha o selo automaticamente; deixa de atender (ex.: nota cai) e perde o selo automaticamente.
- Selo ACIT e selo Ágora aparecem juntos sem se confundir visualmente.

---

# 6. Ordem de implementação (M1 → M5)

1. **M1** — helper `isEventPast`, `reviews.ts`, `ReviewModal`, botões de avaliação, médias visíveis nos cards.
2. **M4** — ajustar pins (diferenciar B de C) e exibir a média de M1 no mapa/card.
3. **M2** — `COMMISSION_RATE`, cálculo de comissão no registro de pagamento, exibição bruto/comissão/líquido no painel do parceiro.
4. **M5** — cálculo do selo "Verificado Ágora" a partir de critérios (depende da média de M1 já estar funcionando).
5. **M3** — só depois que o grupo decidir a direção (seção 3.3); não tem código antes disso.

---

# 7. Parâmetros que não devem ser improvisados durante a implementação

Se o grupo ainda não fechou estes números, decidir antes de codificar — não escolher um valor "provisório" dentro do código:

1. `PRAZO_VISIBILIDADE_DIAS` (M1) — sugestão: 14 dias.
2. `COMMISSION_RATE` (M2) — percentual da comissão.
3. Direção de produto do M3 (seção 3.2) e se envolve cobrança.
4. Critérios de corte do selo "Verificado Ágora" (M5): nota mínima, quantidade mínima de reviews, taxa máxima de cancelamento.

---

# 8. Critérios de aceite gerais

- M1: nenhuma nota fica visível (nem entra em média) antes da condição cega ser satisfeita.
- M2: comissão sempre calculada a partir de uma única constante; painel do parceiro mostra bruto/comissão/líquido.
- M3: nenhum código de "premium" entra sem uma decisão de direção registrada primeiro.
- M4: camadas A/B/C continuam visualmente distinguíveis; nota por estrela reflete só reviews visíveis.
- M5: selo Ágora calculado automaticamente, nunca atribuído manualmente; nunca confundido com o selo ACIT.

---

# 9. Arquivos de documentação afetados

```text
docs/reservas.md              — regra de liberação da avaliação (M1)
docs/pagamentos-confianca.md  — detalhar avaliações (M1) e comissão (M2)
docs/espacos.md               — média de avaliação no perfil (M1), selo Ágora (M5)
docs/mapa-busca.md            — diferenciação B x C nos pins (M4), nota por estrela
docs/parceiros-rede.md        — selo Ágora como complementar ao selo ACIT (M5)
docs/IMPLEMENTACAO.md         — registro de cada M implementado
```

---

# 10. Registro sugerido para IMPLEMENTACAO.md

```text
Título:
Confiança, avaliação e monetização (M1–M5, pacote Matheus)

Contexto:
Implementação incremental dos itens M1, M2, M4 e M5 aprovados.
M3 aguarda decisão de direção do grupo antes de entrar em código.

Áreas afetadas:
- reservas (elegibilidade de avaliação)
- espaços (média visível, selo Ágora)
- mapa (diferenciação de camadas, nota por estrela)
- pagamentos (comissão)
- painel do parceiro (avaliar cliente, extrato bruto/comissão/líquido)

Mudanças:
- avaliação mútua cega (M1)
- comissão por reserva configurável (M2)
- pins diferenciando cadastrado (B) de Google (C) (M4)
- selo "Verificado Ágora" calculado automaticamente (M5)

Status:
em implementação (M1, M2, M4, M5) / aguardando decisão (M3)
```

---

# 11. Decisão final

M1, M2, M4 e M5 estão aprovados para seguir para implementação, na ordem da seção 6, com os parâmetros da seção 7 fechados pelo grupo antes de cada um entrar em código. M3 permanece como ideia em aberto — não deve virar código antes de uma decisão de direção registrada nos moldes da seção 3.
