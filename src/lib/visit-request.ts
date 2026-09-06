import type { Space } from "@/lib/mock-data";

const VISIT_MESSAGE = "Gostaria de marcar uma visita!";
const STORAGE_KEY = "agora.mock.visitRequests";

export type VisitRequest = {
  id: string;
  spaceSlug: string;
  tag: "Visita";
  createdAt: string;
};

/** Telefone BR mock (Toledo 45) — campo obrigatório no cadastro real. */
export function getSpacePhone(space: Space): string {
  if (space.phone) return space.phone.replace(/\D/g, "");
  let hash = 0;
  for (let i = 0; i < space.slug.length; i++) {
    hash = (hash * 31 + space.slug.charCodeAt(i)) >>> 0;
  }
  const local = String(900000000 + (hash % 89999999)).padStart(9, "0");
  return `5545${local}`;
}

export function getSpaceWhatsAppUrl(space: Space) {
  const phone = getSpacePhone(space);
  const text = encodeURIComponent(VISIT_MESSAGE);
  return `https://wa.me/${phone}?text=${text}`;
}

export function registerVisitRequest(spaceSlug: string): VisitRequest {
  const entry: VisitRequest = {
    id: `visita-${Date.now()}`,
    spaceSlug,
    tag: "Visita",
    createdAt: new Date().toISOString(),
  };
  if (typeof window === "undefined") return entry;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const list: VisitRequest[] = raw ? (JSON.parse(raw) as VisitRequest[]) : [];
    list.unshift(entry);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 50)));
  } catch {
    /* ignore */
  }
  return entry;
}

export function listVisitRequests(): VisitRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as VisitRequest[]) : [];
  } catch {
    return [];
  }
}
