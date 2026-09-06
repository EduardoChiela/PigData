import { useNavigate } from "@tanstack/react-router";
import { CalendarDays, MapPin, Search } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  PILOT_CITY_LABEL,
  defaultSearchDate,
  periods,
  type PeriodId,
} from "@/lib/mock-data";
import { loginAsMock } from "@/lib/mock-session";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  initialDate?: string;
  initialPeriod?: string;
  initialQuery?: string;
  /** Extra search params to preserve (acit, pets…) */
  preserveSearch?: Record<string, string | undefined>;
  onCollapse?: () => void;
  /** Foca o campo de texto ao montar (painel expandido) */
  autoFocusQuery?: boolean;
  /**
   * stacked = lupa/texto em cima, demais campos embaixo (busca map-first)
   * inline = grade horizontal (home)
   */
  layout?: "stacked" | "inline";
};

export function SearchBar({
  className,
  initialDate,
  initialPeriod,
  initialQuery = "",
  preserveSearch,
  onCollapse,
  autoFocusQuery = false,
  layout = "inline",
}: Props) {
  const navigate = useNavigate();
  const queryRef = useRef<HTMLInputElement>(null);
  const [date, setDate] = useState(initialDate ?? defaultSearchDate);
  const [period, setPeriod] = useState<string>(
    initialPeriod ?? ("dia_inteiro" satisfies PeriodId),
  );
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    if (autoFocusQuery) queryRef.current?.focus();
  }, [autoFocusQuery]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    loginAsMock("cli-ana");
    void navigate({
      to: "/",
      search: {
        ...preserveSearch,
        cidade: "Toledo",
        data: date || undefined,
        periodo: period || undefined,
        q: query.trim() || undefined,
      },
    });
    onCollapse?.();
  }

  const details = (
    <>
      <label className="block min-w-0 flex-1 space-y-1 px-2">
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

      <label className="block min-w-0 flex-1 space-y-1 border-t border-border/70 px-2 pt-3 md:border-l md:border-t-0 md:pt-0">
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

      <label className="block min-w-0 flex-1 space-y-1 border-t border-border/70 px-2 pt-3 md:border-l md:border-t-0 md:pt-0">
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
    </>
  );

  if (layout === "stacked") {
    return (
      <form onSubmit={onSubmit} className={cn("space-y-3", className)}>
        <div className="flex items-center gap-3 rounded-full border border-stone-200 bg-white px-4 py-3">
          <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden />
          <input
            ref={queryRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar espaços"
            aria-label="Buscar espaços"
            className="min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
          />
          <Button type="submit" size="sm" className="shrink-0 rounded-full px-4">
            Buscar
          </Button>
        </div>

        <div className="grid gap-1 rounded-2xl border border-stone-200 bg-white p-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
          {details}
          <div className="pt-2 sm:border-l sm:border-border/70 sm:pt-0 sm:pl-2">
            <Button type="submit" className="w-full sm:w-auto">
              Aplicar
            </Button>
          </div>
        </div>
      </form>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        "search-bar grid gap-3 rounded-2xl border border-border/60 bg-white p-3 shadow-[0_24px_60px_-28px_rgba(15,35,25,0.55)] md:grid-cols-[1.1fr_1fr_1fr_1fr_auto] md:items-end",
        className,
      )}
    >
      <label className="block space-y-1.5 px-2">
        <span className="flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          <Search className="size-3.5" />
          Buscar
        </span>
        <input
          ref={queryRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nome, bairro, comodidade…"
          className="w-full bg-transparent text-base font-medium text-foreground outline-none placeholder:text-muted-foreground/70"
          aria-label="Buscar espaços"
        />
      </label>
      {details}
      <Button type="submit" size="lg" className="w-full md:w-auto">
        <Search className="size-4" />
        Buscar
      </Button>
    </form>
  );
}
