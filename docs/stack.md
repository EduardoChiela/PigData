# Stack técnico

## Decisão

| Camada | Tecnologia |
|--------|------------|
| Linguagem | **TypeScript** |
| UI | **React 19** |
| App / rotas | **Vite** + **TanStack Start / Router** |
| Estilo | **Tailwind CSS 4** (Sora/Manrope + paleta verde ACIT) |
| Dados | **Mock** no front (`src/lib/mock-data.ts`) |
| Mapa | **Google Maps JavaScript API** 3D com relevo (`VITE_GOOGLE_MAPS_API_KEY`) — a religar na tela de busca |
| Alvos | Web responsivo (mobile + desktop) |

**Código da UI:** reinício em `src/` — home + busca + mock. Demais telas do MVP entram em iterações seguintes.

## Relação com o Lovable

O export Lovable foi só **inspiração visual** (cores, tipografia). A home/busca seguem o padrão de marketplace de **Tagvenue** (hero, barra de busca, cards fotográficos), **sem copiar o fluxo** deles: entrada disponibilidade-first (cidade + data/período), conforme `docs/`.  
Telas e fluxos seguem a **documentação de produto** em `docs/` (`fluxo-telas`, `reservas`, `busca-locacao`, etc.).

## Variáveis de ambiente

Ver `.env.example`.

## Como rodar

```sh
npm install
npm run dev
```

## Cidade piloto

**Toledo - PR**
