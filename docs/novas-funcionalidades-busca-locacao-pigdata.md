# Novas funcionalidades de busca, locação e contratação do PigData

## Status

**Documento de definição funcional.**

Este documento detalha novas funcionalidades previstas para o PigData:

- favoritar/salvar locais de interesse;
- filtrar por outras cidades;
- filtrar por área em metros quadrados;
- permitir locação por período e, quando autorizado pelo proprietário, por horário;
- informar presença e quantidade de janelas;
- informar quantidade de tomadas e tensões disponíveis;
- informar se o espaço aceita pets;
- oferecer opção de contratação de seguro.

---

# 1. Favoritar e salvar locais de interesse

## Objetivo

Permitir que o usuário marque espaços durante a pesquisa para acessar depois sem repetir a busca.

A ação deve estar disponível em:

- cards de resultado;
- mapa;
- página de detalhes;
- lista de resultados.

Exemplo:

```text
Casa de Eventos Exemplo
Toledo - PR
300 pessoas
450 m²

♡ Favoritar
```

Após clicar:

```text
♥ Salvo
```

O usuário deve possuir uma área como:

```text
Meus favoritos
```

## Persistência

Para usuários autenticados:

```text
favorites
--------------------------------
id
user_id
space_id
created_at
```

Deve existir uma restrição:

```text
UNIQUE(user_id, space_id)
```

Para o MVP, usuários não autenticados podem ser convidados a entrar na conta antes de salvar.

## Critérios de aceite

- favoritar;
- desfavoritar;
- persistir entre sessões;
- impedir duplicidade;
- listar favoritos;
- ocultar/remover espaços que deixarem de estar publicados.

---

# 2. Filtro por outras cidades

## Objetivo

Permitir buscar espaços em cidades diferentes da cidade inicial.

Exemplo:

```text
Cidade
[ Toledo - PR ▼ ]
```

Com opções como:

```text
Cascavel - PR
Marechal Cândido Rondon - PR
Palotina - PR
Foz do Iguaçu - PR
```

Também pode existir busca textual:

```text
[ Digite uma cidade... ]
```

## Dados

O espaço deve possuir endereço normalizado:

```text
spaces
--------------------------------
city
state
country
latitude
longitude
```

## Integração com mapa

Ao trocar de cidade:

```text
usuário escolhe cidade
        ↓
resultados são filtrados
        ↓
mapa ajusta viewport
        ↓
pins da cidade selecionada são exibidos
```

Para o MVP, uma cidade selecionada por vez é suficiente.

## Critérios de aceite

- escolher outra cidade;
- atualizar mapa;
- atualizar resultados;
- manter outros filtros quando possível;
- não misturar espaços de cidades diferentes indevidamente.

---

# 3. Filtro por metros quadrados

## Objetivo

Permitir encontrar espaços pela área disponível para locação.

No cadastro:

```text
Área disponível para locação
[ 450 ] m²
```

Campo sugerido:

```text
spaces.rental_area_m2
```

O filtro pode usar intervalo:

```text
Área mínima
[ 200 ] m²

Área máxima
[ 800 ] m²
```

Regra:

```text
rental_area_m2 >= area_min
AND
rental_area_m2 <= area_max
```

## Critérios de aceite

- proprietário informa área em m²;
- área aparece na página;
- usuário filtra por mínimo;
- usuário filtra por máximo;
- funciona junto com cidade, data, capacidade e demais filtros.

---

# 4. Locação por dia ou por horário

## Objetivo

Permitir duas modalidades:

1. dia inteiro/período;
2. por horário.

A locação por horário só deve existir quando o proprietário permitir.

No cadastro:

```text
Como seu espaço pode ser alugado?

☑ Dia inteiro
☐ Por horário
```

Ou:

```text
☑ Dia inteiro
☑ Por horário
```

Campos sugeridos:

```text
spaces
--------------------------------
allows_full_day_rental boolean
allows_hourly_rental boolean
```

