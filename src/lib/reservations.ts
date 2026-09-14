/**
 * Motor mock de reservas (E1–E5) — fonte de verdade no localStorage.
 * Spec: docs/rascunhos/planejamento-eduardo.md
 */

import { getSpaceBySlug, periodLabel, type EventType, type PeriodId } from "@/lib/mock-data";
import { pushNotification } from "@/lib/notifications";
import { getMockUserById } from "@/lib/mock-session";
import { resolveSpaceDisplayName } from "@/lib/space-registration";

export type ReservationStatus =
  | "requested"
  | "pending"
  | "auto_approved"
  | "approved"
  | "awaiting_payment"
  | "confirmed"
  | "conflict"
  | "waitlisted"
  | "rejected"
  | "cancelled"
  | "expired";

export type BookingMode = "manual" | "automatic";

export type SpaceBookingSettings = {
  spaceSlug: string;
  bookingMode: BookingMode;
  /** Hold após aprovação, em minutos (demo). */
  paymentHoldMinutes: number;
  minNoticeHours: number;
  maxGuestsOverride: number | null;
};

export type Reservation = {
  id: string;
  spaceSlug: string;
  /** Snapshot do nome na criação (listings dinâmicos). */
  spaceName?: string;
  clientUserId: string;
  clientName: string;
  date: string;
  period: PeriodId;
  eventType: EventType;
  guests: number;
  amenities: string[];
  estimatedTotal: number;
  status: ReservationStatus;
  createdAt: string;
  updatedAt: string;
  holdExpiresAt?: string;
};

export const STATUS_LABEL_CLIENT: Record<ReservationStatus, string> = {
  requested: "Solicitação enviada",
  pending: "Aguardando aprovação",
  auto_approved: "Aprovada automaticamente",
  approved: "Solicitação aprovada",
  awaiting_payment: "Aguardando pagamento",
  confirmed: "Reserva confirmada",
  conflict: "Período ocupado",
  waitlisted: "Na fila de interesse",
  rejected: "Solicitação recusada",
  cancelled: "Cancelada",
  expired: "Solicitação expirada",
};

/** Estados que bloqueiam o período no calendário. */
export const BLOCKING_STATUSES: ReservationStatus[] = [
  "confirmed",
  "awaiting_payment",
];

const RESERVATIONS_KEY = "agora.mock.reservations.v2";
const SETTINGS_KEY = "agora.mock.bookingSettings.v1";
const HISTORY_KEY = "agora.mock.reservationHistory.v1";

const PERIOD_RANGE: Record<PeriodId, { start: number; end: number }> = {
  manha: { start: 8, end: 12 },
  tarde: { start: 13, end: 18 },
  noite: { start: 18, end: 23 },
  dia_inteiro: { start: 0, end: 24 },
};

type HistoryEntry = {
  id: string;
  reservationId: string;
  fromStatus: ReservationStatus | null;
  toStatus: ReservationStatus;
  actorType: "customer" | "owner" | "system";
  actorId?: string;
  reason?: string;
  createdAt: string;
};

const SEED: Reservation[] = [
  {
    id: "req-1",
    spaceSlug: "vila-verde",
    clientUserId: "cli-extra-joao",
    clientName: "João Silva",
    date: "2026-09-15",
    period: "noite",
    eventType: "Aniversário",
    guests: 80,
    amenities: ["Cascata de chocolate", "Coffee break"],
    estimatedTotal: 1930,
    status: "pending",
    createdAt: "2026-09-01T10:00:00.000Z",
    updatedAt: "2026-09-01T10:00:00.000Z",
  },
  {
    id: "req-1b",
    spaceSlug: "vila-verde",
    clientUserId: "cli-extra-mari",
    clientName: "Mariana Costa",
    date: "2026-09-15",
    period: "noite",
    eventType: "Confraternização",
    guests: 60,
    amenities: [],
    estimatedTotal: 1600,
    status: "pending",
    createdAt: "2026-09-01T11:00:00.000Z",
    updatedAt: "2026-09-01T11:00:00.000Z",
  },
  {
    id: "req-2",
    spaceSlug: "vila-verde",
    clientUserId: "cli-extra-carla",
    clientName: "Carla Mendes",
    date: "2026-09-22",
    period: "dia_inteiro",
    eventType: "Casamento",
    guests: 120,
    amenities: [
      "Iluminação cênica programável",
      "Camarim com espelho iluminado (making-of)",
    ],
    estimatedTotal: 5530,
    status: "pending",
    createdAt: "2026-09-02T10:00:00.000Z",
    updatedAt: "2026-09-02T10:00:00.000Z",
  },
  {
    id: "req-3",
    spaceSlug: "salao-corujas",
    clientUserId: "cli-extra-norte",
    clientName: "Empresa Norte Sul",
    date: "2026-09-18",
    period: "tarde",
    eventType: "Corporativo",
    guests: 40,
    amenities: ["Wi-Fi dedicado de alta velocidade"],
    estimatedTotal: 2100,
    status: "pending",
    createdAt: "2026-09-03T10:00:00.000Z",
    updatedAt: "2026-09-03T10:00:00.000Z",
  },
  {
    id: "req-4",
    spaceSlug: "vila-verde",
    clientUserId: "cli-extra-prado",
    clientName: "Família Prado",
    date: "2026-09-12",
    period: "dia_inteiro",
    eventType: "Formatura",
    guests: 150,
    amenities: ["Guarda-volumes com serviço"],
    estimatedTotal: 4920,
    status: "confirmed",
    createdAt: "2026-08-20T10:00:00.000Z",
    updatedAt: "2026-08-25T10:00:00.000Z",
  },
];

