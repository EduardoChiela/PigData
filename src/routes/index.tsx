import { createFileRoute, redirect } from "@tanstack/react-router";
import { MapSearchPage } from "@/components/map-search-page";
import { APP_NAME } from "@/lib/mock-data";
import { validateMapSearch } from "@/lib/search-params";

export const Route = createFileRoute("/")({
  validateSearch: validateMapSearch,
  beforeLoad: ({ search }) => {
    // Visitantes podem navegar no mapa sem conta (fluxo Peerspace).
    if (search.slug) {
      throw redirect({
        to: "/espaco/$slug",
        params: { slug: search.slug },
        search: {
          ...(search.data ? { data: search.data } : {}),
          ...(search.dataFim ? { dataFim: search.dataFim } : {}),
          ...(search.periodo ? { periodo: search.periodo } : {}),
          ...(search.horaInicio ? { horaInicio: search.horaInicio } : {}),
          ...(search.horaFim ? { horaFim: search.horaFim } : {}),
          ...(search.evento ? { evento: search.evento } : {}),
          ...(search.capacidade ? { capacidade: search.capacidade } : {}),
        },
      });
    }
  },
  head: () => ({
    meta: [{ title: `${APP_NAME} — espaços livres em Toledo - PR` }],
  }),
  component: MapSearchPage,
});
