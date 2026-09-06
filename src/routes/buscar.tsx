import { createFileRoute, redirect } from "@tanstack/react-router";
import { validateMapSearch } from "@/lib/search-params";

/** Compat: `/buscar` redireciona para a home do mapa. */
export const Route = createFileRoute("/buscar")({
  validateSearch: validateMapSearch,
  beforeLoad: ({ search }) => {
    throw redirect({ to: "/", search });
  },
});