Pelo menos uma modalidade deve estar habilitada.

---

## 4.1 Configuração de horário pelo proprietário

Se aceitar aluguel por horário:

```text
Horário inicial permitido
[ 08:00 ]

Horário final permitido
[ 23:00 ]

Duração mínima
[ 2 horas ]
```

Campos possíveis:

```text
hourly_rental_start_time
hourly_rental_end_time
minimum_hourly_duration_minutes
```

Futuramente pode haver horários diferentes por dia da semana.

---

## 4.2 Busca por período

Para locação por período:

```text
Data de início
[ 15/09/2026 ]

Data de fim
[ 17/09/2026 ]
```

O espaço só deve ser considerado disponível se todo o intervalo estiver livre.

Regra conceitual de conflito:

```text
requested_start < existing_end
AND
requested_end > existing_start
```

---

## 4.3 Busca por horário

Se o usuário buscar por horário:

```text
Data
[ 15/09/2026 ]

Das
[ 18:00 ]

Até
[ 23:00 ]
```

Um espaço com:

```text
allows_hourly_rental = false
```

não deve aparecer como compatível com uma pesquisa exclusivamente por horário.

A agenda deve trabalhar com timestamps:

```text
starts_at = 2026-09-15 18:00
ends_at   = 2026-09-15 23:00
```

Exemplo de exibição:

```text
15/09/2026
18:00 — 23:00

5 horas

R$ 120,00/h
Total: R$ 600,00
```

O preço por hora deve ser definido como regra comercial própria.

## Critérios de aceite

- proprietário define as modalidades aceitas;
- usuário pesquisa por data inicial/final;
- usuário escolhe horário quando permitido;
- sistema impede conflitos parciais;
- espaços sem locação por hora não aparecem como compatíveis;
- agenda é consistente entre dia inteiro e horário.

---

# 5. Informação sobre janelas

## Objetivo

Informar se o espaço possui janelas e quantas.

No cadastro:

```text
O espaço possui janelas?
(•) Sim
( ) Não

Quantidade
[ 8 ]
```

Modelo:

```text
spaces
--------------------------------
has_windows boolean
window_count integer
```

Regras:

```text
has_windows = false
→ window_count = 0

has_windows = true
→ window_count >= 1
```

Na descrição:

```text
✓ Possui janelas
8 janelas
```

Esse dado pode ser usado futuramente como filtro, mas não precisa ser filtro no MVP.

---

# 6. Tomadas e tensão elétrica

## Objetivo

Dar visibilidade da infraestrutura elétrica do espaço.

É relevante para:

- DJs;
- bandas;
- som;
- iluminação;
- buffet;
- audiovisual;
- feiras e equipamentos.

## Cadastro recomendado

Em vez de informar apenas um total, separar por tensão:

```text
Infraestrutura elétrica

127 V
Quantidade de tomadas:
[ 12 ]

220 V
Quantidade de tomadas:
[ 8 ]
```

Na interface, pode aparecer:

```text
127 V (popularmente 110 V)
```

Modelo recomendado:

```text
space_outlets
--------------------------------
id
space_id
voltage
quantity
```

Exemplo:

```text
space_id | voltage | quantity
--------------------------------
123      | 127     | 12
123      | 220     | 8
```

Na página:

```text
Infraestrutura elétrica

20 tomadas disponíveis
12 × 127 V
8 × 220 V
```

## Observação

Os dados devem ser apresentados como informação fornecida pelo proprietário.

O PigData não deve afirmar que a instalação suporta determinada carga ou equipamento.

Campos futuros possíveis:

- amperagem;
- carga máxima;
- trifásico;
- gerador;
- quadro dedicado.

---


---

# 7. Aceita pets

## Objetivo

Informar de forma clara se o espaço permite a entrada ou permanência de animais de estimação durante a locação.

Essa informação pode ser relevante para:

