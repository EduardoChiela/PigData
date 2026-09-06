import type { EventType } from "@/lib/mock-data";
import { brl } from "@/lib/format";

export type OwnerRequestStatus = "pendente" | "aceita" | "recusada";

export type OwnerReservationRequest = {
  id: string;
  spaceSlug: string;
  clientName: string;
  date: string;
  eventType: EventType;
  guests: number;
  amenities: string[];
  estimatedTotal: number;
  status: OwnerRequestStatus;
};

/** Eventos fixos na agenda do parceiro (mock de visita / reserva). */
export type OwnerCalendarEvent = {
  id: string;
  spaceSlug: string;
  date: string;
  kind: "reserva" | "visita";
  label: string;
  clientName: string;
  detail: string;
};

const REQUESTS_KEY = "agora.mock.ownerRequests";
const BLOCKED_KEY = "agora.mock.ownerBlocked";

const SEED_REQUESTS: OwnerReservationRequest[] = [
  {
    id: "req-1",
    spaceSlug: "vila-verde",
    clientName: "João Silva",
    date: "2026-09-15",
    eventType: "Aniversário",
    guests: 80,
    amenities: ["Cascata de chocolate", "Coffee break"],
    estimatedTotal: 1930,
    status: "pendente",
  },
  {
    id: "req-2",
    spaceSlug: "vila-verde",
    clientName: "Carla Mendes",
    date: "2026-09-22",
    eventType: "Casamento",
    guests: 120,
    amenities: [
      "Iluminação cênica programável",
      "Camarim com espelho iluminado (making-of)",
    ],
    estimatedTotal: 5530,
    status: "pendente",
  },
  {
    id: "req-3",
    spaceSlug: "salao-corujas",
    clientName: "Empresa Norte Sul",
    date: "2026-09-18",
    eventType: "Corporativo",
    guests: 40,
    amenities: ["Wi-Fi dedicado de alta velocidade"],
    estimatedTotal: 2100,
    status: "pendente",
  },
  {
    id: "req-4",
    spaceSlug: "vila-verde",
    clientName: "Família Prado",
    date: "2026-09-12",
    eventType: "Formatura",
    guests: 150,
    amenities: ["Guarda-volumes com serviço"],
    estimatedTotal: 4920,
    status: "aceita",
  },
];

/** Visitas e reservas já na agenda (além das solicitações aceitas). */
export const SEED_CALENDAR_EVENTS: OwnerCalendarEvent[] = [
  {
    id: "evt-res-1",
    spaceSlug: "vila-verde",
    date: "2026-09-12",
    kind: "reserva",
    label: "Reserva confirmada",
    clientName: "Família Prado",
    detail: "Formatura · 150 convidados · dia inteiro",
  },
  {
    id: "evt-res-2",
    spaceSlug: "vila-verde",
    date: "2026-09-20",
    kind: "reserva",
    label: "Reserva confirmada",
    clientName: "Lucia Ferreira",
    detail: "Casamento · 180 convidados · pagamento ok",
  },
  {
    id: "evt-vis-1",
    spaceSlug: "vila-verde",
    date: "2026-09-10",
    kind: "visita",
    label: "Visita marcada",
    clientName: "Rafael Costa",
    detail: "10h30 · combinado via WhatsApp",
  },
  {
    id: "evt-vis-2",
    spaceSlug: "vila-verde",
    date: "2026-09-17",
    kind: "visita",
    label: "Visita marcada",
    clientName: "Bianca Alves",
    detail: "16h · conhecer salão e jardim",
  },
  {
    id: "evt-res-3",
    spaceSlug: "salao-corujas",
    date: "2026-09-27",
    kind: "reserva",
    label: "Reserva confirmada",
    clientName: "Hub Criativo LTDA",
    detail: "Corporativo · 35 pessoas · manhã+tarde",
  },
  {
    id: "evt-vis-3",
    spaceSlug: "salao-corujas",
    date: "2026-09-16",
    kind: "visita",
    label: "Visita marcada",
    clientName: "Pedro Nunes",
    detail: "14h · avaliar salas de reunião",
  },
  {
    id: "evt-vis-4",
    spaceSlug: "salao-corujas",
    date: "2026-09-24",
    kind: "visita",
    label: "Visita marcada",
    clientName: "Ana Ribeiro",
    detail: "11h · possível evento de confraternização",
  },
];

function readRequests(): OwnerReservationRequest[] {
  if (typeof window === "undefined") return SEED_REQUESTS;
  try {
    const raw = window.localStorage.getItem(REQUESTS_KEY);
    if (!raw) {
      window.localStorage.setItem(REQUESTS_KEY, JSON.stringify(SEED_REQUESTS));
      return [...SEED_REQUESTS];
    }
    return JSON.parse(raw) as OwnerReservationRequest[];
  } catch {
    return [...SEED_REQUESTS];
  }
}

function writeRequests(list: OwnerReservationRequest[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(REQUESTS_KEY, JSON.stringify(list));
}

export function listOwnerRequests(spaceSlugs: string[]) {
  return readRequests().filter((r) => spaceSlugs.includes(r.spaceSlug));
}

export function listPendingOwnerRequests(spaceSlugs: string[]) {
  return listOwnerRequests(spaceSlugs).filter((r) => r.status === "pendente");
}

export function listCalendarEvents(spaceSlug: string): OwnerCalendarEvent[] {
  const seeded = SEED_CALENDAR_EVENTS.filter((e) => e.spaceSlug === spaceSlug);
  const fromAccepted = listOwnerRequests([spaceSlug])
    .filter((r) => r.status === "aceita")
    .filter(
      (r) => !seeded.some((e) => e.date === r.date && e.kind === "reserva"),
    )
    .map(
      (r): OwnerCalendarEvent => ({
        id: `evt-from-${r.id}`,
        spaceSlug: r.spaceSlug,
        date: r.date,
        kind: "reserva",
        label: "Reserva confirmada",
        clientName: r.clientName,
        detail: `${r.eventType} · ${r.guests} convidados`,
      }),
    );
  return [...seeded, ...fromAccepted].sort((a, b) =>
    a.date.localeCompare(b.date),
  );
}

export function eventsOnDate(spaceSlug: string, iso: string) {
  return listCalendarEvents(spaceSlug).filter((e) => e.date === iso);
}

export function acceptOwnerRequest(id: string) {
  const list = readRequests().map((r) =>
    r.id === id ? { ...r, status: "aceita" as const } : r,
  );
  const accepted = list.find((r) => r.id === id);
  writeRequests(list);
  return accepted;
}

export function refuseOwnerRequest(id: string) {
  const list = readRequests().map((r) =>
    r.id === id ? { ...r, status: "recusada" as const } : r,
  );
  writeRequests(list);
}

export function getBlockedDates(spaceSlug: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(BLOCKED_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, string[]>) : {};
    return map[spaceSlug] ?? [];
  } catch {
    return [];
  }
}

export function toggleBlockedDate(spaceSlug: string, iso: string) {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(BLOCKED_KEY);
  const map: Record<string, string[]> = raw
    ? (JSON.parse(raw) as Record<string, string[]>)
    : {};
  const current = new Set(map[spaceSlug] ?? []);
  if (current.has(iso)) current.delete(iso);
  else current.add(iso);
  map[spaceSlug] = [...current].sort();
  window.localStorage.setItem(BLOCKED_KEY, JSON.stringify(map));
  return map[spaceSlug];
}

export function formatEstimate(n: number) {
  return brl(n);
}
