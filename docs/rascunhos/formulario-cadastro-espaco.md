# Formulário de Cadastro do Espaço — Campos e Fluxo de Telas

> Status: **rascunho de discussão**, ainda não incorporado aos docs oficiais (`docs/espacos.md`, `docs/cadastro-assistido-google.md`). Baseado nas decisões já formalizadas nesses dois arquivos — não inventa produto novo, só desenha o formulário e as telas em cima do que já foi decidido.

## 1. Objetivo

Especificar exatamente **quais campos o proprietário precisa preencher** para divulgar o espaço, deixando claro:
- o que pode vir pré-preenchido do Google (mas **precisa de revisão**, porque nem todo estabelecimento está atualizado lá)
- o que é **sempre digitado manualmente**, porque é dado operacional que só existe no PigData

E, em seguida, o **fluxo de telas** que liga tudo isso numa jornada de cadastro só.

## 2. Campos do formulário, por origem

### 2.1 Campos assistidos pelo Google (pré-preenchidos, mas editáveis)

Vêm do **Place Details** quando o proprietário encontra o espaço no Google — mas como o doc já avisa, "nem todos são atualizados", então **todo campo aqui é editável antes de salvar**, nunca fica travado.

| Campo | Fonte Google | Obrigatório | Observação |
|---|---|---|---|
| Nome do espaço | `displayName` | Sim | Editável — corrigir se o nome no Google estiver desatualizado |
| Endereço completo | `formattedAddress` | Sim | Editável |
| Localização (lat/lng) | `location` | Sim | Ajustável arrastando o pin no mini-mapa, não só texto |
| Telefone | `nationalPhoneNumber` | Sim | Editável |
| Site | `websiteUri` | Não | Editável |
| Horário de funcionamento | `regularOpeningHours` | Não | Editável |
| Link do Google Maps | `googleMapsUri` | Não | Só referência, não editável (link) |
| `google_place_id` | Place ID | Automático | Campo técnico, não aparece pro usuário editar — é a referência interna |

Se o proprietário **não achar o espaço no Google** ou escolher cadastro manual, esses mesmos campos aparecem **vazios**, preenchidos à mão.

### 2.2 Campos exclusivos do PigData (sempre manuais)

Nunca vêm do Google — são dado operacional, conforme a tabela de responsabilidades do `cadastro-assistido-google.md`.

| Campo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| Fotos do espaço | Upload (múltiplas imagens) | Sim (mín. 1) | Próprias do proprietário; **não** importa fotos do Google |
| Capacidade (nº de pessoas) | Numérico | Sim | |
| Classes de espaço | Multi-select | Sim (mín. 1) | Salão de festas, Coworking, Espaço corporativo, Área externa/Chácara, Espaço para casamento — usado só pra busca/filtro, não filtra comodidades |
| Tipos de evento atendidos | Multi-select | Sim (mín. 1) | Formatura, Casamento, Corporativo, Confraternização, Feira, Show, Aniversário |
| Atributos / infraestrutura básica | Checklist | Não | Estacionamento, acessibilidade, ar-condicionado etc. — **separado** do catálogo de comodidades |
| Comodidades do catálogo | Checklist + preço por item | Não | Ver seção 2.3 |
| Preço base | Valor (R$) + unidade (ex: por 4h) | Sim | |
| Regras de uso | Texto livre | Não | Cancelamento, horário limite, etc. |
| Status na rede (selo ACIT) | — | — | **Não preenchido pelo proprietário** — atribuído depois pela ACIT no processo de homologação |

### 2.3 Bloco de Comodidades (detalhe)

Vem do catálogo único definido em [comodidades.md](PigData/docs/comodidades.md) — mesma lista pra todo mundo, o proprietário só marca:

Pra cada item do catálogo (cascata de chocolate, totem de recarga, café liberado o dia todo, gerador silencioso, etc.):
1. ☐ Oferece esse item? (checkbox)
2. Se marcado → **Incluso** (R$ 0, já no preço base) **ou** **Opcional com preço** (campo de valor)
3. **Trava de segurança do carrinho:** se o proprietário marcar um item como "Opcional" mas não preencher o preço, o cadastro salva normalmente (não trava o proprietário) — mas esse item **não aparece na lista que o cliente vê e marca** na tela de pedido, até o preço ser preenchido. Isso evita que o cliente marque uma comodidade sem saber quanto ela custa (o que quebraria a soma da "continha"). Não é erro de cadastro, é uma regra do lado do cliente: só vira "compraável" quando 100% precificado (regra já definida em `espacos.md`)

