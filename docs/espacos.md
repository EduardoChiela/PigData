# Espaços (cadastro e perfil)

## Objetivo

Cadastro confiável dos locais parceiros: o que o cliente vê antes de pedir reserva — incluindo **comodidades de estrutura** e **add-ons vendáveis** que entram na busca e no orçamento.

## Conteúdo mínimo do perfil (MVP)

- Nome e endereço / geolocalização (para o mapa)
- Fotos
- Capacidade
- Tipos de evento atendidos
- Comodidades de estrutura (incluso / do local)
- Regras de uso
- Preço base (ou faixa)
- Status na rede (parceiro ACIT / homologado)

## Comodidades: dois níveis

| Tipo | Exemplos | Papel |
|------|----------|--------|
| **Estrutura (incluso / filtro)** | Estacionamento, acessibilidade, cozinha, ar-condicionado, Wi-Fi, palco | Usuário filtra “preciso disso”; entra no card como ícone |
| **Add-on (vendável)** | Som, iluminação, buffet, decoração, staff, limpeza extra | Aparece como disponível no espaço; tem preço próprio; soma no orçamento estimado |

### Exibição na busca e no perfil

1. Filtros/chips na busca pedem estrutura e/ou add-ons desejados
2. Card do resultado: preço base + ícones das comodidades **pedidas pelo usuário** + selo ACIT se houver
3. Detalhe do espaço: separar claramente **incluso no aluguel** vs **extra com preço**

### Regras de qualidade das comodidades

- Só filtrar/exibir o que o espaço **declarou e mantém atualizado**
- Declaração falsa de comodidade = mesma gravidade de agenda desatualizada (quebra confiança)
- Add-ons sem preço definido não entram como “vendável” na busca até o dono precificar

## Fora do MVP inicial (ou fase seguinte)

- Pacotes complexos (vários add-ons empacotados)
- Galeria avançada / tour virtual
- Integração profunda de catálogo de fornecedores externos (além do próprio espaço)

## Regras de qualidade gerais

- Espaço sem agenda atualizada perde prioridade na busca
- Homologação ACIT concede selo visível no perfil e prioridade no mapa ([mapa-busca.md](./mapa-busca.md), [parceiros-rede.md](./parceiros-rede.md))

## Estado da implementação

- Modelo de comodidades/add-ons definido em produto; ainda sem código de cadastro.
- Na implementação, documentar aqui o modelo de dados (campos de estrutura vs add-on + preço).
