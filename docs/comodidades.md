# Comodidades

## Status

**Decisão de produto formalizada** (promovida de `docs/rascunhos/comodidades.md`).

Relacionados: [espacos.md](./espacos.md), [reservas.md](./reservas.md), [mapa-busca.md](./mapa-busca.md), [pagamentos-confianca.md](./pagamentos-confianca.md).

## Objetivo

Substituir o campo genérico “comodidades e regras” (texto livre) por um **catálogo único de comodidades**: o proprietário marca o que oferece, define preço por item, e no pedido o cliente monta uma **cotação estilo carrinho** (marcou → soma no total estimado).

## Nomenclatura

**“Comodidade” e “add-on” são a mesma coisa.** No PigData usa-se apenas **comodidade**. Não há dois tipos de produto com nomes diferentes.

## O que entra no catálogo (critério de curadoria)

Entra o que é **descoberta / diferencial** (o cliente pode se surpreender ao ver na plataforma).

Fica **fora** do catálogo:

- Infraestrutura básica óbvia (banheiro, estacionamento, ar-condicionado, etc.) — tratar como **atributos / checklist de qualidade** do espaço, não como item de carrinho
- Contratações que o cliente já sabe buscar sozinho (DJ, cerimonialista, etc.)

Comodidades são **cadastradas e precificadas pelo espaço**, mesmo quando na prática um terceiro executa (ex.: pula-pula). Relação com fornecedores terceiros = assunto ACIT / fora de escopo desta feature.

## Catálogo único (MVP)

Mesma lista para todo proprietário. **Não filtra** por classe do espaço nem por tipo de evento (simplificação do MVP). Classes e tipos de evento continuam no cadastro do espaço para busca/filtro no mapa — só não determinam quais comodidades aparecem no cadastro.

O proprietário “filtra” manualmente marcando o que oferece.

### Lista (rascunho — validar com a ACIT)

| Comodidade | Contexto típico |
|---|---|
| Cascata de chocolate | Aniversário |
| Pula-pula | Aniversário infantil |
| Algodão doce / pipoca | Aniversário |
| Totem de recarga em cada mesa | Coworking / corporativo |
| Wi-Fi dedicado de alta velocidade | Coworking / corporativo |
| Café liberado o dia todo | Coworking |
| Cabine isolada pra ligação/vídeo | Coworking |
| Suporte técnico no local | Coworking / corporativo |
| Coffee break | Corporativo |
| Transmissão ao vivo / streaming do evento | Salão / corporativo |
| Gerador silencioso | Área externa / salão |
| Iluminação cênica programável | Salão de festas |
| Copa de apoio para buffet terceirizado | Salão de festas |
| Cobertura de emergência pra chuva | Área externa / chácara |
| Camarim com espelho iluminado (making-of) | Casamento |
| Guarda-volumes com serviço | Casamento / salão |

## Classes de espaço (busca — não filtram o catálogo)

Cada espaço pode ter mais de uma classe. Lista provisória:

| Classe |
|---|
| Salão de festas |
| Coworking |
| Espaço corporativo |
| Área externa / Chácara |
| Espaço para casamento |

## Tipos de evento (busca — não filtram o catálogo)

| Tipo de evento |
|---|
| Formatura |
| Casamento |
| Corporativo |
| Confraternização |
| Feira |
| Show |
| Aniversário |

## Precificação (mecânica “carrinho”)

- O catálogo mestre traz nome/descrição — **sem preço global**
- Cada espaço define o preço de cada comodidade que oferece
- **Inclusa** → preço R$ 0 (faz parte do valor base / já coberta)
- **Opcional** → preço fixo por item (sem variação por pessoa/quantidade no MVP)

### Fluxo no pedido (cliente)

1. Escolhe espaço + data → vê preço base (ex.: R$ 1.500 / 4h)
2. Aba **Comodidades** no pedido
3. Lista só o que **aquele espaço** oferece (nome + preço)
4. Marca o que quer
5. Total estimado em tempo real:

```text
Espaço (4h)                R$ 1.500
Cascata de chocolate       R$   250
Coffee break               R$   300
------------------------------------
Total estimado             R$ 2.050
```

6. Total segue no pedido enviado ao espaço

**MVP:** esse total é **cotação/estimativa**, não cobrança. Pagamento real = fase posterior ([pagamentos-confianca.md](./pagamentos-confianca.md)).

## Modelo de dados (conceitual)

| Entidade | Papel |
|----------|--------|
| **ClasseDeEspaco** | Catálogo de classes; no espaço só para classificação/busca |
| **TipoDeEvento** | Catálogo de tipos; no espaço para busca |
| **CatalogoDeComodidades** | Mestre único `{ item_id, nome, descricao }` — sem vínculo com classe/evento |
| **EspacoComodidade** | `{ espaco_id, item_id, oferece, preco, incluso }` — preço daquele espaço |
| **PedidoComodidade** | Itens escolhidos no pedido + **snapshot** de preço + total calculado |

## Decisões fechadas

1. Só o termo **comodidade** (sem “add-on” paralelo)
2. Catálogo único e genérico no MVP
3. Classes e tipos de evento existem para busca, não filtram comodidades
4. Critério: diferencial/descoberta; não infra óbvia nem contratação óbvia
5. Preço por item fixo; incluso = R$ 0
6. Total no pedido = cotação até existir pagamento
7. Terceiros que executam o serviço: fora do escopo técnico agora

## Relação com busca e mapa

Filtros de comodidade na busca usam o que o espaço **oferece** no catálogo ([mapa-busca.md](./mapa-busca.md)). Atributos básicos de infraestrutura (estacionamento, acessibilidade, etc.), se existirem na UI, ficam como **atributos do espaço**, separados deste catálogo.

## Estado da implementação

- Decisão de produto formalizada; catálogo ainda provisório (validar com ACIT).
- Ainda sem código de catálogo / EspacoComodidade / PedidoComodidade.
