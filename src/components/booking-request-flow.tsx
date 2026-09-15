import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown, Users } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ScheduleVisitBlock } from "@/components/schedule-visit-block";
import { SpaceAvailabilityCalendar } from "@/components/space-availability-calendar";
import { Button } from "@/components/ui/button";
import { brl, formatDateBR } from "@/lib/format";
import {
  eventTypes,
  periods,
  type EventType,
  type PeriodId,
  type Space,
} from "@/lib/mock-data";
import { getActiveMockUser } from "@/lib/mock-session";
import { createReservationRequest } from "@/lib/reservations";
import { cn } from "@/lib/utils";

export type BookingOrderStep = "basics" | "amenities" | "review" | "sent";

export type BookingDraft = {
  date: string;
  endDate?: string;
  period: PeriodId;
  startTime?: string;
  endTime?: string;
  eventType: EventType;
  guests: number;
  amenityIds: string[];
};

const periodTimeRanges: Record<PeriodId, { start: string; end: string }> = {
  manha: { start: "08:00", end: "12:00" },
  tarde: { start: "13:00", end: "18:00" },
  noite: { start: "19:00", end: "23:00" },
  dia_inteiro: { start: "08:00", end: "23:00" },
};

const timeStepMinutes = 30;
const timeOptions = Array.from({ length: 48 }, (_, index) =>
  minutesToTime(index * timeStepMinutes),
);

type BookingDropdownOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