function nowIso() {
  return new Date().toISOString();
}

function periodBounds(date: string, period: PeriodId) {
  const { start, end } = PERIOD_RANGE[period];
  const startMs = new Date(`${date}T00:00:00`).getTime() + start * 3600_000;
  const endMs = new Date(`${date}T00:00:00`).getTime() + end * 3600_000;
  return { startMs, endMs };
}

/** Sobreposição: startA < endB && endA > startB (fim exclusivo). */
export function intervalsOverlap(
  a: { date: string; period: PeriodId },
  b: { date: string; period: PeriodId },
) {
  if (a.date !== b.date) {
    // dia_inteiro em datas diferentes não se sobrepõe neste mock (só date+period)
    return false;
  }
  const A = periodBounds(a.date, a.period);
  const B = periodBounds(b.date, b.period);
  return A.startMs < B.endMs && A.endMs > B.startMs;
}

function readList(): Reservation[] {
  if (typeof window === "undefined") return [...SEED];
  try {
    const raw = window.localStorage.getItem(RESERVATIONS_KEY);
    if (!raw) {
      window.localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(SEED));
      return [...SEED];
    }
    const parsed = JSON.parse(raw) as Reservation[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      window.localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(SEED));
      return [...SEED];
    }
    return parsed;
  } catch {
    return [...SEED];
  }
}

function writeList(list: Reservation[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("agora:reservations"));
}

function appendHistory(entry: Omit<HistoryEntry, "id" | "createdAt">) {
  if (typeof window === "undefined") return;
  const row: HistoryEntry = {
    ...entry,
    id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: nowIso(),
  };
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    const list: HistoryEntry[] = raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
    list.unshift(row);
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, 200)));
  } catch {
    /* ignore */
  }
}

function defaultSettings(spaceSlug: string): SpaceBookingSettings {
  return {
    spaceSlug,
    bookingMode: spaceSlug === "vila-verde" ? "automatic" : "manual",
    paymentHoldMinutes: 15,
    minNoticeHours: 24,
    maxGuestsOverride: null,
  };
}

export function getBookingSettings(spaceSlug: string): SpaceBookingSettings {
  if (typeof window === "undefined") return defaultSettings(spaceSlug);
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    const map = raw
      ? (JSON.parse(raw) as Record<string, SpaceBookingSettings>)
      : {};
    return map[spaceSlug] ?? defaultSettings(spaceSlug);
  } catch {
    return defaultSettings(spaceSlug);
  }
}

export function saveBookingSettings(settings: SpaceBookingSettings) {
  if (typeof window === "undefined") return settings;
  const raw = window.localStorage.getItem(SETTINGS_KEY);
  const map: Record<string, SpaceBookingSettings> = raw
    ? (JSON.parse(raw) as Record<string, SpaceBookingSettings>)
    : {};
  map[settings.spaceSlug] = settings;
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(map));
  window.dispatchEvent(new Event("agora:reservations"));
  return settings;
}

export function resetReservationsSeed() {
  if (typeof window === "undefined") return [...SEED];
  window.localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(SEED));
  window.dispatchEvent(new Event("agora:reservations"));
  return [...SEED];
}

export function listReservations() {
  return readList();
}

export function listReservationsForSpaces(spaceSlugs: string[]) {
  return readList().filter((r) => spaceSlugs.includes(r.spaceSlug));
}

