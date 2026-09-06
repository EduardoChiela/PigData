import { createFileRoute, redirect } from "@tanstack/react-router";
import { MapSearchPage } from "@/components/map-search-page";
import { APP_NAME } from "@/lib/mock-data";
import {
  getActiveMockUser,
  isMockAuthenticated,
} from "@/lib/mock-session";
import { validateMapSearch } from "@/lib/search-params";

export const Route = createFileRoute("/")({
  validateSearch: validateMapSearch,
  beforeLoad: () => {
    if (!isMockAuthenticated()) {
      throw redirect({ to: "/bem-vindo" });
    }
    const user = getActiveMockUser();
    if (user?.role === "parceiro") {
      throw redirect({ to: "/painel" });
    }
  },
  head: () => ({
    meta: [{ title: `${APP_NAME} — espaços livres em Toledo - PR` }],
  }),
  component: MapSearchPage,
});