function BookingDropdown({
  value,
  options,
  onChange,
}: {
  value: string;
  options: BookingDropdownOption[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    function onPointer(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2.5 text-left text-sm text-foreground outline-none transition hover:border-stone-300 focus:border-stone-300 focus:shadow-[0_0_0_3px_rgba(120,113,108,0.22)]"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="min-w-0 truncate">{selected?.label}</span>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
      </button>
      {open ? (
        <div
          className="absolute left-0 top-[calc(100%+0.25rem)] z-[220] max-h-64 min-w-full overflow-auto rounded-lg border border-stone-300 bg-white py-1 text-sm text-foreground shadow-xl"
          role="listbox"
        >
          {options.map((option) => {
            const active = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={active}
                disabled={option.disabled}
                className={cn(
                  "block w-full whitespace-nowrap px-3 py-2 text-left hover:bg-gray-200 disabled:cursor-not-allowed disabled:text-muted-foreground/45 disabled:hover:bg-transparent",
                  active && "bg-gray-200 font-semibold",
                )}
                onClick={() => {
                  if (option.disabled) return;
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

function timeLabel(time: string) {
  return time.replace(":", "h");
}

function periodFromTimes(start: string, end: string): PeriodId {
  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);

  if (startMinutes <= 8 * 60 && endMinutes >= 22 * 60) return "dia_inteiro";
  if (startMinutes >= 6 * 60 && endMinutes <= 12 * 60) return "manha";
  if (startMinutes >= 12 * 60 && endMinutes <= 18 * 60) return "tarde";
  if (startMinutes >= 18 * 60 || endMinutes <= 6 * 60) return "noite";
  return "dia_inteiro";
}

function formatDateRange(start: string, end?: string) {
  if (!end || end === start) return formatDateBR(start);
  return `${formatDateBR(start)} - ${formatDateBR(end)}`;
}

type Props = {
  space: Space;
  initialDate?: string;
  initialEndDate?: string;
  initialPeriod?: string;
  initialStartTime?: string;
  initialEndTime?: string;
  initialEventType?: string;
  initialGuests?: number;
  onBackToProfile: () => void;
  /** Fecha o painel (ex.: após enviar) */
  onDone?: () => void;
};

export function BookingRequestFlow({
  space,
  initialDate,
  initialEndDate,
  initialPeriod,
  initialStartTime,
  initialEndTime,
  initialEventType,
  initialGuests,
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
  const [endDate, setEndDate] = useState(initialEndDate ?? "");
  const initialTimeRange = periodTimeRanges[defaultPeriod];
  const [startTime, setStartTime] = useState(
    initialStartTime ?? initialTimeRange.start,
  );
  const [endTime, setEndTime] = useState(initialEndTime ?? initialTimeRange.end);
  const period = periodFromTimes(startTime, endTime);
  const [eventType, setEventType] = useState<EventType | "">(
    eventTypes.includes(initialEventType as EventType)
      ? (initialEventType as EventType)
      : eventTypes[0] ?? "",
  );
  const [guests, setGuests] = useState<number | "">(
    initialGuests
      ? Math.min(space.capacity, Math.max(1, initialGuests))
      : Math.min(50, space.capacity) || space.capacity,
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

  const validGuests = typeof guests === "number" && guests > 0;
  const basicsReady =
    Boolean(date) && Boolean(period) && Boolean(eventType) && validGuests;

  function toggleAmenity(itemId: string) {
    setAmenityIds((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    );
  }

  function selectDateRange(iso: string) {
    if (!date || endDate) {
      setDate(iso);
      setEndDate("");
      return;
    }
    if (iso < date) {
      setEndDate(date);
      setDate(iso);
      return;
    }
    setEndDate(iso);
  }

  function sendRequest() {
    const user = getActiveMockUser();
    const clientUserId = user?.id ?? "cli-ana";
    const clientName = user?.name ?? "Ana Ribeiro";
    if (!eventType || !validGuests) return;

    const created = createReservationRequest({
      spaceSlug: space.slug,
      clientUserId,
      clientName,
      date,
      period,
      eventType,
      guests,
      amenities: selectedAmenities.map((a) => a.name),
      estimatedTotal,
    });

    if (created.status === "awaiting_payment") {
      toast.success("Aprovada automaticamente — conclua o pagamento demo.");
    } else if (created.status === "waitlisted") {
      toast.message("Período em disputa — você entrou na fila de interesse.");
    } else {
      toast.success("Solicitação enviada — aguardando o espaço.");
    }
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
              selectedEndDate={endDate || undefined}
              onSelectDate={selectDateRange}
              onClearSelection={() => {
                setDate("");
                setEndDate("");
              }}
            />

            <ScheduleVisitBlock space={space} />

            <section className="space-y-4 rounded-2xl border border-border bg-white p-4 md:p-5">
              <h3 className="font-display text-lg font-semibold">
                Dados do evento
              </h3>

              {date ? (
                <div className="rounded-xl border border-border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
                  Data selecionada:{" "}
                  <span className="font-semibold text-foreground">
                    {formatDateRange(date, endDate)}
                  </span>
                </div>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block space-y-1.5 text-sm">
                  <span className="font-medium text-muted-foreground">
                    Horario inicio
                  </span>
                  <BookingDropdown
                    value={startTime}
                    options={timeOptions.map((time) => ({
                      value: time,
                      label: timeLabel(time),
                      disabled: timeToMinutes(time) >= timeToMinutes(endTime),
                    }))}
                    onChange={(next) => {
                      setStartTime(next);
                      if (timeToMinutes(next) >= timeToMinutes(endTime)) {
                        setEndTime(
                          minutesToTime(
                            Math.min(
                              23 * 60 + 30,
                              timeToMinutes(next) + timeStepMinutes,
                            ),
                          ),
                        );
                      }
                    }}
                  />
                </label>

                <label className="block space-y-1.5 text-sm">
                  <span className="font-medium text-muted-foreground">
                    Horario fim
                  </span>
                  <BookingDropdown
                    value={endTime}
                    options={timeOptions.map((time) => ({
                      value: time,
                      label: timeLabel(time),
                      disabled: timeToMinutes(time) <= timeToMinutes(startTime),
                    }))}
                    onChange={setEndTime}
                  />
                </label>
              </div>

              <label className="hidden space-y-1.5 text-sm">
                <span className="font-medium text-muted-foreground">
                  Período
                </span>
                <BookingDropdown
                  value={period}
                  options={allowedPeriods.map((p) => ({
                    value: p.id,
                    label: p.label,
                  }))}
                  onChange={() => undefined}
                />
              </label>

              <label className="block space-y-1.5 text-sm">
                <span className="font-medium text-muted-foreground">
                  Tipo de evento
                </span>
                <BookingDropdown
                  value={eventType}
                  options={eventTypes.map((t) => ({ value: t, label: t }))}
                  onChange={(value) => setEventType(value as EventType)}
                />
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
                    if (e.target.value === "") {
                      setGuests("");
                      return;
                    }
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
              {formatDateRange(date, endDate)} · {timeLabel(startTime)} -{" "}
              {timeLabel(endTime)} · {eventType} ·{" "}
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
                  <dd className="font-medium">{formatDateRange(date, endDate)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Horario</dt>
                  <dd className="font-medium">
                    {timeLabel(startTime)} - {timeLabel(endTime)}
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
              Acompanhe em Minhas reservas e no sino de notificações. Se o
              espaço estiver em modo automático e os requisitos forem
              atendidos, a aprovação pode ser imediata (ainda sem ser reserva
              confirmada até o pagamento).
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