- eventos familiares;
- aniversários;
- confraternizações;
- eventos ao ar livre;
- hospedagem ou permanência prolongada no local;
- usuários que pretendem levar cães, gatos ou outros animais.

---

## Cadastro do proprietário

O proprietário deve informar se o espaço aceita pets.

Campo sugerido:

```text
O espaço aceita pets?
(•) Sim
( ) Não
```

Modelo simples:

```text
spaces
--------------------------------
allows_pets boolean
```

---

## Regras opcionais

Em uma versão futura, o proprietário poderá adicionar regras específicas.

Exemplos:

```text
Aceita pets?
✓ Sim

Regras:
- somente animais de pequeno porte;
- obrigatório uso de guia nas áreas comuns;
- não permitido acesso à cozinha;
- limite de 2 animais;
- cobrança adicional de limpeza.
```

Modelo possível:

```text
spaces
--------------------------------
allows_pets boolean
pet_policy text
```

Se futuramente houver necessidade de estrutura mais detalhada:

```text
pet_rules
--------------------------------
space_id
max_pets
size_restriction
additional_fee
notes
```

---

## Exibição na página do espaço

Quando permitido:

```text
✓ Aceita pets
```

Com regras, se existirem:

```text
✓ Aceita pets

Regras:
Somente animais de pequeno porte.
```

Quando não permitido:

```text
✕ Não aceita pets
```

---

## Filtro de busca

Deve existir a opção:

```text
[ ] Aceita pets
```

Ao selecionar esse filtro, o sistema deve retornar apenas espaços com:

```text
allows_pets = true
```

Esse filtro deve funcionar em conjunto com:

- cidade;
- data;
- horário;
- área;
- capacidade;
- comodidades;
- demais filtros.

---

## Critérios de aceite

- proprietário consegue informar se aceita pets;
- informação aparece no anúncio;
- usuário consegue filtrar por espaços que aceitam pets;
- espaços que não aceitam pets não aparecem quando o filtro estiver ativo;
- regras adicionais, quando existentes, aparecem de forma clara ao usuário.


# 8. Opção de contratar seguro

## Objetivo

Permitir ao usuário adicionar um seguro à locação.

A contratação deve ser opcional, salvo futura regra comercial específica.

## Regra principal

O PigData não deve apresentar um seguro como real sem integração com seguradora, corretora ou parceiro autorizado.

Durante demonstrações, pode existir:

```text
Seguro para o evento

[ ] Adicionar proteção à reserva

Cobertura demonstrativa
R$ XX,XX
```

Desde que esteja claramente marcado como demonstração.

---

## Fluxo futuro real

```text
Reserva
   ↓
Dados do evento
   ↓
Cotação
   ↓
Escolha da cobertura
   ↓
Aceite de termos
   ↓
Pagamento
   ↓
Apólice/certificado
```

No checkout:

```text
Proteja sua reserva

Seguro do evento
[ Adicionar ]

+ R$ 89,90
```

O usuário deve conseguir ver:

- preço;
- principais coberturas;
- principais exclusões;
- franquia, quando houver;
- seguradora;
- termos.

## Modelo conceitual

```text
reservation_insurance
--------------------------------
id
reservation_id
provider
product_code
status
quoted_amount
policy_number
created_at
updated_at
```

Status possíveis:

```text
not_selected
quoted
selected
issued
cancelled
failed
```

Em demonstração:

```text
provider = "demo"
status = "selected"
```

Nenhuma apólice real deve ser emitida.

---

## Relação com pagamento

O preço deve ficar separado:

```text
Locação          R$ 1.500,00
Seguro           R$    89,90
--------------------------------
Total            R$ 1.589,90
```

Campos:

```text
rental_amount
insurance_amount
total_amount
```

As regras de cancelamento do seguro não devem ser assumidas como iguais às regras da locação.

---

# 9. Integração dos filtros

A busca pode combinar:

