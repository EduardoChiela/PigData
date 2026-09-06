# MVP — slice de apresentação

## Decisões

| Tema | Decisão |
|------|--------|
| Plataformas | Web responsivo (mobile + desktop) |
| Backend | Mock no front |
| Cidade | **Toledo - PR** |
| Visual | Inspirado em Tagvenue (hero split, busca em barra, cards fotográficos); paleta ACIT; UX pela documentação |
| Nome | Codinome PigData (comercial a definir) |

## Fluxo coberto (docs)

1. Home disponibilidade-first  
2. Busca lista + mapa (só disponíveis; ACIT primeiro)  
3. Detalhe + favoritar  
4. Solicitação: data → comodidades/cotação → revisão → enviada  
5. Acompanhamento + minhas solicitações  
6. Painel do espaço (aprovar/recusar)  
7. Painel organizador (opções livres)  
8. Rodapé ACIT  
9. Cadastro de espaço (mock Places/manual)  
10. Pagamento demo após aprovação  

## Estado da implementação

- Home autenticada `/` = mapa (T02); landing `/bem-vindo` (T01) para visitante; marca **Ágora**.
- Mock: 22 espaços Toledo - PR.
- Ainda fora: detalhe/solicitação, painéis, Photorealistic 3D, camada C Places, pagamento demo.

## Fora deste slice (ainda)

Auth real, Places API (New) de verdade, Calendar OAuth, fila de interesse com motor no backend, pagamento/gateway real.
