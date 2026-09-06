import { useNavigate } from "@tanstack/react-router";
import { CalendarDays, MapPin, Search } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  PILOT_CITY_LABEL,
  defaultSearchDate,
  periods,
  type PeriodId,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  initialDate?: string;
  initialPeriod?: string;
  compact?: boolean;
};

export function SearchBar({
  className,
  initialDate,
  initialPeriod,
  compact = false,
}: Props) {
  const navigate = useNavigate();
  const [date, setDate] = useState(initialDate ?? defaultSearchDate);
  const [period, setPeriod] = useState<string>(
    initialPeriod ?? ("dia_inteiro" satisfies PeriodId),
  );

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void navigate({
      to: "/buscar",
      search: {
        cidade: "Toledo",
        data: date || undefined,
        periodo: period || undefined,
      },
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        "search-bar grid gap-3 rounded-2xl border border-border/60 bg-white/95 p-3 shadow-[0_24px_60px_-28px_rgba(15,35,25,0.55)] backdrop-blur md:grid-cols-[1.2fr_1fr_1fr_auto] md:items-end",
        compact && "shadow-md",
        className,
      )}
    >
      <label className="block space-y-1.5 px-2">
        <span className="flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          <MapPin className="size-3.5" />
          Onde
        </span>
        <input
          readOnly
          value={PILOT_CITY_LABEL}
          className="w-full bg-transparent text-base font-medium text-foreground outline-none"
          aria-label="Cidade"
        />
      </label>

      <label className="block space-y-1.5 border-t border-border/70 px-2 pt-3 md:border-l md:border-t-0 md:pt-0">
        <span className="flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          <CalendarDays className="size-3.5" />
          Data
        </span>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full bg-transparent text-base font-medium text-foreground outline-none"
          required
        />
      </label>

      <label className="block space-y-1.5 border-t border-border/70 px-2 pt-3 md:border-l md:border-t-0 md:pt-0">
        <span className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Período
        </span>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="w-full bg-transparent text-base font-medium text-foreground outline-none"
        >
          {periods.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </label>

      <Button type="submit" size="lg" className="w-full md:w-auto">
        <Search className="size-4" />
        Buscar espaços
      </Button>
    </form>
  );
}
