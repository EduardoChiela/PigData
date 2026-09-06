import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import type { Availability, Space } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as const;

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

function toIso(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfMonth(year: number, month: number) {
  return new Date(year, month, 1);
}

export function dayAvailability(space: Space, iso: string): Availability {
  if (space.busyDates.includes(iso)) return "indisponivel";
  if (space.partialDates.includes(iso)) return "parcial";
  return "livre";
}

export function SpaceAvailabilityCalendar({
  space,
  selectedDate,
  onSelectDate,
  className,
}: {
  space: Space;
  selectedDate?: string;
  onSelectDate?: (iso: string) => void;
  className?: string;
}) {
  const todayIso = useMemo(() => toIso(new Date()), []);
  const initial = selectedDate
    ? new Date(`${selectedDate}T12:00:00`)
    : new Date();
  const [cursor, setCursor] = useState(() =>
    startOfMonth(initial.getFullYear(), initial.getMonth()),
  );

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay();

  const cells = useMemo(() => {
    const list: ({ iso: string; day: number; status: Availability } | null)[] =
      [];
    for (let i = 0; i < firstWeekday; i++) list.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
      const iso = toIso(new Date(year, month, day));
      list.push({ iso, day, status: dayAvailability(space, iso) });
    }
    return list;
  }, [space, year, month, daysInMonth, firstWeekday]);

  function shiftMonth(delta: number) {
    setCursor(startOfMonth(year, month + delta));
  }

  return (
    <div className={cn("rounded-2xl border border-border bg-white p-4", className)}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display text-lg font-semibold tracking-tight">
          Disponibilidade
        </h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="grid size-8 place-items-center rounded-lg border border-border hover:bg-muted"
            aria-label="Mês anterior"
            onClick={() => shiftMonth(-1)}
          >
            <ChevronLeft className="size-4" />
          </button>
          <p className="min-w-[9.5rem] text-center text-sm font-semibold">
            {MONTHS[month]} {year}
          </p>
          <button
            type="button"
            className="grid size-8 place-items-center rounded-lg border border-border hover:bg-muted"
            aria-label="Próximo mês"
            onClick={() => shiftMonth(1)}
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">
        {WEEKDAYS.map((d) => (
          <span key={d} className="py-1">
            {d}
          </span>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          if (!cell) {
            return <div key={`e-${i}`} className="aspect-square" />;
          }
          const selected = selectedDate === cell.iso;
          const isToday = cell.iso === todayIso;
          const busy = cell.status === "indisponivel";
          return (
            <button
              key={cell.iso}
              type="button"
              disabled={busy}
              onClick={() => onSelectDate?.(cell.iso)}
              className={cn(
                "aspect-square rounded-lg text-sm font-semibold transition",
                cell.status === "livre" &&
                  "bg-emerald-50 text-emerald-900 hover:bg-emerald-100",
                cell.status === "parcial" &&
                  "bg-amber-50 text-amber-950 hover:bg-amber-100",
                busy && "cursor-not-allowed bg-rose-50 text-rose-300 line-through",
                selected && "ring-2 ring-primary ring-offset-1",
                isToday && !selected && "outline outline-1 outline-offset-[-1px] outline-[var(--ink)]/35",
              )}
              aria-label={`${cell.day} de ${MONTHS[month]}, ${cell.status}`}
              aria-pressed={selected}
            >
              {cell.day}
            </button>
          );
        })}
      </div>

      <ul className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <li className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-emerald-400" /> Livre
        </li>
        <li className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-amber-400" /> Parcial
        </li>
        <li className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-rose-300" /> Ocupado
        </li>
      </ul>
    </div>
  );
}
