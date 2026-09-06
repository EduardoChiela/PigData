# Cadastro assistido de espaços com Google Places

## Status

**Decisão de produto:** adotar um fluxo de cadastro assistido no qual o proprietário pode localizar o seu espaço no Google e utilizar as informações públicas encontradas para acelerar o onboarding.

Complementa:

- **Google Maps JavaScript API** como mapa do PigData
- **Places API (New)** como fonte de informações públicas de locais
- Cadastro e perfil em [espacos.md](./espacos.md)
- Camada de descoberta no mapa (pins Google limitados) em [mapa-busca.md](./mapa-busca.md) — uso distinto deste fluxo de onboarding
- Agenda / Calendar opcional em [agenda-calendario.md](./agenda-calendario.md)

---

## Objetivo

Reduzir o atrito no cadastro de espaços para eventos.

Em vez de exigir que o proprietário preencha todos os dados básicos manualmente, o PigData deve permitir que ele pesquise o estabelecimento no Google, selecione o local correto e utilize as informações encontradas como apoio ao preenchimento.

O Google facilita a identificação inicial do estabelecimento; o **PigData continua sendo a fonte de verdade para locação, disponibilidade e operação** na plataforma.

---

## Experiência esperada

Dois caminhos no início do cadastro (nenhum obriga o espaço a existir no Google):

```text
Cadastre seu espaço

[ Encontrar meu espaço no Google ]

              ou

[ Cadastrar manualmente ]
```

---

## Fluxo principal

### 1. Proprietário inicia o cadastro

```text
Seu espaço já está no Google?

[ Pesquise pelo nome ou endereço... ]
```

### 2. Busca pelo estabelecimento

Usa **Autocomplete (New)** da Places API. Sugestões conforme a digitação; preferência/restrição geográfica pela região do PigData quando fizer sentido.

### 3. Seleção do local

Obter o **Place ID** (`google_place_id`). Essa é a referência persistente entre o cadastro PigData e o local no Google.

### 4. Consulta dos detalhes

**Place Details (New)** só após a seleção, pedindo apenas os campos necessários (Field Masks).

Campos sugeridos (v1):

```text
id
displayName
formattedAddress
location
nationalPhoneNumber
websiteUri
regularOpeningHours
googleMapsUri
primaryType
```

Interface de revisão antes de continuar (confirmar nome, endereço, telefone, site).

---

## O que o Google auxilia vs o que é PigData

| Origem | Exemplos |
|--------|----------|
| **Google (identificação pública)** | Nome, endereço, lat/lng, telefone, site, horário, link Maps, tipo principal |
| **PigData (fonte de verdade operacional)** | Capacidade, preço, cobrança, tipos de evento, comodidades/estrutura, regras, cancelamento, fotos próprias, descrição comercial, agenda, disponibilidade, pedidos, reservas, vínculo/verificação ACIT |

Um dado retornado pelo Google **não** se torna automaticamente dado operacional confirmado pelo PigData — o proprietário revisa e assume o que entra no cadastro.

```text
                 GOOGLE PLACES
                       │
             busca e identificação
                       ▼
                google_place_id
          ┌────────────┴────────────┐
          ▼                         ▼
 informações públicas         cadastro PigData
 (revisão na UI)            (dados do proprietário)
```

---

## Persistência e armazenamento

- **Pode persistir:** `google_place_id` (referência principal)
- **Não fazer:** espelhar permanentemente toda a resposta Places no banco
- Consultar dados Google quando necessário; seguir políticas vigentes de cache, armazenamento e atribuição do Google Maps Platform
- Campos permanentes do cadastro: preferir revisão/confirmação do proprietário como dados próprios do PigData

Modelo conceitual:

```text
spaces
--------------------------------
id
owner_id
name
google_place_id
latitude
longitude
...
```

---

## Avaliações, reviews e fotos do Google

Na v1: **não importar** reviews/fotos do Google como conteúdo próprio do PigData.

Se usados no futuro: sempre identificados como fonte Google + atribuição. Fotos oficiais do perfil PigData = upload/autorização do proprietário.

