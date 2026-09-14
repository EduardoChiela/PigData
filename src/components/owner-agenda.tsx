import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatDateBR } from "@/lib/format";
import type { Space } from "@/lib/mock-data";
import {
  eventsOnDate,
  getBlockedDates,
  listCalendarEvents,
  toggleBlockedDate,
  type OwnerCalendarEvent,
} from "@/lib/owner-panel-data";
import { cn } from "@/lib/utils";

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
] as const;

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as const;

function toIso(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const TODAY_ISO = toIso(new Date());

type DayChip = {
  key: string;
  tone: "reserva" | "visita" | "bloqueado" | "pendente" | "hold" | "external";
  text: string;
};

export function OwnerAgenda({
  space,
  spaces,
  onSelectSpace,
  tick,
  onRefresh,
}: {
  space: Space;
  spaces: Space[];
  onSelectSpace: (slug: string) => void;
  tick: number;
  onRefresh: () => void;
}) {
  const [cursor, setCursor] = useState(() => new Date(2026, 8, 1));
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [gcalConnected, setGcalConnected] = useState(false);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay();

  const calendarEvents = useMemo(
    () => listCalendarEvents(space.slug),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [space.slug, tick],
  );
  const blocked = useMemo(
    () => getBlockedDates(space.slug),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [space.slug, tick],
  );

  function dayChips(iso: string): DayChip[] {
    const events = calendarEvents.filter((e) => e.date === iso);
    const chips: DayChip[] = [];

    for (const evt of events) {
      const tone =
        evt.kind === "reserva"
          ? "reserva"
          : evt.kind === "hold"
            ? "hold"
            : evt.kind === "pendente"
              ? "pendente"
              : evt.kind === "bloqueado"
                ? "bloqueado"
                : evt.kind === "external"
                  ? "external"
                  : "visita";
      const firstName = evt.clientName.split(" ")[0] ?? "Pedido";
      chips.push({
        key: evt.id,
        tone,
        text:
          tone === "reserva"
            ? firstName
            : tone === "hold"
              ? `Hold · ${firstName}`
              : tone === "pendente"
                ? `Pend. · ${firstName}`
                : tone === "visita"
                  ? `Visita · ${firstName.slice(0, 8)}`
                  : evt.label,
      });
    }

    if (
      space.busyDates.includes(iso) &&
      !events.some((e) => e.kind === "reserva" || e.kind === "external")
    ) {
      chips.push({
        key: `busy-${iso}`,
        tone: "external",
        text: "Externo",
      });
    }

    if (blocked.includes(iso)) {
      chips.push({ key: `blk-${iso}`, tone: "bloqueado", text: "Bloqueado" });
    }

    return chips;
  }

  function dayKind(
    iso: string,
  ): "livre" | "ocupado" | "visita" | "bloqueado" | "pendente" {
    const chips = dayChips(iso);
    if (chips.some((c) => c.tone === "reserva" || c.tone === "hold"))
      return "ocupado";
    if (chips.some((c) => c.tone === "bloqueado" || c.tone === "external"))
      return "bloqueado";
    if (chips.some((c) => c.tone === "pendente")) return "pendente";
    if (chips.some((c) => c.tone === "visita")) return "visita";
    return "livre";
  }

  const selectedEvents: OwnerCalendarEvent[] = selectedDay
    ? eventsOnDate(space.slug, selectedDay)
    : [];

  const cells: ({ iso: string; day: number } | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ iso: toIso(new Date(year, month, d)), day: d });
  }

  const monthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;
  const upcoming = calendarEvents.filter((e) =>
    e.date.startsWith(monthPrefix),
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-[#dadce0] bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-2 border-b border-[#dadce0] px-3 py-2.5 md:px-4">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-9 rounded-full border-[#dadce0] font-medium"
          onClick={() => setCursor(new Date(2026, 8, 1))}
        >
          Hoje
        </Button>
        <div className="flex items-center">
          <button
            type="button"
            className="grid size-9 place-items-center rounded-full hover:bg-[#f1f3f4]"
            aria-label="Mês anterior"
            onClick={() => setCursor(new Date(year, month - 1, 1))}
          >
            <ChevronLeft className="size-5 text-[#3c4043]" />
          </button>
          <button
            type="button"
            className="grid size-9 place-items-center rounded-full hover:bg-[#f1f3f4]"
            aria-label="Próximo mês"
            onClick={() => setCursor(new Date(year, month + 1, 1))}
          >
            <ChevronRight className="size-5 text-[#3c4043]" />
          </button>
        </div>
        <h1 className="min-w-0 flex-1 font-display text-xl font-normal tracking-tight text-[#3c4043] md:text-2xl">
          {MONTHS[month]} {year}
        </h1>
        {spaces.length > 1 ? (
          <select
            className="rounded-lg border border-[#dadce0] bg-white px-2.5 py-1.5 text-sm text-[#3c4043]"
            value={space.slug}
            onChange={(e) => onSelectSpace(e.target.value)}
          >
            {spaces.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
        ) : (
          <p className="hidden text-sm text-[#5f6368] sm:block">{space.name}</p>
        )}
        <Button
          type="button"
          size="sm"
          variant="outline"
          className={cn(
            "h-9 gap-1.5 rounded-full border-[#dadce0] font-medium",
            gcalConnected && "border-[#34a853]/40 bg-[#e6f4ea] text-[#137333]",
          )}
          onClick={() => setGcalConnected((v) => !v)}
        >
          <CalendarDays className="size-3.5" />
          {gcalConnected ? "Google sincronizado" : "Sincronizar Google"}
        </Button>
      </div>

      {gcalConnected ? (
        <p className="border-b border-[#dadce0] bg-[#e8f0fe] px-4 py-2 text-xs text-[#1967d2]">
          Mock: a agenda da plataforma continua como fonte; o Google Calendar
          entra só como espelho opcional (OAuth real depois).
        </p>
      ) : null}

      <div className="grid grid-cols-7 border-b border-[#dadce0]">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="border-r border-[#dadce0] py-2 text-center text-[0.7rem] font-medium uppercase tracking-wide text-[#70757a] last:border-r-0"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 auto-rows-[minmax(5.5rem,1fr)]">
        {cells.map((cell, i) => {
          if (!cell) {
            return (
              <div
                key={`e-${i}`}
                className="min-h-[5.5rem] border-b border-r border-[#dadce0] bg-[#f8f9fa]"
              />
            );
          }
          const chips = dayChips(cell.iso);
          const isToday = cell.iso === TODAY_ISO;
          const selected = selectedDay === cell.iso;
          return (
            <button
              key={cell.iso}
              type="button"
              onClick={() => setSelectedDay(cell.iso)}
              className={cn(
                "flex min-h-[5.5rem] flex-col items-stretch gap-0.5 border-b border-r border-[#dadce0] bg-white p-1 text-left transition hover:bg-[#f8f9fa]",
                selected && "bg-[#e8f0fe] hover:bg-[#e8f0fe]",
              )}
            >
              <span
                className={cn(
                  "mb-0.5 grid size-7 place-items-center self-center rounded-full text-xs font-medium text-[#3c4043]",
                  isToday && "bg-[#1a73e8] font-semibold text-white",
                  selected && !isToday && "bg-[#d2e3fc] text-[#174ea6]",
                )}
              >
                {cell.day}
              </span>
              <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-hidden">
                {chips.slice(0, 3).map((chip) => (
                  <span
                    key={chip.key}
                    className={cn(
                      "truncate rounded px-1 py-0.5 text-[0.65rem] font-medium leading-tight text-white",
                      chip.tone === "reserva" && "bg-[#0b8043]",
                      chip.tone === "hold" && "bg-[#f9ab00] text-[#202124]",
                      chip.tone === "pendente" && "bg-[#9334e6]",
                      chip.tone === "visita" && "bg-[#039be5]",
                      chip.tone === "bloqueado" && "bg-[#d50000]",
                      chip.tone === "external" && "bg-[#5f6368]",
                    )}
                    title={chip.text}
                  >
                    {chip.text}
                  </span>
                ))}
                {chips.length > 3 ? (
                  <span className="px-1 text-[0.6rem] font-medium text-[#5f6368]">
                    +{chips.length - 3} mais
                  </span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-4 border-t border-[#dadce0] px-4 py-3 text-xs text-[#5f6368]">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm border border-[#dadce0] bg-white" />{" "}
          Livre
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-[#0b8043]" /> Confirmada
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-[#f9ab00]" /> Hold / pgto
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-[#9334e6]" /> Solicitação
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-[#039be5]" /> Visita
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-[#d50000]" /> Bloqueado
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-[#5f6368]" /> Externo
        </span>
      </div>

      {selectedDay ? (
        <div className="border-t border-[#dadce0] bg-[#f8f9fa] px-4 py-4">
          <p className="text-sm font-medium text-[#3c4043]">
            {formatDateBR(selectedDay)}
            <span className="ml-2 font-normal text-[#5f6368]">
              {dayKind(selectedDay) === "ocupado"
                ? "· reservado / hold"
                : dayKind(selectedDay) === "pendente"
                  ? "· com solicitação"
                  : dayKind(selectedDay) === "visita"
                    ? "· com visita"
                    : dayKind(selectedDay) === "bloqueado"
                      ? "· bloqueado"
                      : "· livre"}
            </span>
          </p>

          {selectedEvents.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {selectedEvents.map((evt) => (
                <li
                  key={evt.id}
                  className="flex gap-2 rounded-lg border border-[#dadce0] bg-white px-3 py-2.5 text-sm shadow-sm"
                >
                  <span
                    className={cn(
                      "mt-1 size-2.5 shrink-0 rounded-full",
                      evt.kind === "reserva" && "bg-[#0b8043]",
                      evt.kind === "hold" && "bg-[#f9ab00]",
                      evt.kind === "pendente" && "bg-[#9334e6]",
                      evt.kind === "visita" && "bg-[#039be5]",
                      evt.kind === "bloqueado" && "bg-[#d50000]",
                      evt.kind === "external" && "bg-[#5f6368]",
                    )}
                  />
                  <div className="min-w-0">
                    <p className="font-medium text-[#3c4043]">
                      {evt.label}
                      <span className="ml-1.5 text-xs font-normal text-[#5f6368]">
                        {evt.kind === "reserva"
                          ? "confirmada"
                          : evt.kind === "hold"
                            ? "aguardando pagamento"
                            : evt.kind === "pendente"
                              ? "solicitação"
                              : evt.kind === "visita"
                                ? "visita"
                                : evt.kind}
                      </span>
                    </p>
                    <p className="text-[#5f6368]">
                      {evt.clientName} · {evt.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : blocked.includes(selectedDay) ? (
            <p className="mt-2 text-sm text-[#5f6368]">
              Data bloqueada por você — não aparece como livre na busca.
            </p>
          ) : (
            <p className="mt-2 text-sm text-[#5f6368]">
              Nenhum evento neste dia.
            </p>
          )}

          {dayKind(selectedDay) !== "ocupado" ||
          blocked.includes(selectedDay) ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="mt-3 rounded-full border-[#dadce0] font-medium"
              onClick={() => {
                toggleBlockedDate(space.slug, selectedDay);
                onRefresh();
              }}
            >
              {blocked.includes(selectedDay)
                ? "Desbloquear data"
                : "Bloquear data manualmente"}
            </Button>
          ) : null}
        </div>
      ) : null}

      {upcoming.length > 0 ? (
        <div className="border-t border-[#dadce0] px-4 py-4">
          <h2 className="text-sm font-medium text-[#3c4043]">Neste mês</h2>
          <ul className="mt-2 space-y-1.5">
            {upcoming.map((evt) => (
              <li key={evt.id}>
                <button
                  type="button"
                  className="flex w-full items-start gap-3 rounded-lg px-2 py-2 text-left text-sm hover:bg-[#f1f3f4]"
                  onClick={() => setSelectedDay(evt.date)}
                >
                  <span
                    className={cn(
                      "mt-1.5 size-2.5 shrink-0 rounded-full",
                      evt.kind === "reserva" && "bg-[#0b8043]",
                      evt.kind === "hold" && "bg-[#f9ab00]",
                      evt.kind === "pendente" && "bg-[#9334e6]",
                      evt.kind === "visita" && "bg-[#039be5]",
                      (evt.kind === "bloqueado" || evt.kind === "external") &&
                        "bg-[#5f6368]",
                    )}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-[#3c4043]">
                      {formatDateBR(evt.date)} · {evt.clientName}
                    </span>
                    <span className="block text-xs text-[#5f6368]">
                      {evt.label} — {evt.detail}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
