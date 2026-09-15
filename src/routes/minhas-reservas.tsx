import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatDateBR, brl } from "@/lib/format";
import { APP_NAME, periodLabel } from "@/lib/mock-data";
import {
  getActiveMockUser,
  isMockAuthenticated,
} from "@/lib/mock-session";
import {
  confirmReservation,
  listClientReservations,
  reservationSpaceLabel,
  STATUS_LABEL_CLIENT,
  type Reservation,
} from "@/lib/reservations";

export const Route = createFileRoute("/minhas-reservas")({
  beforeLoad: () => {
    if (!isMockAuthenticated()) {
      throw redirect({ to: "/entrar" });
    }
  },
  head: () => ({
    meta: [{ title: `Minhas reservas — ${APP_NAME}` }],
  }),
  component: MyReservationsPage,
});

function MyReservationsPage() {
  const user = getActiveMockUser();
  const [rows, setRows] = useState<Reservation[]>([]);

  function reload() {
    if (!user) return;
    setRows(listClientReservations(user.id));
  }

  useEffect(() => {
    reload();
    const onChange = () => reload();
    window.addEventListener("agora:reservations", onChange);
    return () => window.removeEventListener("agora:reservations", onChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (!user) return null;

  return (
    <div className="page-shell py-10 md:py-14">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
            Minhas solicitações e reservas
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Acompanhe status, fila e pagamento demo. Solicitação ≠ reserva
            confirmada.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/">Voltar ao mapa</Link>
        </Button>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Você ainda não tem solicitações. Explore o mapa e envie um pedido.
          </p>
          <Button asChild className="mt-4 font-semibold">
            <Link to="/">Buscar espaços</Link>
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => {
            return (
              <li
                key={r.id}
                className="rounded-2xl border border-border bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">
                      {reservationSpaceLabel(r)}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatDateBR(r.date)} · {periodLabel(r.period)} ·{" "}
                      {r.eventType} · {r.guests} convidados
                    </p>
                  </div>
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-[0.7rem] font-semibold">
                    {STATUS_LABEL_CLIENT[r.status]}
                  </span>
                </div>
                <p className="mt-2 text-sm font-medium">
                  Total estimado: {brl(r.estimatedTotal)}
                </p>
                {r.status === "awaiting_payment" ||
                r.status === "approved" ||
                r.status === "auto_approved" ? (
                  <Button
                    type="button"
                    className="mt-3 font-semibold"
                    onClick={() => {
                      const result = confirmReservation(
                        r.id,
                        "customer",
                        user.id,
                      );
                      if (result.ok) {
                        toast.success("Reserva confirmada (pagamento demo).");
                        reload();
                      } else {
                        toast.error(result.error);
                      }
                    }}
                  >
                    Continuar para pagamento
                  </Button>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
