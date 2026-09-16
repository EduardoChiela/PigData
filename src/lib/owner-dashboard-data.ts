import type { EventType, Space } from "@/lib/mock-data";
import { getSpaceBySlug } from "@/lib/mock-data";
import {
  listCalendarEvents,
  listOwnerRequests,
  type OwnerReservationRequest,
} from "@/lib/owner-panel-data";

/** Janela de referência do protótipo (setembro/2026 tem 30 dias). */
const REFERENCE_MONTH_DAYS = 30;

/** Rótulos dos 6 meses simulados no gráfico de tendência, terminando no mês de referência. */
const TREND_MONTH_LABELS = ["Abr/26", "Mai/26", "Jun/26", "Jul/26", "Ago/26", "Set/26"];

export type FunnelStage = { label: string; value: number };
export type LabeledCount = { label: string; count: number };
export type AmenityStat = { label: string; count: number; revenue: number };
export type TrendPoint = { label: string; value: number };

export type SpaceMetrics = {
  slug: string;
  name: string;
  revenue: number;
  occupancyRate: number;
  conversionRate: number | null;
};

export type DashboardMetrics = {
  revenueTotal: number;
  avgTicket: number;
  conversionRate: number | null;
  pendingCount: number;
  acceptedCount: number;
  refusedCount: number;
  occupancyRate: number;
  funnel: FunnelStage[];
  eventMix: LabeledCount[];
  amenitiesTop: AmenityStat[];
  trend: TrendPoint[];
  perSpace: SpaceMetrics[];
};

/** PRNG determinístico (mulberry32) — mesma seed sempre gera a mesma série. */
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromString(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function occupancyRateFor(space: Space): number {
  const blocked = space.busyDates.length + space.partialDates.length * 0.5;
  return Math.min(1, blocked / REFERENCE_MONTH_DAYS);
}

function conversionRateFor(accepted: number, refused: number): number | null {
  const decided = accepted + refused;
  return decided > 0 ? accepted / decided : null;
}

/** Gera 6 pontos mensais simulados (dado ilustrativo, não é histórico real) em torno de um valor base. */
function simulateTrend(seedKey: string, currentValue: number, baseline: number): TrendPoint[] {
  const rand = mulberry32(seedFromString(seedKey));
  const base = Math.max(baseline, 1);
  const values = TREND_MONTH_LABELS.map((_, i) => {
    if (i === TREND_MONTH_LABELS.length - 1) return currentValue;
    const factor = 0.6 + rand() * 0.7; // entre 60% e 130% da base
    return Math.round(base * factor);
  });
  return TREND_MONTH_LABELS.map((label, i) => ({ label, value: values[i]! }));
}

export function getDashboardMetrics(spaceSlugs: string[]): DashboardMetrics {
  const ownedSpaces = spaceSlugs
    .map((slug) => getSpaceBySlug(slug))
    .filter((s): s is Space => Boolean(s));

  const requestsBySpace = new Map<string, OwnerReservationRequest[]>();
  for (const slug of spaceSlugs) {
    requestsBySpace.set(slug, listOwnerRequests([slug]));
  }
  const allRequests = spaceSlugs.flatMap((slug) => requestsBySpace.get(slug) ?? []);

  const accepted = allRequests.filter((r) => r.status === "aceita");
  const refused = allRequests.filter((r) => r.status === "recusada");
  const pending = allRequests.filter((r) => r.status === "pendente");

  const revenueTotal = accepted.reduce((sum, r) => sum + r.estimatedTotal, 0);
  const avgTicket = accepted.length > 0 ? revenueTotal / accepted.length : 0;
  const conversionRate = conversionRateFor(accepted.length, refused.length);

  const occupancyRate =
    ownedSpaces.length > 0
      ? ownedSpaces.reduce((sum, s) => sum + occupancyRateFor(s), 0) / ownedSpaces.length
      : 0;

  const visitsCount = ownedSpaces.reduce(
    (sum, s) => sum + listCalendarEvents(s.slug).filter((e) => e.kind === "visita").length,
    0,
  );

  const funnel: FunnelStage[] = [
    { label: "Visitas agendadas", value: visitsCount },
    { label: "Solicitações de reserva", value: allRequests.length },
    { label: "Reservas confirmadas", value: accepted.length },
  ];

  const eventMixMap = new Map<EventType, number>();
  for (const r of allRequests) {
    eventMixMap.set(r.eventType, (eventMixMap.get(r.eventType) ?? 0) + 1);
  }
  const eventMix: LabeledCount[] = [...eventMixMap.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);

  const amenityStats = new Map<string, { count: number; revenue: number }>();
  for (const r of accepted) {
    const space = getSpaceBySlug(r.spaceSlug);
    for (const name of r.amenities) {
      const entry = amenityStats.get(name) ?? { count: 0, revenue: 0 };
      entry.count += 1;
      const offer = space?.amenities.find((a) => a.name === name);
      if (offer && !offer.included) entry.revenue += offer.price;
      amenityStats.set(name, entry);
    }
  }
  const amenitiesTop: AmenityStat[] = [...amenityStats.entries()]
    .map(([label, v]) => ({ label, count: v.count, revenue: v.revenue }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const avgBasePrice =
    ownedSpaces.length > 0
      ? ownedSpaces.reduce((sum, s) => sum + s.basePrice, 0) / ownedSpaces.length
      : 2000;
  const trend = simulateTrend(spaceSlugs.join("|"), revenueTotal, avgBasePrice * 0.7);

  const perSpace: SpaceMetrics[] = ownedSpaces.map((space) => {
    const reqs = requestsBySpace.get(space.slug) ?? [];
    const spaceAccepted = reqs.filter((r) => r.status === "aceita");
    const spaceRefused = reqs.filter((r) => r.status === "recusada");
    return {
      slug: space.slug,
      name: space.name,
      revenue: spaceAccepted.reduce((sum, r) => sum + r.estimatedTotal, 0),
      occupancyRate: occupancyRateFor(space),
      conversionRate: conversionRateFor(spaceAccepted.length, spaceRefused.length),
    };
  });

  return {
    revenueTotal,
    avgTicket,
    conversionRate,
    pendingCount: pending.length,
    acceptedCount: accepted.length,
    refusedCount: refused.length,
    occupancyRate,
    funnel,
    eventMix,
    amenitiesTop,
    trend,
    perSpace,
  };
}
