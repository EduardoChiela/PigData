import type { Space } from "@/lib/mock-data";
import { spaces } from "@/lib/mock-data";
import {
  getBlockedDates,
  listCalendarEvents,
} from "@/lib/owner-panel-data";

export type AgendaHealth = "ok" | "warn" | "bad";

export type NetworkSpaceRow = {
  space: Space;
  health: AgendaHealth;
  daysSinceUpdate: number;
  healthLabel: string;
};

/** Mock de “última atualização de agenda” para fiscalização ACIT. */
export function agendaDaysSinceUpdate(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash + slug.charCodeAt(i) * (i + 3)) % 97;
  }
  if (hash < 35) return 0;
  if (hash < 70) return 3 + (hash % 7);
  return 14 + (hash % 18);
}

export function agendaHealthFromDays(days: number): {
  health: AgendaHealth;
  healthLabel: string;
} {
  if (days <= 2) {
    return { health: "ok", healthLabel: days === 0 ? "Última att: hoje" : `Última att: há ${days}d` };
  }
  if (days < 14) {
    return { health: "warn", healthLabel: `Sem att há ${days}d` };
  }
  return { health: "bad", healthLabel: `Sem att ${days}+d` };
}

export function listNetworkSpaces(query = ""): NetworkSpaceRow[] {
  const q = query.trim().toLowerCase();
  return spaces
    .filter((s) => {
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.region.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q)
      );
    })
    .map((space) => {
      const daysSinceUpdate = agendaDaysSinceUpdate(space.slug);
      const { health, healthLabel } = agendaHealthFromDays(daysSinceUpdate);
      return { space, health, daysSinceUpdate, healthLabel };
    })
    .sort((a, b) => a.daysSinceUpdate - b.daysSinceUpdate || a.space.name.localeCompare(b.space.name));
}

export type AcitDayKind = "livre" | "ocupado" | "bloqueado";

export function acitDayKind(space: Space, iso: string): AcitDayKind {
  const blocked = getBlockedDates(space.slug);
  if (blocked.includes(iso)) return "bloqueado";
  const events = listCalendarEvents(space.slug).filter((e) => e.date === iso);
  if (events.some((e) => e.kind === "reserva") || space.busyDates.includes(iso)) {
    return "ocupado";
  }
  return "livre";
}

const MSG_KEY = "agora.mock.acitMessages";

export type AcitPartnerMessage = {
  id: string;
  spaceSlug: string;
  spaceName: string;
  body: string;
  createdAt: string;
};

export function listAcitMessages(): AcitPartnerMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(MSG_KEY);
    return raw ? (JSON.parse(raw) as AcitPartnerMessage[]) : [];
  } catch {
    return [];
  }
}

export function sendAcitMessage(input: {
  spaceSlug: string;
  spaceName: string;
  body: string;
}): AcitPartnerMessage {
  const msg: AcitPartnerMessage = {
    id: `msg-${Date.now()}`,
    spaceSlug: input.spaceSlug,
    spaceName: input.spaceName,
    body: input.body.trim(),
    createdAt: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    const all = listAcitMessages();
    all.unshift(msg);
    window.localStorage.setItem(MSG_KEY, JSON.stringify(all));
  }
  return msg;
}
