import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatDateBR, brl } from "@/lib/format";
import { APP_NAME, periodLabel } from "@/lib/mock-data";
import {
  getActiveMockUser,
  isMockAuthenticated,
} from "@/lib/mock-session";
import { removePaymentNotifications } from "@/lib/notifications";
import {
  cancelConfirmed,
  confirmReservation,
  listClientReservations,
  reservationSpaceLabel,
  STATUS_LABEL_CLIENT,
  type Reservation,
} from "@/lib/reservations";

export const Route = createFileRoute("/minhas-reservas")({
  validateSearch: (search: Record<string, unknown>) => ({
    pagamento:
      typeof search.pagamento === "string" ? search.pagamento : undefined,
  }),
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
  const search = Route.useSearch();
  const navigate = useNavigate();
  const user = getActiveMockUser();
  const [rows, setRows] = useState<Reservation[]>([]);
  const [cancelTarget, setCancelTarget] = useState<Reservation | null>(null);

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

  function canCancel(status: Reservation["status"]) {
    return [
      "requested",
      "pending",
      "approved",
      "auto_approved",
      "awaiting_payment",
      "confirmed",
      "waitlisted",
    ].includes(status);
  }

  function cancelReservation(reservation: Reservation) {
    if (!user) return;
    const updated = cancelConfirmed(reservation.id, user.id, "customer");
    if (!updated || updated.status !== "cancelled") {
      toast.error("Nao foi possivel cancelar esta reserva.");
      return;
    }
    removePaymentNotifications(user.id, reservation.id);
    toast.success("Reserva cancelada. O proprietario foi avisado.");
    setCancelTarget(null);
    reload();
  }

  const paymentReservation = search.pagamento
    ? rows.find((row) => row.id === search.pagamento) ?? null
    : null;

  if (paymentReservation) {
    return (
      <>
        <ReservationPaymentPage
          reservation={paymentReservation}
          userId={user.id}
          onBack={() =>
            void navigate({
              to: "/minhas-reservas",
              search: {},
            })
          }
          onPaid={() => {
            reload();
            void navigate({
              to: "/minhas-reservas",
              search: {},
            });
          }}
          onCancel={() => setCancelTarget(paymentReservation)}
        />
        <CancelReservationDialog
          reservation={cancelTarget}
          onClose={() => setCancelTarget(null)}
          onConfirm={() => {
            if (!cancelTarget) return;
            cancelReservation(cancelTarget);
            void navigate({
              to: "/minhas-reservas",
              search: {},
            });
          }}
        />
      </>
    );
  }

  return (
    <div className="page-shell py-10 md:py-14">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
            Minhas solicitações e reservas
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Acompanhe status, fila e pagamento. Solicitação ≠ reserva
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
                    onClick={() =>
                      void navigate({
                        to: "/minhas-reservas",
                        search: { pagamento: r.id },
                      })
                    }
                  >
                    Continuar para pagamento
                  </Button>
                ) : null}
                {canCancel(r.status) ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="ml-2 mt-3 font-semibold"
                    onClick={() => setCancelTarget(r)}
                  >
                    Cancelar reserva
                  </Button>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <CancelReservationDialog
        reservation={cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={() => {
          if (cancelTarget) cancelReservation(cancelTarget);
        }}
      />
    </div>
  );
}

function ReservationPaymentPage({
  reservation,
  userId,
  onBack,
  onPaid,
  onCancel,
}: {
  reservation: Reservation;
  userId: string;
  onBack: () => void;
  onPaid: () => void;
  onCancel: () => void;
}) {
  const [processing, setProcessing] = useState(false);
  const [method, setMethod] = useState<"card" | "pix">("card");
  const [installments, setInstallments] = useState("1");
  const pixCode = `PIX-${reservation.id}-${reservation.estimatedTotal}`;
  const installmentOptions = Array.from({ length: 6 }, (_, index) => {
    const count = index + 1;
    return {
      value: String(count),
      label: `${count}x de ${brl(reservation.estimatedTotal / count)}`,
    };
  });

  function approvePayment() {
    setProcessing(true);
    window.setTimeout(() => {
      const result = confirmReservation(reservation.id, "customer", userId);
      setProcessing(false);
      if (result.ok) {
        removePaymentNotifications(userId, reservation.id);
        toast.success("Pagamento aprovado. Reserva confirmada.");
        onPaid();
      } else {
        toast.error(result.error);
      }
    }, 700);
  }

  return (
    <div className="page-shell py-10 md:py-14">
      <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-[1fr_22rem]">
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm md:p-6">
          <p className="text-sm font-semibold text-muted-foreground">
            Finalizar reserva
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight">
            Pagamento
          </h1>

          <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
            <button
              type="button"
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                method === "card"
                  ? "bg-white shadow-sm"
                  : "text-muted-foreground"
              }`}
              onClick={() => setMethod("card")}
            >
              Cartao
            </button>
            <button
              type="button"
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                method === "pix" ? "bg-white shadow-sm" : "text-muted-foreground"
              }`}
              onClick={() => setMethod("pix")}
            >
              PIX
            </button>
          </div>

          {method === "card" ? (
            <div className="mt-5 space-y-5">
              <section className="space-y-3">
                <h2 className="text-sm font-semibold">Dados do cartao</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  <PaymentField label="Nome impresso no cartao" placeholder="Nome completo" />
                  <PaymentField label="CPF do titular" placeholder="000.000.000-00" />
                  <PaymentField
                    label="Numero do cartao"
                    placeholder="0000 0000 0000 0000"
                    className="sm:col-span-2"
                  />
                  <PaymentField label="Validade" placeholder="MM/AA" />
                  <PaymentField label="CVV" placeholder="000" />
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="text-sm font-semibold">Parcelamento</h2>
                <select
                  className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none transition hover:border-stone-300 focus:border-stone-300 focus:shadow-[0_0_0_3px_rgba(120,113,108,0.22)]"
                  value={installments}
                  onChange={(event) => setInstallments(event.target.value)}
                >
                  {installmentOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </section>

              <BillingAddressFields />
            </div>
          ) : (
            <div className="mt-5 space-y-5">
              <section className="grid gap-4 rounded-xl border border-border p-4 sm:grid-cols-[11rem_1fr]">
                <div className="grid aspect-square grid-cols-7 gap-1 rounded-xl border border-border bg-white p-3">
                  {Array.from({ length: 49 }).map((_, index) => (
                    <span
                      key={index}
                      className={`rounded-sm ${
                        [
                          0, 1, 2, 7, 9, 14, 15, 16, 4, 5, 6, 11, 13, 18,
                          19, 20, 28, 30, 31, 34, 36, 38, 40, 42, 43, 44,
                          46, 48,
                        ].includes(index)
                          ? "bg-foreground"
                          : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold">Pague com PIX</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Escaneie o QR Code ou copie o codigo abaixo para concluir o
                    pagamento.
                  </p>
                  <p className="mt-3 break-all rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                    {pixCode}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-3 font-semibold"
                    onClick={() => {
                      void navigator.clipboard?.writeText(pixCode);
                      toast.success("Codigo PIX copiado.");
                    }}
                  >
                    Copiar codigo PIX
                  </Button>
                </div>
              </section>

              <BillingAddressFields />
            </div>
          )}

          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <Button type="button" variant="outline" onClick={onBack}>
              Voltar
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={processing}
              onClick={onCancel}
            >
              Cancelar reserva
            </Button>
            <Button
              type="button"
              className="font-semibold"
              disabled={processing}
              onClick={approvePayment}
            >
              {processing ? "Processando..." : "Finalizar pagamento"}
            </Button>
          </div>
        </div>

        <aside className="h-fit rounded-2xl border border-border bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold">Resumo da reserva</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div>
              <p className="font-semibold">{reservationSpaceLabel(reservation)}</p>
              <p className="mt-1 text-muted-foreground">
                {formatDateBR(reservation.date)} · {periodLabel(reservation.period)}
              </p>
            </div>
            <div className="flex justify-between gap-4 border-t border-border pt-3">
              <span className="text-muted-foreground">Evento</span>
              <span className="font-medium">{reservation.eventType}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Convidados</span>
              <span className="font-medium">{reservation.guests}</span>
            </div>
            <div className="flex items-end justify-between gap-4 border-t border-border pt-3">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Total
              </span>
              <span className="text-2xl font-bold">
                {brl(reservation.estimatedTotal)}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function PaymentField({
  label,
  placeholder,
  className,
}: {
  label: string;
  placeholder: string;
  className?: string;
}) {
  return (
    <label className={`block space-y-1.5 text-sm ${className ?? ""}`}>
      <span className="font-medium text-muted-foreground">{label}</span>
      <input
        className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none transition placeholder:text-muted-foreground/50 hover:border-stone-300 focus:border-stone-300 focus:shadow-[0_0_0_3px_rgba(120,113,108,0.22)]"
        placeholder={placeholder}
      />
    </label>
  );
}

function BillingAddressFields() {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold">Endereco de cobranca</h2>
      <div className="grid gap-3 sm:grid-cols-6">
        <PaymentField label="CEP" placeholder="00000-000" className="sm:col-span-2" />
        <PaymentField label="Endereco" placeholder="Rua e numero" className="sm:col-span-4" />
        <PaymentField label="Complemento" placeholder="Apto, bloco" className="sm:col-span-3" />
        <PaymentField label="Bairro" placeholder="Bairro" className="sm:col-span-3" />
        <PaymentField label="Cidade" placeholder="Cidade" className="sm:col-span-3" />
        <PaymentField label="Estado" placeholder="UF" className="sm:col-span-3" />
      </div>
    </section>
  );
}

function LegacyReservationPaymentPage({
  reservation,
  userId,
  onBack,
  onPaid,
  onCancel,
}: {
  reservation: Reservation;
  userId: string;
  onBack: () => void;
  onPaid: () => void;
  onCancel: () => void;
}) {
  const [processing, setProcessing] = useState(false);
  const [method, setMethod] = useState<"card" | "pix">("card");
  const [installments, setInstallments] = useState("1");
  const pixCode = `PIX-${reservation.id}-${reservation.estimatedTotal}`;
  const installmentOptions = Array.from({ length: 6 }, (_, index) => {
    const count = index + 1;
    return {
      value: String(count),
      label: `${count}x de ${brl(reservation.estimatedTotal / count)}`,
    };
  });

  function approvePayment() {
    setProcessing(true);
    window.setTimeout(() => {
      const result = confirmReservation(reservation.id, "customer", userId);
      setProcessing(false);
      if (result.ok) {
        removePaymentNotifications(userId, reservation.id);
        toast.success("Pagamento aprovado. Reserva confirmada.");
        onPaid();
      } else {
        toast.error(result.error);
      }
    }, 700);
  }

  return (
    <div className="page-shell py-10 md:py-14">
      <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-white p-5 shadow-sm md:p-6">
        <p className="text-sm font-semibold text-muted-foreground">
          Finalizar reserva
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight">
          Pagamento
        </h1>

        <div className="mt-5 rounded-xl border border-border bg-muted/25 p-4">
          <p className="font-semibold">{reservationSpaceLabel(reservation)}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatDateBR(reservation.date)} · {periodLabel(reservation.period)}
          </p>
          <div className="mt-3 flex items-end justify-between gap-3 border-t border-border pt-3">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Total
            </span>
            <span className="text-2xl font-bold">
              {brl(reservation.estimatedTotal)}
            </span>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border p-4">
            <p className="text-sm font-semibold">Cartao</p>
            <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
              <p>Cliente</p>
              <p>4242 4242 4242 4242</p>
              <p>12/30 · CVV 123</p>
            </div>
          </div>
          <div className="rounded-xl border border-border p-4">
            <p className="text-sm font-semibold">PIX</p>
            <p className="mt-3 break-all rounded-lg bg-muted p-2 text-xs text-muted-foreground">
              {pixCode}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" onClick={onBack}>
            Voltar
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={processing}
            onClick={onCancel}
          >
            Cancelar reserva
          </Button>
          <Button
            type="button"
            className="font-semibold"
            disabled={processing}
            onClick={approvePayment}
          >
            {processing ? "Processando..." : "Finalizar pagamento"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function CancelReservationDialog({
  reservation,
  onClose,
  onConfirm,
}: {
  reservation: Reservation | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!reservation) return null;

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-black/45 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-reservation-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-2xl border border-border bg-white p-5 shadow-2xl">
        <h2
          id="cancel-reservation-title"
          className="font-display text-xl font-semibold tracking-tight"
        >
          Cancelar reserva?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Deseja mesmo cancelar a reserva em{" "}
          <span className="font-semibold text-foreground">
            {reservationSpaceLabel(reservation)}
          </span>
          ?
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatDateBR(reservation.date)} · {periodLabel(reservation.period)}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Nao
          </Button>
          <Button type="button" className="font-semibold" onClick={onConfirm}>
            Sim, cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
