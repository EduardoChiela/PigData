# Comodidades — Documentação da Feature

> Status: **rascunho de discussão**, ainda não incorporado aos docs oficiais do projeto (`docs/espacos.md`, `docs/reservas.md`). Guardar aqui até fecharmos o desenho e decidirmos formalizar.
>
> **Nota de nomenclatura:** "comodidade" e "add-on" são tratados como a mesma coisa neste projeto — usamos só **"comodidade"** daqui pra frente, sem distinção.

## 1. Objetivo da feature

Hoje o cadastro de espaço no PigData tem um campo genérico de "comodidades e regras de uso" (texto livre, igual pra qualquer tipo de espaço). Essa feature substitui isso por um **catálogo único e genérico de comodidades**, do qual o proprietário marca (checkbox) quais o espaço dele realmente oferece, cada uma com preço próprio — e adiciona um **mecanismo de precificação por item** no momento do pedido, no estilo "carrinho" (marcou a comodidade → soma no total).

Pro MVP, o catálogo de comodidades é **único e igual pra todo proprietário** — não filtra por classe do espaço nem por tipo de evento (decisão de simplificação, ver seção 5). Classes de espaço e tipos de evento continuam existindo no produto (servem pra outras coisas, como busca/filtro no mapa), só não determinam quais comodidades aparecem no cadastro.

## 2. Classes de Espaço

Classificação do **tipo funcional/físico do local**. Cada espaço pode ter mais de uma classe. Usado em busca e filtros (fora do escopo desta feature) — **não filtra o catálogo de comodidades**.

| Classe |
|---|
| Salão de festas |
| Coworking |
| Espaço corporativo |
| Área externa / Chácara |
| Espaço para casamento |

> Lista provisória — validar com o time se cobre os tipos reais dos espaços parceiros da ACIT.

## 3. Tipos de Evento

Já existe como conceito no produto ([`docs/espacos.md`](../PigData/docs/espacos.md), campo "tipos de evento atendidos").

| Tipo de evento |
|---|
| Formatura |
| Casamento |
| Corporativo |
| Confraternização |
| Feira |
| Show |
| Aniversário *(novo — adicionado nesta discussão; não estava na lista original dos docs, precisa ser incluído lá também)* |

## 4. Lista Geral de Comodidades (catálogo)

Catálogo único: mesma lista pra todo proprietário, ele marca o que oferece e define o preço de cada item.

### Critério de curadoria

> **O cliente descobre essa comodidade aqui (surpresa/diferencial) vs. o cliente já ia atrás disso por conta própria (óbvio, ele já sabe que precisa)?**

Só o primeiro tipo entra no catálogo. Fica de fora infraestrutura básica óbvia (banheiro, estacionamento, ar-condicionado — checklist de qualidade mínima) e contratações que o cliente já sabe que precisa buscar sozinho (DJ, cerimonialista).

### Catálogo (rascunho)

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
| Transmissão ao vivo / streaming do evento | Salão de festas / corporativo |
| Gerador silencioso | Área externa / salão de festas |
| Iluminação cênica programável | Salão de festas |
| Copa de apoio para buffet terceirizado | Salão de festas |
| Cobertura de emergência pra chuva | Área externa / chácara |
| Camarim com espelho iluminado (making-of) | Casamento |
| Guarda-volumes com serviço | Casamento / salão de festas |

> Rascunho — precisa de validação final antes de virar catálogo oficial no cadastro.

## 5. Decisão de simplificação (por que a lista não filtra por classe/evento)

Inicialmente o desenho previa dois eixos de recomendação (comodidade por classe do espaço + add-on por tipo de evento, com listas diferentes pra cada combinação). Decisão do time: **pro MVP, isso é complexidade demais** — uma lista única e genérica, que o próprio proprietário filtra manualmente ao marcar o que oferece, já resolve o problema. Classes e tipos de evento continuam cadastrados no espaço (úteis pra busca), só não acionam filtragem do catálogo de comodidades.

## 6. Modelo de precificação (mecânica "carrinho")

Cada comodidade marcada pelo proprietário tem um **preço próprio, definido por ele, específico daquele espaço** (o catálogo só dá o nome/descrição — o preço não é global, cada espaço define o seu).

- Comodidades inclusas → preço R$0 (fazem parte do valor base)
- Comodidades opcionais → preço definido pelo proprietário (fixo por item, sem variação por pessoa/quantidade no MVP)

### Fluxo no pedido (visão do cliente)

1. Cliente escolhe o espaço + data → vê o preço base (ex: Salão X, R$1.500 / 4h)
2. Abre a aba **"Comodidades"** dentro da tela de pedido
3. Vê a lista de comodidades que aquele espaço específico oferece, cada uma com nome + preço ao lado
4. Marca o que quer (ex: ☑ Cascata de chocolate R$250 · ☑ Coffee break R$300)
5. Uma **"continha" soma em tempo real** conforme ele marca — igual um carrinho de delivery somando sachê/refri ao pedido:
   ```
   Espaço (4h)                R$ 1.500
   Cascata de chocolate       R$   250
   Coffee break                R$   300
   ------------------------------------
   Total estimado             R$ 2.050
   ```
6. Esse total vai junto no pedido enviado ao espaço

**Importante:** esse total é uma **cotação/estimativa**, não uma cobrança real. Pagamento de verdade continua fora do escopo do MVP (fase posterior, já previsto em `docs/pagamentos-confianca.md`).

## 7. Modelo de dados (rascunho conceitual)

- **ClasseDeEspaco** — catálogo de classes (seção 2), associada ao Espaço apenas como classificação/busca
- **TipoDeEvento** — catálogo de tipos de evento (seção 3), já existente no produto
- **CatalogoDeComodidades** — catálogo mestre único de comodidades: `{item_id, nome, descricao}` — **sem** vínculo com Classe ou Tipo de Evento
- **EspacoComodidade** — vínculo entre um Espaço específico e uma comodidade do catálogo: `{espaco_id, item_id, oferece: bool, preco: decimal, incluso: bool}` — é aqui que mora o preço específico daquele espaço
- **PedidoComodidade** — no pedido de reserva, lista das comodidades selecionadas pelo cliente + preço no momento do pedido (snapshot) + total calculado

## 8. Decisões já fechadas nesta conversa

- **Add-on e comodidade são a mesma coisa** — usa-se só o termo "comodidade"
- **Catálogo único e genérico** — mesma lista pra todo proprietário, sem filtrar por classe ou tipo de evento
- Classes de espaço e tipos de evento **continuam existindo** no cadastro (úteis pra busca/filtro), só não determinam o catálogo de comodidades
- Critério de curadoria: entra o que é descoberta/diferencial; não entra o que o cliente já sabe que precisa buscar sozinho, nem infraestrutura básica
- Comodidades são **cadastradas e precificadas pelo próprio espaço**, mesmo quando na vida real quem executa é um terceiro (ex: empresa de pula-pula) — relação com terceiros é assunto da ACIT, fora de escopo agora
- Preço por item é **fixo** por enquanto (sem variação por pessoa/quantidade)
- O total calculado no pedido é **cotação/estimativa**, pagamento real fica pra fase posterior

---
*Gerado a partir da conversa de definição de produto — reflete decisões até o momento, sujeito a mudança até ser formalizado nos docs oficiais do repositório.*
