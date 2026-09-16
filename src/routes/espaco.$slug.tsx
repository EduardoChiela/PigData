import { createFileRoute, redirect } from "@tanstack/react-router";
import { SpaceDetailPage } from "@/components/space-detail-page";
import {
  APP_NAME,
  getSpaceBySlug,
  withAvailability,
} from "@/lib/mock-data";
import {
  getListingBySlug,
  verifiedListingAsSpace,
} from "@/lib/space-registration";

type SpaceSearch = {
  data?: string;
  dataFim?: string;
  periodo?: string;
  horaInicio?: string;
  horaFim?: string;
  evento?: string;
  capacidade?: string;
};

function validateSpaceSearch(raw: Record<string, unknown>): SpaceSearch {
  const out: SpaceSearch = {};
  if (typeof raw["data"] === "string") out.data = raw["data"];
  if (typeof raw["dataFim"] === "string") out.dataFim = raw["dataFim"];
  if (typeof raw["periodo"] === "string") out.periodo = raw["periodo"];
  if (typeof raw["horaInicio"] === "string") out.horaInicio = raw["horaInicio"];
  if (typeof raw["horaFim"] === "string") out.horaFim = raw["horaFim"];
  if (typeof raw["evento"] === "string") out.evento = raw["evento"];
  if (typeof raw["capacidade"] === "string") out.capacidade = raw["capacidade"];
  return out;
}

export const Route = createFileRoute("/espaco/$slug")({
  validateSearch: validateSpaceSearch,
  // Sem gate de auth no beforeLoad: no SSR `localStorage` não existe e a
  // nova aba era redirecionada para /bem-vindo. O pedido de reserva exige login.
  loader: ({ params }) => {
    const seeded = getSpaceBySlug(params.slug);
    if (seeded) return seeded;
    const listing = getListingBySlug(params.slug);
    if (listing) return verifiedListingAsSpace(listing);
    throw redirect({ to: "/bem-vindo" });
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${loaderData.name} — ${APP_NAME}`
          : `Espaço — ${APP_NAME}`,
      },
    ],
  }),
  component: SpaceRoute,
});

function SpaceRoute() {
  const space = Route.useLoaderData();
  const search = Route.useSearch();
  const listed = withAvailability(space, search.data);

  return <SpaceDetailPage space={listed} search={search} />;
}