export function listPendingForSpaces(spaceSlugs: string[]) {
  return listReservationsForSpaces(spaceSlugs).filter(
    (r) => r.status === "pending" || r.status === "requested",
  );
}

export function listClientReservations(clientUserId: string) {
  return readList()
    .filter((r) => r.clientUserId === clientUserId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getReservation(id: string) {
  return readList().find((r) => r.id === id) ?? null;
}

export function hasConfirmedConflict(
  spaceSlug: string,
  date: string,
  period: PeriodId,
  excludeId?: string,
) {
  return readList().some(
    (r) =>
      r.spaceSlug === spaceSlug &&
      r.id !== excludeId &&
      BLOCKING_STATUSES.includes(r.status) &&
      intervalsOverlap(
        { date, period },
        { date: r.date, period: r.period },
      ),
  );
}

function evaluateAutoRules(
  input: {
    spaceSlug: string;
    date: string;
    period: PeriodId;
    eventType: EventType;
    guests: number;
  },
  settings: SpaceBookingSettings,
): { ok: boolean; reasons: string[] } {
  const space = getSpaceBySlug(input.spaceSlug);
  const reasons: string[] = [];
  if (!space) {
    return { ok: false, reasons: ["Espaço não encontrado"] };
  }

  const maxGuests = settings.maxGuestsOverride ?? space.capacity;
  if (input.guests > maxGuests) {
    reasons.push(`Capacidade excedida (máx. ${maxGuests})`);
  }
  if (!space.eventTypes.includes(input.eventType)) {
    reasons.push("Tipo de evento não permitido");
  }
  if (space.busyDates.includes(input.date)) {
    reasons.push("Data indisponível na agenda do espaço");
  }
  const start = new Date(`${input.date}T12:00:00`).getTime();
  const noticeMs = settings.minNoticeHours * 3600_000;
  if (start - Date.now() < noticeMs) {
    reasons.push(`Antecedência mínima: ${settings.minNoticeHours}h`);
  }
  if (
    hasConfirmedConflict(input.spaceSlug, input.date, input.period)
  ) {
    reasons.push("Conflito com reserva já confirmada/hold");
  }

  return { ok: reasons.length === 0, reasons };
}

function notifyOwnerNewRequest(reservation: Reservation) {
  // Parceiro demo do Vila Verde / Corujas
  const ownerId =
    reservation.spaceSlug === "salao-corujas" ||
    reservation.spaceSlug === "vila-verde"
      ? "par-vila"
      : "par-vila";
  pushNotification({
    userId: ownerId,
    reservationId: reservation.id,
    type: "reservation_requested",
    title: "Nova solicitação",
    body: `${reservation.clientName} pediu ${reservation.date} (${reservation.period}) em ${reservation.spaceSlug}.`,
  });
}

function notifyClient(
  reservation: Reservation,
  type: Parameters<typeof pushNotification>[0]["type"],
  title: string,
  body: string,
) {
  pushNotification({
    userId: reservation.clientUserId,
    reservationId: reservation.id,
    type,
    title,
    body,
  });
}

export function createReservationRequest(input: {
  spaceSlug: string;
  clientUserId: string;
  clientName: string;
  date: string;
  period: PeriodId;
  eventType: EventType;
  guests: number;
  amenities: string[];
  estimatedTotal: number;
}): Reservation {
  const settings = getBookingSettings(input.spaceSlug);
  const createdAt = nowIso();
  let status: ReservationStatus = "pending";
  let holdExpiresAt: string | undefined;

  if (hasConfirmedConflict(input.spaceSlug, input.date, input.period)) {
    status = "waitlisted";
  } else if (settings.bookingMode === "automatic") {
    const evalResult = evaluateAutoRules(input, settings);
    if (evalResult.ok) {
      status = "awaiting_payment";
      holdExpiresAt = new Date(
        Date.now() + settings.paymentHoldMinutes * 60_000,
      ).toISOString();
    } else {
      status = "pending";
    }
  }

  const reservation: Reservation = {
    id: `req-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    ...input,
    spaceName: resolveSpaceDisplayName(input.spaceSlug),
    status,
    createdAt,
    updatedAt: createdAt,
    holdExpiresAt,
  };

  const list = readList();
  list.unshift(reservation);
  writeList(list);

  appendHistory({
    reservationId: reservation.id,
    fromStatus: null,
    toStatus: status,
    actorType: "customer",
    actorId: input.clientUserId,
    reason:
      status === "awaiting_payment"
        ? "auto_approved"
        : status === "waitlisted"
          ? "conflito confirmado → fila"
          : "solicitação criada",
  });

  notifyOwnerNewRequest(reservation);

  if (status === "awaiting_payment") {
    notifyClient(
      reservation,
      "reservation_auto_approved",
      "Aprovada automaticamente",
      `Sua solicitação em ${input.date} foi aprovada. Conclua o pagamento demo para confirmar.`,
    );
  } else if (status === "waitlisted") {
    notifyClient(
      reservation,
      "reservation_conflict",
      "Na fila de interesse",
      "O período já tem reserva/hold. Você entrou na fila se a data liberar.",
    );
  }

  return reservation;
}

export function approveReservation(
  id: string,
  actorId: string,
): Reservation | null {
  const list = readList();
  const idx = list.findIndex((r) => r.id === id);
  if (idx < 0) return null;
  const current = list[idx]!;
  if (current.status !== "pending" && current.status !== "requested") {
    return current;
  }
  if (
    hasConfirmedConflict(
      current.spaceSlug,
      current.date,
      current.period,
      current.id,
    )
  ) {
    const updated: Reservation = {
      ...current,
      status: "waitlisted",
      updatedAt: nowIso(),
    };
    list[idx] = updated;
    writeList(list);
    appendHistory({
      reservationId: id,
      fromStatus: current.status,
      toStatus: "waitlisted",
      actorType: "system",
      reason: "conflito ao tentar aprovar",
    });
    notifyClient(
      updated,
      "reservation_conflict",
      "Período ocupado",
      "Não foi possível aprovar: outro pedido já tem hold/confirmação.",
    );
    return updated;
  }

  const settings = getBookingSettings(current.spaceSlug);
  const updated: Reservation = {
    ...current,
    status: "awaiting_payment",
    holdExpiresAt: new Date(
      Date.now() + settings.paymentHoldMinutes * 60_000,
    ).toISOString(),
    updatedAt: nowIso(),
  };
  list[idx] = updated;
  writeList(list);
  appendHistory({
    reservationId: id,
    fromStatus: current.status,
    toStatus: "awaiting_payment",
    actorType: "owner",
    actorId,
    reason: "aprovação manual",
  });
  notifyClient(
    updated,
    "reservation_approved",
    "Solicitação aceita",
    `Sua solicitação para ${updated.date} foi aceita. Continue para o pagamento demo.`,
  );
  return updated;
}

export function rejectReservation(
  id: string,
  actorId: string,
): Reservation | null {
  const list = readList();
  const idx = list.findIndex((r) => r.id === id);
  if (idx < 0) return null;
  const current = list[idx]!;
  const updated: Reservation = {
    ...current,
    status: "rejected",
    updatedAt: nowIso(),
    holdExpiresAt: undefined,
  };
  list[idx] = updated;
  writeList(list);
  appendHistory({
    reservationId: id,
    fromStatus: current.status,
    toStatus: "rejected",
    actorType: "owner",
    actorId,
  });
  notifyClient(
    updated,
    "reservation_rejected",
    "Solicitação recusada",
    `O espaço não pôde atender o pedido de ${updated.date}.`,
  );
  return updated;
}

/**
 * Confirmação centralizada: só uma confirmed no intervalo;
 * concorrentes → conflict → waitlisted.
 */
export function confirmReservation(
  id: string,
  actorType: "customer" | "owner" | "system" = "customer",
  actorId?: string,
): { ok: true; reservation: Reservation } | { ok: false; error: string } {
  const list = readList();
  const idx = list.findIndex((r) => r.id === id);
  if (idx < 0) return { ok: false, error: "Reserva não encontrada" };
  const current = list[idx]!;

  if (
    current.status !== "awaiting_payment" &&
    current.status !== "approved" &&
    current.status !== "auto_approved"
  ) {
    return { ok: false, error: "Estado inválido para confirmação" };
  }

  if (
    hasConfirmedConflict(
      current.spaceSlug,
      current.date,
      current.period,
      current.id,
    )
  ) {
    list[idx] = {
      ...current,
      status: "conflict",
      updatedAt: nowIso(),
      holdExpiresAt: undefined,
    };
    writeList(list);
    return { ok: false, error: "Conflito com outra reserva confirmada" };
  }

  const confirmed: Reservation = {
    ...current,
    status: "confirmed",
    updatedAt: nowIso(),
    holdExpiresAt: undefined,
  };
  list[idx] = confirmed;

  for (let i = 0; i < list.length; i++) {
    const other = list[i]!;
    if (other.id === id) continue;
    if (other.spaceSlug !== confirmed.spaceSlug) continue;
    if (
      !["pending", "requested", "awaiting_payment", "approved", "auto_approved", "waitlisted"].includes(
        other.status,
      )
    ) {
      continue;
    }
    if (
      !intervalsOverlap(
        { date: confirmed.date, period: confirmed.period },
        { date: other.date, period: other.period },
      )
    ) {
      continue;
    }
    const moved: Reservation = {
      ...other,
      status: "waitlisted",
      updatedAt: nowIso(),
      holdExpiresAt: undefined,
    };
    list[i] = moved;
    appendHistory({
      reservationId: other.id,
      fromStatus: other.status,
      toStatus: "waitlisted",
      actorType: "system",
      reason: `conflito após confirmação de ${id}`,
    });
    notifyClient(
      moved,
      "reservation_conflict",
      "Período ocupado — você entrou na fila",
      `Outra reserva foi confirmada em ${moved.date}. Mantemos você na fila de interesse.`,
    );
  }

  writeList(list);
  appendHistory({
    reservationId: id,
    fromStatus: current.status,
    toStatus: "confirmed",
    actorType,
    actorId,
  });
  notifyClient(
    confirmed,
    "reservation_confirmed",
    "Reserva confirmada",
    `Sua reserva em ${confirmed.date} está confirmada.`,
  );
  return { ok: true, reservation: confirmed };
}

export function cancelConfirmed(
  id: string,
  actorId: string,
): Reservation | null {
  const list = readList();
  const idx = list.findIndex((r) => r.id === id);
  if (idx < 0) return null;
  const current = list[idx]!;
  if (current.status !== "confirmed" && current.status !== "awaiting_payment") {
    return current;
  }
  const updated: Reservation = {
    ...current,
    status: "cancelled",
    updatedAt: nowIso(),
    holdExpiresAt: undefined,
  };
  list[idx] = updated;

  // Reabre fila: notifica waitlisted sobrepostos
  for (const other of list) {
    if (other.status !== "waitlisted") continue;
    if (other.spaceSlug !== current.spaceSlug) continue;
    if (
      !intervalsOverlap(
        { date: current.date, period: current.period },
        { date: other.date, period: other.period },
      )
    ) {
      continue;
    }
    notifyClient(
      other,
      "waitlist_available",
      "Data pode estar disponível",
      `Uma reserva em ${other.date} foi cancelada. O espaço pode analisar seu pedido novamente.`,
    );
  }

  writeList(list);
  appendHistory({
    reservationId: id,
    fromStatus: current.status,
    toStatus: "cancelled",
    actorType: "owner",
    actorId,
  });
  return updated;
}

export type CalendarEntryKind =
  | "pending"
  | "hold"
  | "confirmed"
  | "blocked"
  | "external"
  | "visita";

export type CalendarEntry = {
  id: string;
  spaceSlug: string;
  date: string;
  kind: CalendarEntryKind;
  label: string;
  clientName: string;
  detail: string;
  reservationId?: string;
  status?: ReservationStatus;
};

export function listReservationCalendarEntries(
  spaceSlug: string,
): CalendarEntry[] {
  return readList()
    .filter((r) => r.spaceSlug === spaceSlug)
    .filter((r) =>
      [
        "pending",
        "requested",
        "awaiting_payment",
        "approved",
        "auto_approved",
        "confirmed",
        "waitlisted",
      ].includes(r.status),
    )
    .map((r): CalendarEntry => {
      let kind: CalendarEntryKind = "pending";
      if (r.status === "confirmed") kind = "confirmed";
      else if (
        r.status === "awaiting_payment" ||
        r.status === "approved" ||
        r.status === "auto_approved"
      ) {
        kind = "hold";
      } else if (r.status === "waitlisted") kind = "pending";

      return {
        id: `cal-${r.id}`,
        spaceSlug: r.spaceSlug,
        date: r.date,
        kind,
        label: STATUS_LABEL_CLIENT[r.status],
        clientName: r.clientName,
        detail: `${r.eventType} · ${r.guests} conv. · ${periodLabel(r.period)}`,
        reservationId: r.id,
        status: r.status,
      };
    });
}

/** Compat: IDs de cliente seed sem conta real ainda recebem notificação no userId informado. */
export function resolveClientDisplay(userId: string, fallback: string) {
  return getMockUserById(userId)?.name ?? fallback;
}

export function reservationSpaceLabel(r: Pick<Reservation, "spaceSlug" | "spaceName">) {
  return r.spaceName?.trim() || resolveSpaceDisplayName(r.spaceSlug);
}
