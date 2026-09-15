/** Notificações in-app persistentes (E5) — mock localStorage. */

export type NotificationType =
  | "reservation_requested"
  | "reservation_approved"
  | "reservation_auto_approved"
  | "reservation_rejected"
  | "reservation_confirmed"
  | "reservation_cancelled"
  | "reservation_conflict"
  | "payment_required"
  | "payment_confirmed"
  | "waitlist_available";

export type AppNotification = {
  id: string;
  userId: string;
  reservationId?: string;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: string;
  readAt: string | null;
};

const KEY = "agora.mock.notifications.v1";

function readAll(): AppNotification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AppNotification[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(list: AppNotification[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(list.slice(0, 100)));
  window.dispatchEvent(new Event("agora:notifications"));
}

export function pushNotification(input: {
  userId: string;
  reservationId?: string;
  type: NotificationType;
  title: string;
  body: string;
}): AppNotification {
  const row: AppNotification = {
    id: `ntf-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    userId: input.userId,
    reservationId: input.reservationId,
    type: input.type,
    title: input.title,
    body: input.body,
    createdAt: new Date().toISOString(),
    readAt: null,
  };
  const list = readAll();
  list.unshift(row);
  writeAll(list);
  return row;
}

export function listNotifications(userId: string) {
  return readAll()
    .filter((n) => n.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function countUnread(userId: string) {
  return listNotifications(userId).filter((n) => !n.readAt).length;
}

export function markNotificationRead(id: string) {
  const list = readAll().map((n) =>
    n.id === id ? { ...n, readAt: n.readAt ?? new Date().toISOString() } : n,
  );
  writeAll(list);
}

export function markAllNotificationsRead(userId: string) {
  const list = readAll().map((n) =>
    n.userId === userId
      ? { ...n, readAt: n.readAt ?? new Date().toISOString() }
      : n,
  );
  writeAll(list);
}
