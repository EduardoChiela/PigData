/** Monta o path do detalhe do espaço com search params opcionais. */
export function buildSpaceDetailHref(
  slug: string,
  search: Record<string, string | undefined> = {},
) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(search)) {
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return `/espaco/${encodeURIComponent(slug)}${query ? `?${query}` : ""}`;
}

/** Abre o detalhe do espaço em nova aba do navegador. */
export function openSpaceInNewTab(
  slug: string,
  search: Record<string, string | undefined> = {},
) {
  const path = buildSpaceDetailHref(slug, search);
  const href =
    typeof window !== "undefined"
      ? new URL(path, window.location.origin).href
      : path;
  window.open(href, "_blank", "noopener,noreferrer");
}
