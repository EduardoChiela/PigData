import { AnimatePresence, motion } from "motion/react";
import { Check, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { ScheduleVisitBlock } from "@/components/schedule-visit-block";
import { SpaceAvailabilityCalendar } from "@/components/space-availability-calendar";
import { Button } from "@/components/ui/button";
import { brl, formatDateBR } from "@/lib/format";
import {
  periods,
  type EventType,
  type PeriodId,
  type Space,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export type BookingOrderStep = "basics" | "amenities" | "review" | "sent";

export type BookingDraft = {
  date: string;
  period: PeriodId;
  eventType: EventType;
  guests: number;
  amenityIds: string[];
};

type Props = {
  space: Space;
  initialDate?: string;
  initialPeriod?: string;
  onBackToProfile: () => void;
  /** Fecha o painel (ex.: após enviar) */
  onDone?: () => void;
};

export function BookingRequestFlow({
  space,
  initialDate,
  initialPeriod,
  onBackToProfile,
  onDone,
}: Props) {
  const allowedPeriods = periods.filter((p) => {
    if (p.id === "dia_inteiro") return space.allowsFullDayRental;
    return space.allowsFullDayRental || space.allowsHourlyRental;
  });

  const defaultPeriod =
    (allowedPeriods.find((p) => p.id === initialPeriod)?.id as PeriodId) ??
    allowedPeriods[0]?.id ??
    "dia_inteiro";

  const [orderStep, setOrderStep] = useState<BookingOrderStep>("basics");
  const [date, setDate] = useState(initialDate ?? "");
  const [period, setPeriod] = useState<PeriodId>(defaultPeriod);
  const [eventType, setEventType] = useState<EventType | "">(
    space.eventTypes[0] ?? "",
  );
  const [guests, setGuests] = useState(
    Math.min(50, space.capacity) || space.capacity,
  );
  const [amenityIds, setAmenityIds] = useState<string[]>([]);

  const included = space.amenities.filter((a) => a.included);
  const optional = space.amenities.filter((a) => !a.included);

  const selectedAmenities = useMemo(
    () => optional.filter((a) => amenityIds.includes(a.itemId)),
    [optional, amenityIds],
  );

  const amenitiesTotal = selectedAmenities.reduce((sum, a) => sum + a.price, 0);
  const estimatedTotal = space.basePrice + amenitiesTotal;

  const basicsReady =
    Boolean(date) && Boolean(period) && Boolean(eventType) && guests > 0;

  function toggleAmenity(itemId: string) {
    setAmenityIds((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    );
  }

  function sendRequest() {
    // Mock: pedido enviado — painel do espaço / métricas entram depois
    setOrderStep("sent");
  }

  const stepLabel =
    orderStep === "basics"
      ? "1 · Data e evento"
      : orderStep === "amenities"
        ? "2 · Comodidades"
        : orderStep === "review"
          ? "3 · Revisão"
          : "Pedido enviado";

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-4 pb-28 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">
          Seu pedido — {space.name}
        </p>
        <p className="rounded-md bg-muted px-2 py-0.5 text-[0.7rem] font-semibold text-muted-foreground">
          {stepLabel}
        </p>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {orderStep === "basics" ? (
          <motion.div
            key="basics"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-6"
          >
            <SpaceAvailabilityCalendar
              space={space}
              selectedDate={date || undefined}
              onSelectDate={setDate}
            />

            <ScheduleVisitBlock space={space} />

            <section className="space-y-4 rounded-2xl border border-border bg-white p-4 md:p-5">
              <h3 className="font-display text-lg font-semibold">
                Dados do evento
              </h3>

              <label className="block space-y-1.5 text-sm">
                <span className="font-medium text-muted-foreground">
                  Período
                </span>
                <select
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as PeriodId)}
                >
                  {allowedPeriods.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-1.5 text-sm">
                <span className="font-medium text-muted-foreground">
                  Tipo de evento
                </span>
                <select
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value as EventType)}
                >
                  {space.eventTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-1.5 text-sm">
                <span className="inline-flex items-center gap-1.5 font-medium text-muted-foreground">
                  <Users className="size-3.5" />
                  Convidados (máx. {space.capacity})
                </span>
                <input
                  type="number"
                  min={1}
                  max={space.capacity}
                  value={guests}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    if (Number.isNaN(n)) return;
                    setGuests(Math.min(space.capacity, Math.max(1, n)));
                  }}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5"
                />
              </label>
            </section>
          </motion.div>
        ) : null}

        {orderStep === "amenities" ? (
          <motion.div
            key="amenities"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-5"
          >
            <p className="text-sm text-muted-foreground">
              {formatDateBR(date)} ·{" "}
              {periods.find((p) => p.id === period)?.label} · {eventType} ·{" "}
              {guests} convidados
            </p>

            {included.length > 0 ? (
              <section>
                <h3 className="text-sm font-semibold">Já inclusas</h3>
                <ul className="mt-2 space-y-2">
                  {included.map((a) => (
                    <li
                      key={a.itemId}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-muted/30 px-3 py-2.5 text-sm"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Check className="size-4 text-emerald-700" />
                        {a.name}
                      </span>
                      <span className="text-muted-foreground">Incluso</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section>
              <h3 className="text-sm font-semibold">Comodidades opcionais</h3>
              {optional.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  Este espaço não oferece comodidades opcionais no catálogo.
                </p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {optional.map((a) => {
                    const checked = amenityIds.includes(a.itemId);
                    return (
                      <li key={a.itemId}>
                        <label
                          className={cn(
                            "flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 py-3 text-sm transition",
                            checked
                              ? "border-[var(--forest)]/40 bg-[color-mix(in_oklab,var(--leaf)_16%,white)]"
                              : "border-border bg-white hover:bg-muted/40",
                          )}
                        >
                          <span className="inline-flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleAmenity(a.itemId)}
                              className="size-4 accent-[var(--forest)]"
                            />
                            {a.name}
                          </span>
                          <span className="shrink-0 font-semibold tabular-nums">
                            {brl(a.price)}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <OrderTotal
              basePrice={space.basePrice}
              lines={selectedAmenities.map((a) => ({
                name: a.name,
                price: a.price,
              }))}
              total={estimatedTotal}
            />
          </motion.div>
        ) : null}

        {orderStep === "review" ? (
          <motion.div
            key="review"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-5"
          >
            <section className="rounded-2xl border border-border bg-white p-5">
              <h3 className="font-display text-lg font-semibold">
                Revise seu pedido
              </h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Espaço</dt>
                  <dd className="font-medium text-right">{space.name}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Data</dt>
                  <dd className="font-medium">{formatDateBR(date)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Período</dt>
                  <dd className="font-medium">
                    {periods.find((p) => p.id === period)?.label}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Evento</dt>
                  <dd className="font-medium">{eventType}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Convidados</dt>
                  <dd className="font-medium">{guests}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Comodidades</dt>
                  <dd className="max-w-[60%] text-right font-medium">
                    {selectedAmenities.length > 0
                      ? selectedAmenities.map((a) => a.name).join(", ")
                      : "Nenhuma opcional"}
                  </dd>
                </div>
              </dl>
            </section>

            <OrderTotal
              basePrice={space.basePrice}
              lines={selectedAmenities.map((a) => ({
                name: a.name,
                price: a.price,
              }))}
              total={estimatedTotal}
            />

            <p className="text-xs text-muted-foreground">
              Total estimado = cotação. Enviar o pedido não realiza pagamento —
              você só paga se o espaço aprovar.
            </p>
          </motion.div>
        ) : null}

        {orderStep === "sent" ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center"
          >
            <p className="font-display text-xl font-semibold text-emerald-950">
              Solicitação enviada
            </p>
            <p className="mt-2 text-sm text-emerald-900/80">
              Status mock: aguardando resposta do espaço. Acompanhar pedidos
              entra nas próximas telas.
            </p>
            <Button
              type="button"
              className="mt-5 font-semibold"
              onClick={() => {
                if (onDone) onDone();
                else onBackToProfile();
              }}
            >
              Voltar ao mapa
            </Button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {orderStep !== "sent" ? (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border/70 bg-white/95 p-3 backdrop-blur-sm md:static md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
          <div className="mx-auto flex w-full max-w-3xl flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="font-semibold"
              onClick={() => {
                if (orderStep === "basics") onBackToProfile();
                else if (orderStep === "amenities") setOrderStep("basics");
                else setOrderStep("amenities");
              }}
            >
              {orderStep === "basics" ? "Voltar ao perfil" : "Voltar"}
            </Button>

            {orderStep === "basics" ? (
              <Button
                type="button"
                className="flex-1 font-semibold"
                disabled={!basicsReady}
                onClick={() => setOrderStep("amenities")}
              >
                Continuar para comodidades
              </Button>
            ) : null}

            {orderStep === "amenities" ? (
              <Button
                type="button"
                className="flex-1 font-semibold"
                onClick={() => setOrderStep("review")}
              >
                Continuar
              </Button>
            ) : null}

            {orderStep === "review" ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="font-semibold"
                  onClick={() => setOrderStep("amenities")}
                >
                  Voltar e editar
                </Button>
                <Button
                  type="button"
                  className="flex-1 font-semibold"
                  onClick={sendRequest}
                >
                  Enviar pedido
                </Button>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function OrderTotal({
  basePrice,
  lines,
  total,
}: {
  basePrice: number;
  lines: { name: string; price: number }[];
  total: number;
}) {
  return (
    <div className="rounded-2xl border border-border bg-muted/25 p-4">
      <ul className="space-y-2 text-sm">
        <li className="flex justify-between gap-3">
          <span>Espaço (preço base)</span>
          <span className="tabular-nums font-medium">{brl(basePrice)}</span>
        </li>
        {lines.map((line) => (
          <li key={line.name} className="flex justify-between gap-3">
            <span className="truncate">{line.name}</span>
            <span className="shrink-0 tabular-nums font-medium">
              {brl(line.price)}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex justify-between gap-3 border-t border-border pt-3">
        <span className="font-semibold">Total estimado</span>
        <span className="font-display text-lg font-semibold tabular-nums">
          {brl(total)}
        </span>
      </div>
      <p className="mt-1 text-[0.7rem] text-muted-foreground">
        Cotação · não é cobrança
      </p>
    </div>
  );
}
