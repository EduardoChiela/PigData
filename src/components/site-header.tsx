import { Link } from "@tanstack/react-router";
import { CalendarSearch, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { APP_NAME, PILOT_CITY_LABEL } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[color-mix(in_oklab,var(--forest)_92%,black)] text-white backdrop-blur">
      <div className="page-shell flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5 font-bold tracking-tight">
          <span className="grid size-9 place-items-center rounded-lg bg-[var(--leaf)] text-[var(--forest-ink)]">
            <CalendarSearch className="size-5" />
          </span>
          <span className="leading-tight">
            <span className="block text-[0.95rem]">{APP_NAME}</span>
            <span className="block text-[0.7rem] font-medium text-white/65">
              {PILOT_CITY_LABEL}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link
            to="/buscar"
            className="rounded-md px-3 py-2 text-sm font-medium text-white/85 hover:bg-white/10 hover:text-white"
          >
            Buscar
          </Link>
          <Link
            to="/buscar"
            search={{ acit: "1" }}
            className="rounded-md px-3 py-2 text-sm font-medium text-white/85 hover:bg-white/10 hover:text-white"
          >
            Verificados ACIT
          </Link>
          <Button
            asChild
            size="sm"
            className="ml-2 bg-[var(--leaf)] text-[var(--forest-ink)] hover:bg-[var(--leaf-bright)]"
          >
            <Link to="/buscar">Ver disponibilidade</Link>
          </Button>
        </nav>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10 md:hidden"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>

      <div
        className={cn(
          "border-t border-white/10 md:hidden",
          open ? "block" : "hidden",
        )}
      >
        <div className="page-shell flex flex-col gap-1 py-3">
          <Link
            to="/buscar"
            className="rounded-md px-3 py-2.5 text-sm font-medium text-white/90 hover:bg-white/10"
            onClick={() => setOpen(false)}
          >
            Buscar espaços
          </Link>
          <Link
            to="/buscar"
            search={{ acit: "1" }}
            className="rounded-md px-3 py-2.5 text-sm font-medium text-white/90 hover:bg-white/10"
            onClick={() => setOpen(false)}
          >
            Verificados ACIT
          </Link>
        </div>
      </div>
    </header>
  );
}
