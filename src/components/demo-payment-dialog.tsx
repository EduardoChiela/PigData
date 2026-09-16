import { CreditCard, QrCode, ShieldCheck, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { brl, formatDateBR } from "@/lib/format";
import { periodLabel } from "@/lib/mock-data";
import { type Reservation, reservationSpaceLabel } from "@/lib/reservations";
import { cn } from "@/lib/utils";

type DemoPaymentDialogProps = {
  open: boolean;
  reservation: Reservation | null;
  onClose: () => void;
  onPaid: () => void;
};

type PaymentMethod = "card" | "pix";
type PaymentState = "idle" | "processing" | "failed";

export function DemoPaymentDialog({
  open,
  reservation,
  onClose,
  onPaid,
}: DemoPaymentDialogProps) {
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [state, setState] = useState<PaymentState>("idle");

  const pixCode = useMemo(() => {
    if (!reservation) return "";
    return `PIX-DEMO-${reservation.id}-${reservation.estimatedTotal}`;
  }, [reservation]);

  if (!open || !reservation) return null;

  function approveDemoPayment() {
    setState("processing");
    window.setTimeout(() => {
      setState("idle");
      onPaid();
    }, 700);
  }

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-black/45 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-payment-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && state !== "processing") {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-[34rem] overflow-hidden rounded-2xl border border-border bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
              <ShieldCheck className="size-3.5" />
              Pagamento demo
            </div>
            <h2 id="demo-payment-title" className="text-xl font-semibold">
              Finalizar reserva
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Nenhum pagamento real sera processado nesta apresentacao.
            </p>
          </div>
          <button
            type="button"
            className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Fechar pagamento"
            disabled={state === "processing"}
            onClick={onClose}
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div className="rounded-xl border border-border bg-muted/25 p-4">
            <p className="font-semibold">{reservationSpaceLabel(reservation)}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatDateBR(reservation.date)} · {periodLabel(reservation.period)}
            </p>
            <div className="mt-3 flex items-end justify-between gap-3 border-t border-border pt-3">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Total demo
              </span>
              <span className="text-2xl font-bold">{brl(reservation.estimatedTotal)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
            <button
              type="button"
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition",
                method === "card" ? "bg-white shadow-sm" : "text-muted-foreground",
              )}
              onClick={() => setMethod("card")}
            >
              <CreditCard className="size-4" />
              Cartao demo
            </button>
            <button
              type="button"
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition",
                method === "pix" ? "bg-white shadow-sm" : "text-muted-foreground",
              )}
              onClick={() => setMethod("pix")}
            >
              <QrCode className="size-4" />
              PIX demo
            </button>
          </div>

          {method === "card" ? (
            <div className="grid gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <DemoField label="Nome no cartao" value="Cliente Demo" />
                <DemoField label="Numero" value="4242 4242 4242 4242" />
                <DemoField label="Validade" value="12/30" />
                <DemoField label="CVV" value="123" />
              </div>
              <p className="text-xs text-muted-foreground">
                Campos apenas visuais. Dados de cartao nao sao salvos.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-[8.5rem_1fr]">
              <div className="grid aspect-square place-items-center rounded-xl border border-border bg-white p-3">
                <div className="grid size-full grid-cols-5 gap-1">
                  {Array.from({ length: 25 }).map((_, index) => (
                    <span
                      key={index}
                      className={cn(
                        "rounded-sm",
                        [0, 1, 5, 6, 18, 19, 23, 24, 8, 12, 16].includes(index)
                          ? "bg-foreground"
                          : "bg-muted",
                      )}
                    />
                  ))}
                </div>
              </div>
              <div className="min-w-0 rounded-xl border border-border bg-muted/25 p-3">
                <p className="text-sm font-semibold">Copia e cola demo</p>
                <p className="mt-2 break-all rounded-lg bg-white p-2 text-xs text-muted-foreground">
                  {pixCode}
                </p>
              </div>
            </div>
          )}

          {state === "failed" ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              Pagamento recusado no cenario demo. A reserva continua aguardando pagamento.
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-border bg-muted/20 px-5 py-4">
          <Button
            type="button"
            variant="outline"
            disabled={state === "processing"}
            onClick={() => setState("failed")}
          >
            Simular recusa
          </Button>
          <Button
            type="button"
            className="font-semibold"
            disabled={state === "processing"}
            onClick={approveDemoPayment}
          >
            {state === "processing" ? "Processando..." : "Aprovar pagamento demo"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function DemoField({ label, value }: { label: string; value: string }) {
  return (
    <label className="grid gap-1 text-xs font-semibold text-muted-foreground">
      {label}
      <input
        className="h-10 rounded-lg border border-border bg-white px-3 text-sm font-medium text-foreground outline-none"
        value={value}
        readOnly
      />
    </label>
  );
}
