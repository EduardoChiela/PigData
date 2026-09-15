import type { EventType } from "@/lib/mock-data";
import { brl } from "@/lib/format";
import {
  approveReservation,
  confirmReservation,
  listPendingForSpaces,
  listReservationCalendarEntries,
  listReservationsForSpaces,
  rejectReservation,
  resetReservationsSeed,
  STATUS_LABEL_CLIENT,
  type CalendarEntry,
  type Reservation,
  type ReservationStatus,
} from "@/lib/reservations";

/** @deprecated Prefer Reservation — mantido para imports existentes. */
export type OwnerRequestStatus =
  | "pendente"
  | "aceita"
  | "recusada"
  | ReservationStatus;

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
  period?: string;
  reservationStatus?: ReservationStatus;
};

/** Eventos fixos na agenda do parceiro (visitas mock). */
export type OwnerCalendarEvent = {
  id: string;
  spaceSlug: string;
  date: string;
  kind: "reserva" | "visita" | "pendente" | "hold" | "bloqueado" | "external";
  label: string;
  clientName: string;
  detail: string;
  reservationId?: string;
  status?: ReservationStatus;
};

const BLOCKED_KEY = "agora.mock.ownerBlocked";

/** Visitas já na agenda (seed). */
export const SEED_CALENDAR_EVENTS: OwnerCalendarEvent[] = [
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
    id: "evt-res-3",
    spaceSlug: "salao-corujas",
    date: "2026-09-27",
    kind: "reserva",
    label: "Reserva confirmada",
    clientName: "Hub Criativo LTDA",
    detail: "Corporativo · 35 pessoas · manhã+tarde",
  },
];

function toOwnerRequest(r: Reservation): OwnerReservationRequest {
  return {
    id: r.id,
    spaceSlug: r.spaceSlug,
    clientName: r.clientName,
    date: r.date,
    eventType: r.eventType,
    guests: r.guests,
    amenities: r.amenities,
    estimatedTotal: r.estimatedTotal,
    status:
      r.status === "pending" || r.status === "requested"
        ? "pendente"
        : r.status === "rejected"
          ? "recusada"
          : r.status === "confirmed"
            ? "aceita"
            : r.status,
    period: r.period,
    reservationStatus: r.status,
  };
}

export function resetOwnerRequestsSeed() {
  return resetReservationsSeed().map(toOwnerRequest);
}

export function listOwnerRequests(spaceSlugs: string[]) {
  return listReservationsForSpaces(spaceSlugs).map(toOwnerRequest);
}

export function listPendingOwnerRequests(spaceSlugs: string[]) {
  return listPendingForSpaces(spaceSlugs).map(toOwnerRequest);
}

export function listActionableOwnerRequests(spaceSlugs: string[]) {
  return listReservationsForSpaces(spaceSlugs)
    .filter((r) =>
      [
        "pending",
        "requested",
        "awaiting_payment",
        "waitlisted",
        "confirmed",
      ].includes(r.status),
    )
    .map(toOwnerRequest);
}

function entryToEvent(e: CalendarEntry): OwnerCalendarEvent {
  const kind =
    e.kind === "confirmed"
      ? "reserva"
      : e.kind === "hold"
        ? "hold"
        : e.kind === "pending"
          ? "pendente"
          : e.kind === "blocked"
            ? "bloqueado"
            : e.kind === "external"
              ? "external"
              : "visita";
  return {
    id: e.id,
    spaceSlug: e.spaceSlug,
    date: e.date,
    kind,
    label: e.label,
    clientName: e.clientName,
    detail: e.detail,
    reservationId: e.reservationId,
    status: e.status,
  };
}

export function listCalendarEvents(spaceSlug: string): OwnerCalendarEvent[] {
  const fromReservations = listReservationCalendarEntries(spaceSlug).map(
    entryToEvent,
  );
  const seeded = SEED_CALENDAR_EVENTS.filter((e) => e.spaceSlug === spaceSlug);
  const seededFiltered = seeded.filter(
    (s) =>
      !fromReservations.some(
        (r) =>
          r.date === s.date &&
          r.kind === "reserva" &&
          s.kind === "reserva" &&
          r.clientName === s.clientName,
      ),
  );
  return [...fromReservations, ...seededFiltered].sort((a, b) =>
    a.date.localeCompare(b.date),
  );
}

export function eventsOnDate(spaceSlug: string, iso: string) {
  return listCalendarEvents(spaceSlug).filter((e) => e.date === iso);
}

export function acceptOwnerRequest(id: string, actorId = "par-vila") {
  const approved = approveReservation(id, actorId);
  return approved ? toOwnerRequest(approved) : null;
}

export function refuseOwnerRequest(id: string, actorId = "par-vila") {
  const rejected = rejectReservation(id, actorId);
  return rejected ? toOwnerRequest(rejected) : null;
}

export function confirmOwnerRequestPayment(
  id: string,
  actorId = "par-vila",
) {
  const result = confirmReservation(id, "owner", actorId);
  if (!result.ok) return null;
  return toOwnerRequest(result.reservation);
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

export { STATUS_LABEL_CLIENT };