```text
Cidade
Data inicial
Data final
Horário inicial
Horário final
Modalidade de locação
Área mínima
Área máxima
Capacidade
Aceita pets
Comodidades
```

Exemplo:

```text
Cidade:
Toledo - PR

Data:
15/09/2026

Horário:
18:00 → 23:00

Área:
300 m² → 700 m²

Capacidade:
200+ pessoas
```

Os filtros devem ser aplicados pelo backend, não apenas no frontend.

---

# 10. Novos dados sugeridos

```text
spaces
--------------------------------
city
state
rental_area_m2
allows_full_day_rental
allows_hourly_rental
hourly_rental_start_time
hourly_rental_end_time
minimum_hourly_duration_minutes
has_windows
window_count
allows_pets
pet_policy
```

Tomadas:

```text
space_outlets
--------------------------------
id
space_id
voltage
quantity
```

Favoritos:

```text
favorites
--------------------------------
id
user_id
space_id
created_at
```

Seguro:

```text
reservation_insurance
--------------------------------
id
reservation_id
provider
product_code
status
quoted_amount
policy_number
created_at
updated_at
```

A estrutura definitiva deve ser comparada com o schema real do projeto antes da implementação.

---

# 11. Prioridade sugerida

## Mais simples e com alto impacto

1. filtro por cidade;
2. filtro por metros quadrados;
3. favoritos;
4. janelas;
5. tomadas e tensão;
6. aceita pets.

## Mais complexa

7. locação por período e horário.

Essa funcionalidade afeta diretamente:

- agenda;
- disponibilidade;
- conflitos;
- preço;
- reservas;
- integração futura com Google Calendar.

## Separada

8. seguro.

Pode existir como demonstração, mas a versão real depende de parceiro e regras comerciais/regulatórias.

---

# 12. Fluxo completo proposto

```text
Usuário abre busca
       │
       ▼
Escolhe cidade
       │
       ▼
Define período
       │
       ├── Dia inteiro
       │
       └── Por horário
       │
       ▼
Define filtros
       │
       ├── Área
       ├── Capacidade
       ├── Aceita pets
       └── Comodidades
       │
       ▼
Resultados
       │
       ├── Mapa
       └── Lista
       │
       ▼
Favorita espaços
       │
       ▼
Abre detalhes
       │
       ├── Janelas
       ├── Tomadas
       ├── Tensões
       ├── Aceita pets
       ├── Área
       └── Disponibilidade
       │
       ▼
Reserva
       │
       ▼
Opcional:
Adicionar seguro
       │
       ▼
Checkout
```

---

# 13. Decisões finais

## Favoritos

O PigData terá favoritos persistentes para usuários autenticados.

## Cidade

A busca permitirá trocar a cidade, atualizando lista e mapa.

## Área

O proprietário informará área locável em m² e o usuário poderá filtrar por intervalo.

## Locação por horário

O proprietário decidirá se aceita dia inteiro, horário ou ambos.

A agenda e a busca devem respeitar essa configuração.

## Janelas

O cadastro deverá informar presença e quantidade.

## Tomadas

O cadastro deverá informar quantidade por tensão, preferencialmente 127 V e 220 V separadamente.

## Pets

O cadastro deverá informar se o espaço aceita pets.

A busca poderá utilizar essa informação como filtro, e regras adicionais poderão ser exibidas na página do espaço.

## Seguro

O checkout poderá oferecer seguro opcional.

Enquanto não houver integração real, qualquer seguro exibido em apresentação deve ser claramente demonstrativo e não pode gerar apólice ou cobrança real.

---

# 14. Observação para implementação

Antes de implementar, revisar novamente:

- schema do banco;
- documentação de busca e mapa;
- documentação de agenda;
- documentação de reservas;
- documentação de pagamentos;
- fluxo de cadastro do proprietário.

Mudanças em disponibilidade, reserva, preço ou contratação devem ser documentadas em conjunto para evitar regras contraditórias.
