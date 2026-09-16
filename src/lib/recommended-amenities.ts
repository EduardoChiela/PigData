import {
  amenityCatalog,
  type EventType,
} from "@/lib/mock-data";

type AmenityId = (typeof amenityCatalog)[number]["itemId"];

/** Rótulos curtos para chips (a lista completa continua no catálogo). */
const SHORT_LABEL: Partial<Record<AmenityId, string>> = {
  "cascata-chocolate": "Cascata de chocolate",
  "pula-pula": "Pula-pula",
  "algodao-pipoca": "Algodão / pipoca",
  "totem-recarga": "Totem de recarga",
  "wifi-dedicado": "Wi-Fi dedicado",
  "cafe-liberado": "Café liberado",
  "cabine-video": "Cabine de vídeo",
  "suporte-tecnico": "Suporte técnico",
  "coffee-break": "Coffee break",
  streaming: "Streaming",
  gerador: "Gerador",
  "iluminacao-cenica": "Iluminação cênica",
  "copa-buffet": "Copa para buffet",
  "cobertura-chuva": "Cobertura pra chuva",
  camarim: "Camarim",
  "guarda-volumes": "Guarda-volumes",
};

/** Comodidades sugeridas na barra de resultados (5–6), conforme o evento da busca. */
const BY_EVENT: Record<EventType, AmenityId[]> = {
  Aniversário: [
    "pula-pula",
    "cascata-chocolate",
    "algodao-pipoca",
    "iluminacao-cenica",
    "copa-buffet",
    "gerador",
  ],
  Casamento: [
    "camarim",
    "iluminacao-cenica",
    "copa-buffet",
    "guarda-volumes",
    "cobertura-chuva",
    "streaming",
  ],
  Corporativo: [
    "wifi-dedicado",
    "coffee-break",
    "streaming",
    "cabine-video",
    "suporte-tecnico",
    "totem-recarga",
  ],
  Confraternização: [
    "coffee-break",
    "copa-buffet",
    "iluminacao-cenica",
    "wifi-dedicado",
    "gerador",
    "algodao-pipoca",
  ],
  Feira: [
    "gerador",
    "wifi-dedicado",
    "totem-recarga",
    "cobertura-chuva",
    "suporte-tecnico",
    "streaming",
  ],
  Show: [
    "iluminacao-cenica",
    "gerador",
    "streaming",
    "camarim",
    "guarda-volumes",
    "suporte-tecnico",
  ],
  Formatura: [
    "iluminacao-cenica",
    "streaming",
    "copa-buffet",
    "guarda-volumes",
    "camarim",
    "wifi-dedicado",
  ],
};

const DEFAULT: AmenityId[] = [
  "wifi-dedicado",
  "gerador",
  "copa-buffet",
  "iluminacao-cenica",
  "coffee-break",
  "cobertura-chuva",
];

export type QuickAmenityChip = {
  id: string;
  label: string;
  /** Filtro especial fora do catálogo de comodidades (ex.: pets). */
  kind: "amenity" | "pets";
};

/**
 * Chips rápidos ao lado dos dropdowns: Pets + 5–6 comodidades do catálogo
 * recomendadas para o tipo de evento ativo (ou default genérico).
 */
export function recommendedAmenityChips(
  eventType?: string | null,
): QuickAmenityChip[] {
  const ids =
    eventType && eventType in BY_EVENT
      ? BY_EVENT[eventType as EventType]
      : DEFAULT;

  const amenityChips: QuickAmenityChip[] = [];
  for (const itemId of ids) {
    if (amenityChips.length >= 6) break;
    const found = amenityCatalog.find((a) => a.itemId === itemId);
    if (!found) continue;
    amenityChips.push({
      id: found.itemId,
      label: SHORT_LABEL[itemId] ?? found.name,
      kind: "amenity",
    });
  }

  return [
    { id: "pets", label: "Aceita pets", kind: "pets" },
    ...amenityChips,
  ];
}

export function parseComodidadesParam(
  value?: string | null,
): string[] {
  if (!value?.trim()) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function serializeComodidadesParam(ids: string[]): string | undefined {
  const unique = [...new Set(ids.filter(Boolean))];
  return unique.length ? unique.join(",") : undefined;
}
