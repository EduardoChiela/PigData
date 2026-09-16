export type MapSearchParams = {
  cidade?: string;
  data?: string;
  dataFim?: string;
  periodo?: string;
  horaInicio?: string;
  horaFim?: string;
  q?: string;
  acit?: string;
  pets?: string;
  capacidade?: string;
  areaMin?: string;
  areaMax?: string;
  precoMax?: string;
  modalidade?: string;
  janelas?: string;
  tensao?: string;
  /** Compat: uma comodidade. Preferir `comodidades` (AND, CSV). */
  comodidade?: string;
  /** Várias comodidades (AND), separadas por vírgula. */
  comodidades?: string;
  evento?: string;
  classe?: string;
  slug?: string;
};

/** Permite limpar params na URL com `undefined` (exactOptionalPropertyTypes). */
export type MapSearchPatch = {
  [K in keyof MapSearchParams]?: MapSearchParams[K] | undefined;
};

export function validateMapSearch(
  raw: Record<string, unknown>,
): MapSearchParams {
  const out: MapSearchParams = {};
  if (typeof raw["cidade"] === "string") out.cidade = raw["cidade"];
  if (typeof raw["data"] === "string") out.data = raw["data"];
  if (typeof raw["dataFim"] === "string") out.dataFim = raw["dataFim"];
  if (typeof raw["periodo"] === "string") out.periodo = raw["periodo"];
  if (typeof raw["horaInicio"] === "string") out.horaInicio = raw["horaInicio"];
  if (typeof raw["horaFim"] === "string") out.horaFim = raw["horaFim"];
  if (typeof raw["q"] === "string") out.q = raw["q"];
  if (typeof raw["acit"] === "string") out.acit = raw["acit"];
  if (typeof raw["pets"] === "string") out.pets = raw["pets"];
  if (typeof raw["capacidade"] === "string") out.capacidade = raw["capacidade"];
  if (typeof raw["areaMin"] === "string") out.areaMin = raw["areaMin"];
  if (typeof raw["areaMax"] === "string") out.areaMax = raw["areaMax"];
  if (typeof raw["precoMax"] === "string") out.precoMax = raw["precoMax"];
  if (typeof raw["modalidade"] === "string") out.modalidade = raw["modalidade"];
  if (typeof raw["janelas"] === "string") out.janelas = raw["janelas"];
  if (typeof raw["tensao"] === "string") out.tensao = raw["tensao"];
  if (typeof raw["comodidade"] === "string") out.comodidade = raw["comodidade"];
  if (typeof raw["comodidades"] === "string")
    out.comodidades = raw["comodidades"];
  if (typeof raw["evento"] === "string") out.evento = raw["evento"];
  if (typeof raw["classe"] === "string") out.classe = raw["classe"];
  if (typeof raw["slug"] === "string") out.slug = raw["slug"];
  return out;
}