## 3. Fluxo de telas

```mermaid
flowchart TD
    A[Cadastrar espaço] --> B{Seu espaço já<br/>está no Google?}
    B -- Sim --> C[Tela 1: Buscar nome/endereço<br/>Autocomplete Google]
    C --> D[Selecionar sugestão]
    D --> E{Confirmação:<br/>"Este é o seu espaço?"}
    E -- Não é --> C
    E -- Sim --> F[Place Details:<br/>buscar dados públicos]
    F --> G[Tela 2: Revisão dos dados Google<br/>nome, endereço, telefone, site, horário]
    B -- Não --> H[Tela 2m: Formulário manual<br/>mesmos campos, vazios]
    G --> I[Tela 3: Dados PigData<br/>capacidade, classes, tipos de evento]
    H --> I
    I --> J[Tela 4: Atributos de<br/>infraestrutura básica]
    J --> K[Tela 5: Comodidades<br/>marcar oferece + preço]
    K --> L[Tela 6: Fotos do espaço]
    L --> M[Tela 7: Preço base + regras de uso]
    M --> N[Tela 8: Revisão final]
    N --> O[Publicar espaço]
    O --> P[Status: aguardando<br/>homologação ACIT]
```

### Tratamento de exceções (já previsto em `cadastro-assistido-google.md`)

- **Não encontrado no Google** → CTA "Continuar com cadastro manual", sem bloquear o fluxo
- **Selecionou o espaço errado** → botão "não é esse" volta pra busca (Tela 1)
- **Duplicidade** (`google_place_id` já vinculado a outro cadastro) → mensagem "Este espaço já possui cadastro" + CTA de solicitar acesso/contato (regra de reivindicação ainda em aberto, conforme o doc original)

## 4. Wireframe textual das telas principais

### Tela 0 — Entrada

```
Cadastre seu espaço

[ Encontrar meu espaço no Google ]

              ou

[ Cadastrar manualmente ]
```

### Tela 1 — Busca (caminho Google)

```
Seu espaço já está no Google?

[ Pesquise pelo nome ou endereço...        ]

  > Salão Vila Verde — Rua das Flores, 123
  > Salão Vila Verde Eventos — Av. Central, 45
  > ...
```

### Tela 2 — Revisão dos dados do Google

```
Encontramos isso no Google. Confira se está certo:

Nome            [ Salão Vila Verde              ] (editável)
Endereço        [ Rua das Flores, 123 - Centro   ] (editável)
Telefone        [ (11) 99999-0000                ] (editável)
Site            [ www.salaovilaverde.com.br      ] (editável)
Horário         [ Seg-Sáb, 09h-22h                ] (editável)
📍 Local no mapa: [mini-mapa com pin ajustável]

[ Está tudo certo, continuar ]     [ Não é meu espaço, buscar de novo ]
```

### Tela 3 — Dados PigData (essenciais)

```
Complete os dados do seu espaço

Capacidade (nº de pessoas)     [ ____ ]
Classes do espaço              ☐ Salão de festas  ☐ Coworking
                                ☐ Espaço corporativo  ☐ Área externa/Chácara
                                ☐ Espaço para casamento
Tipos de evento atendidos       ☐ Formatura  ☐ Casamento  ☐ Corporativo
                                ☐ Confraternização  ☐ Feira  ☐ Show  ☐ Aniversário

[ Continuar ]
```

### Tela 5 — Comodidades

```
Quais comodidades seu espaço oferece?

☐ Cascata de chocolate         ( ) Inclusa   ( ) Opcional: R$ [____]
☐ Totem de recarga em mesa     ( ) Inclusa   ( ) Opcional: R$ [____]
☐ Café liberado o dia todo     ( ) Inclusa   ( ) Opcional: R$ [____]
☐ Gerador silencioso           ( ) Inclusa   ( ) Opcional: R$ [____]
...

[ Continuar ]
```

### Tela 8 — Revisão final

```
Revise seu cadastro antes de publicar

Salão Vila Verde — Rua das Flores, 123
Capacidade: 150 pessoas · Classes: Salão de festas
Eventos: Casamento, Formatura, Aniversário
Preço base: R$ 1.500 / 4h
Comodidades: Cascata de chocolate (R$250) · Café liberado (incluso)
5 fotos adicionadas

[ Publicar espaço ]     [ Voltar e editar ]
```

---
*Gerado a partir da conversa de definição de produto — construído em cima das decisões já formalizadas em `docs/espacos.md`, `docs/comodidades.md` e `docs/cadastro-assistido-google.md`.*