---

## Custo e boas práticas de API

**Autocomplete:** não consultar antes de digitar; sugerir após alguns caracteres; session token quando aplicável; limitar geograficamente.

**Place Details:** uma consulta após a seleção — não buscar detalhes de todas as sugestões.

```text
digita → Autocomplete → sugestões leves → seleciona → Place Details → revisão
```

---

## Não encontrado / incorreto / duplicidade

- **Não encontrado:** CTA “Continuar com cadastro manual” (Google não bloqueia o cadastro)
- **Incorreto:** confirmação explícita (“Este é o seu estabelecimento?”) antes do vínculo; não vincular só por similaridade de nome/endereço
- **Duplicidade:** ao obter `google_place_id`, verificar se já existe espaço com o mesmo ID; não criar outro silenciosamente. Comportamentos possíveis: “Já possui cadastro” → solicitar acesso / contato. Regra definitiva de reivindicação: documentar quando implementar

---

## Verificação de propriedade

Selecionar no Places **não comprova** propriedade. Places = localizar, identificar, dados públicos.

Futuro (fora da v1): eventual **Google Business Profile** + OAuth — integração separada da Places API.

---

## Relação com Google Calendar

Places (onboarding) e Calendar (agenda) são **etapas independentes**.

```text
1. Identifique o espaço (Places)
2. Complete dados de locação (PigData)
3. Configure disponibilidade (agenda PigData)
4. Opcional: conectar Google Calendar
```

Existir no Maps ≠ Calendar disponível. Calendar exige autorização específica.

---

## Fluxo completo proposto

```text
CRIAR CONTA
     │
     ▼
CADASTRAR ESPAÇO
     │
     ▼
Seu espaço está no Google?
     │
 ┌───┴─────────────┐
 │                 │
SIM               NÃO
 │                 │
 ▼                 ▼
Autocomplete     Cadastro
Google           manual
 │                 │
 ▼                 │
Selecionar + Place Details + revisar
 │                 │
 └───────┬─────────┘
         ▼
Completar dados PigData
(capacidade, preço, comodidades, regras, fotos)
         │
         ▼
Configurar agenda
         │
         ▼
Opcional: Google Calendar
         │
         ▼
Publicar espaço
```

### Etapas de interface (resumo)

1. **Identificação** — buscar nome/endereço no Google (ou ir ao manual)
2. **Confirmação** — “Este é meu espaço?”
3. **Revisão** — editar/confirmar campos básicos
4. **Dados da locação** — capacidade, preço, comodidades
5. **Agenda** — agenda PigData e/ou conectar Calendar

---

## Segurança

- Chaves frontend restritas a domínios e APIs necessárias
- Não expor credenciais privadas
- Validar no backend dados do frontend antes de criar vínculos
- Identidade do local Google = **Place ID**, não só o nome

---

## Critérios de aceite

- Escolha entre busca Google e cadastro manual
- Autocomplete com sugestões; seleção obtém Place ID
- Dados básicos exibidos para revisão
- Cadastro continua se Google não achar o local
- Duplicidade verificada por Place ID
- Disponibilidade, preço e capacidade **não** inferidos do Google
- Seleção Places ≠ prova de propriedade
- Respeito às regras de armazenamento e atribuição do Maps Platform

---

## Decisão final

```text
Google Places → encontrar e identificar (Place ID + públicos)
PigData → locação, agenda, disponibilidade, preço, estrutura, pedidos, reservas, ACIT
```

O Google é camada de auxílio ao onboarding. O **PigData permanece a fonte de verdade da operação**.

## Referências técnicas

Places API (New), Autocomplete (New), Place Details (New), Place IDs, Field Masks, Policies and Attributions. Revalidar políticas e preços do Google Maps Platform antes da implementação.

## Estado da implementação

- Protótipo no painel do parceiro (`/painel` → Cadastrar): busca mock de Places (`MOCK_GOOGLE_PLACES`), revisão editável, caminho manual, demais telas PigData. Sem Places API real / OAuth.
