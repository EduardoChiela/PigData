import { Link } from "@tanstack/react-router";
import { MapPin, PawPrint, ShieldCheck, Users } from "lucide-react";
import type { ListedSpace } from "@/lib/mock-data";
import { brl } from "@/lib/format";
import { cn } from "@/lib/utils";

const statusLabel = {
  livre: "Livre nesta data",
  parcial: "Parcial",
  indisponivel: "Indisponível",
} as const;

export function SpaceCard({
  space,
  searchDate,
  searchPeriod,
}: {
  space: ListedSpace;
  searchDate?: string;
  searchPeriod?: string;
}) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_12px_40px_-28px_rgba(20,40,30,0.55)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_48px_-24px_rgba(20,40,30,0.55)]">
      <Link
        to="/buscar"
        search={{
          data: searchDate,
          periodo: searchPeriod,
          slug: space.slug,
        }}
        className="block"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          <img
            src={space.image}
            alt=""
            className="size-full object-cover transition duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent" />
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            {space.acitVerified ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-[var(--forest)] px-2 py-1 text-[0.7rem] font-semibold text-white">
                <ShieldCheck className="size-3.5" />
                Verificado ACIT
              </span>
            ) : null}
            <span
              className={cn(
                "rounded-md px-2 py-1 text-[0.7rem] font-semibold",
                space.status === "livre" && "bg-emerald-100 text-emerald-900",
                space.status === "parcial" && "bg-amber-100 text-amber-950",
                space.status === "indisponivel" && "bg-rose-100 text-rose-950",
              )}
            >
              {statusLabel[space.status]}
            </span>
          </div>
        </div>
        <div className="space-y-3 p-4">
          <div>
            <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">
              {space.name}
            </h3>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" />
              {space.region} · {space.city} - {space.state}
            </p>
          </div>
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {space.blurb}
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Users className="size-3.5" />
              até {space.capacity}
            </span>
            <span>{space.rentalAreaM2} m²</span>
            {space.allowsPets ? (
              <span className="inline-flex items-center gap-1">
                <PawPrint className="size-3.5" />
                Pets
              </span>
            ) : null}
          </div>
          <div className="flex items-end justify-between gap-3 border-t border-border/70 pt-3">
            <div>
              <p className="text-[0.7rem] uppercase tracking-[0.12em] text-muted-foreground">
                A partir de
              </p>
              <p className="font-display text-xl font-semibold text-foreground">
                {brl(space.basePrice)}
              </p>
            </div>
            <span className="text-sm font-semibold text-primary">Ver espaço →</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
