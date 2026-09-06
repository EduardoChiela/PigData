# Busca, locação e atributos do espaço

## Status

**Definição funcional** incorporada à documentação oficial.

Codinome do repositório: PigData — o nome comercial do app ainda será outro ([nomenclatura.md](./nomenclatura.md)).

Complementa: [mapa-busca.md](./mapa-busca.md), [espacos.md](./espacos.md), [agenda-calendario.md](./agenda-calendario.md), [reservas.md](./reservas.md), [comodidades.md](./comodidades.md), [pagamentos-confianca.md](./pagamentos-confianca.md).

## Escopo deste documento

| # | Funcionalidade | Prioridade sugerida |
|---|----------------|---------------------|
| 1 | Favoritar / salvar locais | Alta, impacto simples |
| 2 | Filtro por cidade | Alta |
| 3 | Filtro por área (m²) | Alta |
| 4 | Locação por dia/período e por horário | Complexa (agenda/preço/reserva) |
| 5 | Janelas (presença e quantidade) | Simples |
| 6 | Tomadas e tensão (127 V / 220 V) | Simples |
| 7 | Aceita pets (+ filtro) | Simples |
| 8 | Seguro opcional na reserva | Separada (demo até haver parceiro) |

---

## 1. Favoritos

Marcar espaços em cards, mapa, detalhes e lista; área **Meus favoritos**.

- Autenticados: persistir `favorites (user_id, space_id)` com `UNIQUE(user_id, space_id)`
- MVP: não autenticado → convidar a entrar na conta antes de salvar
- Aceite: favoritar/desfavoritar, persistir, sem duplicidade, listar, ocultar espaços despublicados

---

## 2. Filtro por cidade

Trocar cidade atualiza lista + viewport do mapa. MVP: **uma cidade por vez**.

Espaço com endereço normalizado: `city`, `state`, `country`, `latitude`, `longitude`.

Aceite: escolher cidade, atualizar mapa/resultados, manter outros filtros quando possível, não misturar cidades indevidamente.

---

## 3. Filtro por área (m²)

Cadastro: `rental_area_m2` (área disponível para locação).

Busca: intervalo `area_min` / `area_max`.

Aceite: proprietário informa; aparece no anúncio; filtra min/max; combina com cidade, data, capacidade e demais filtros.

---

## 4. Locação por dia/período ou por horário

O proprietário define modalidades (pelo menos uma):

```text
allows_full_day_rental
allows_hourly_rental
```

### Se aceitar horário

```text
hourly_rental_start_time
hourly_rental_end_time
minimum_hourly_duration_minutes
```

(Futuro: horários diferentes por dia da semana.)

### Busca por período

Data início + data fim; disponível só se **todo** o intervalo estiver livre.

Conflito conceitual: `requested_start < existing_end AND requested_end > existing_start`.

### Busca por horário

Data + das/até. Espaços com `allows_hourly_rental = false` **não** entram em pesquisa só por horário.

Agenda com timestamps (`starts_at` / `ends_at`). Preço/hora = regra comercial própria do espaço.

Detalhes de agenda: [agenda-calendario.md](./agenda-calendario.md).

---

## 5. Janelas

```text
has_windows boolean
window_count integer  # 0 se não tem; >= 1 se tem
```

Exibir no anúncio. Filtro na busca: opcional / futuro (não obrigatório no MVP desta feature).

---

## 6. Tomadas e tensão

Tabela `space_outlets (space_id, voltage, quantity)` — preferir linhas separadas para **127 V** e **220 V**.

Na UI: total + detalhe por tensão. Na interface pode legendear “127 V (popularmente 110 V)”.

**Importante:** informação declarada pelo proprietário. A plataforma **não** afirma que a instalação suporta determinada carga ou equipamento.

Futuro possível: amperagem, carga máxima, trifásico, gerador, quadro dedicado.

---

## 7. Aceita pets

```text
allows_pets boolean
pet_policy text  # opcional / futuro
```

Exibir ✓ / ✕ no anúncio. Filtro de busca: `[ ] Aceita pets` → só `allows_pets = true`.

Regras detalhadas (porte, guia, taxa de limpeza): versão futura.

---

## 8. Seguro opcional

Contratação opcional no checkout/reserva.

- **Sem parceiro real:** só UI demonstrativa, claramente marcada; sem apólice nem cobrança real
- **Com parceiro:** cotação → escolha → termos → pagamento → certificado

Modelo conceitual: `reservation_insurance` (provider, product_code, status, quoted_amount, policy_number…).

Valor separado da locação (`rental_amount` + `insurance_amount` = `total_amount`). Cancelamento do seguro ≠ cancelamento da locação.

Ver também [pagamento-demo.md](./pagamento-demo.md) e [pagamentos-confianca.md](./pagamentos-confianca.md).

---

## Integração dos filtros (backend)

A busca deve combinar no backend (não só no frontend):

```text
Cidade | Data início/fim | Horário | Modalidade
Área min/max | Capacidade | Aceita pets | Comodidades
(+ demais filtros já previstos)
```

---

## Campos sugeridos (resumo)

**spaces:** city, state, rental_area_m2, allows_full_day_rental, allows_hourly_rental, hourly_*, has_windows, window_count, allows_pets, pet_policy  

**space_outlets:** space_id, voltage, quantity  

**favorites:** user_id, space_id  

**reservation_insurance:** conforme seção 8  

Comparar com o schema real antes de implementar.

---

## Fluxo completo (visão)

```text
Busca → cidade → período (dia ou horário) → filtros (área, capacidade, pets, comodidades)
  → resultados (mapa/lista) → favoritar → detalhes (janelas, tomadas, pets, área, disponibilidade)
  → reserva → opcional seguro → checkout
```

## Estado da implementação

- Mock + filtros básicos na `/buscar` (cidade, data, ACIT, pets, capacidade, evento, classe). Favoritos, mapa e locação por horário fino ainda pendentes.
