export type MapSearchParams = {
  cidade?: string;
  data?: string;
  periodo?: string;
  q?: string;
  acit?: string;
  pets?: string;
  capacidade?: string;
  evento?: string;
  classe?: string;
  slug?: string;
};

export function validateMapSearch(
  raw: Record<string, unknown>,
): MapSearchParams {
  const out: MapSearchParams = {};
  if (typeof raw["cidade"] === "string") out.cidade = raw["cidade"];
  if (typeof raw["data"] === "string") out.data = raw["data"];
  if (typeof raw["periodo"] === "string") out.periodo = raw["periodo"];
  if (typeof raw["q"] === "string") out.q = raw["q"];
  if (typeof raw["acit"] === "string") out.acit = raw["acit"];
  if (typeof raw["pets"] === "string") out.pets = raw["pets"];
  if (typeof raw["capacidade"] === "string") out.capacidade = raw["capacidade"];
  if (typeof raw["evento"] === "string") out.evento = raw["evento"];
  if (typeof raw["classe"] === "string") out.classe = raw["classe"];
  if (typeof raw["slug"] === "string") out.slug = raw["slug"];
  return out;
}
