import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DemoPaymentDialog } from "@/components/demo-payment-dialog";
import {
  countUnread,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification,
} from "@/lib/notifications";
import {
  confirmReservation,
  getReservation,
  type Reservation,
} from "@/lib/reservations";
import { resolveMockUser } from "@/lib/mock-session";
import { cn } from "@/lib/utils";

export function NotificationBell({ userId }: { userId: string }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [paymentReservation, setPaymentReservation] =
    useState<Reservation | null>(null);
  const seenIds = useRef<Set<string>>(new Set());
  const rootRef = useRef<HTMLDivElement>(null);
  const user = resolveMockUser(userId);
  const isPartner = user?.role === "parceiro";

  function reload(announceNew: boolean) {
    const list = listNotifications(userId);
    if (announceNew) {
      for (const n of list) {
        if (!n.readAt && !seenIds.current.has(n.id)) {
          if (
            n.type === "reservation_approved" ||
            n.type === "reservation_auto_approved"
          ) {
            toast.success(n.title, { description: n.body });
          } else if (n.type === "reservation_confirmed") {
            toast.success(n.title, { description: n.body });
          } else if (
            n.type === "reservation_rejected" ||
            n.type === "reservation_conflict"
          ) {
            toast.message(n.title, { description: n.body });
          }
        }
      }
    }
    for (const n of list) seenIds.current.add(n.id);
    setItems(list.slice(0, 12));
    setUnread(countUnread(userId));
  }

  useEffect(() => {
    reload(false);
    const onChange = () => reload(true);
    window.addEventListener("agora:notifications", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("agora:notifications", onChange);
      window.removeEventListener("storage", onChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    if (!open) return;
    function onPointer(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [open]);

  function onPayDemo(reservationId?: string) {
    if (!reservationId) return;
    const reservation = getReservation(reservationId);
    if (!reservation) {
      toast.error("Reserva nao encontrada.");
      return;
    }
    setOpen(false);
    setPaymentReservation(reservation);
  }

  function onNotificationClick(n: AppNotification) {
    markNotificationRead(n.id);
    reload(false);
    if (isPartner) {
      setOpen(false);
      void navigate({
        to: "/painel",
        search: {
          aba: "solicitacoes",
          destaque: n.reservationId,
        },
      });
    }
  }

  return (
    <>
      <div className="relative" ref={rootRef}>
      <button
        type="button"
        className="relative grid size-9 place-items-center rounded-full border border-white/15 bg-white/8 text-white hover:bg-white/12"
        aria-label="Notificações"
        aria-expanded={open}
        onClick={() => {
          setOpen((v) => !v);
          if (!open) reload(false);
        }}
      >
        <Bell className="size-4" />
        {unread > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-[var(--warm)] px-1 text-[0.6rem] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+0.4rem)] z-50 w-[22rem] overflow-hidden rounded-xl border border-border bg-white text-foreground shadow-xl">
          <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
            <p className="text-sm font-semibold">Notificações</p>
            <button
              type="button"
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
              onClick={() => {
                markAllNotificationsRead(userId);
                reload(false);
              }}
            >
              Marcar lidas
            </button>
          </div>
          {items.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              Nenhuma notificação ainda.
            </p>
          ) : (
            <ul className="max-h-80 overflow-auto">
              {items.map((n) => (
                <li
                  key={n.id}
                  className={cn(
                    "border-b border-border/60 px-3 py-2.5 last:border-0",
                    !n.readAt && "bg-[var(--sand)]/40",
                  )}
                >
                  <button
                    type="button"
                    className="w-full text-left"
                    onClick={() => onNotificationClick(n)}
                  >
                    <p className="text-sm font-semibold">{n.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {n.body}
                    </p>
                  </button>
                  {n.type === "reservation_approved" ||
                  n.type === "reservation_auto_approved" ||
                  n.type === "payment_required" ? (
                    <Button
                      type="button"
                      size="sm"
                      className="mt-2 h-8 font-semibold"
                      onClick={() => onPayDemo(n.reservationId)}
                    >
                      Continuar para pagamento
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
          <div className="border-t border-border p-2">
            <Link
              to={isPartner ? "/painel" : "/minhas-reservas"}
              search={isPartner ? { aba: "solicitacoes" } : undefined}
              className="block rounded-lg px-2 py-2 text-center text-sm font-medium hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              {isPartner ? "Ver solicitações" : "Ver minhas reservas"}
            </Link>
          </div>
        </div>
      ) : null}
    </div>
      <DemoPaymentDialog
        open={Boolean(paymentReservation)}
        reservation={paymentReservation}
        onClose={() => setPaymentReservation(null)}
        onPaid={() => {
          if (!paymentReservation) return;
          const result = confirmReservation(
            paymentReservation.id,
            "customer",
            userId,
          );
          if (result.ok) {
            toast.success("Pagamento demo aprovado. Reserva confirmada.");
            setPaymentReservation(null);
            reload(false);
          } else {
            toast.error(result.error);
          }
        }}
      />
    </>
  );
}
