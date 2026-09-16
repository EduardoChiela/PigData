import { Link } from "@tanstack/react-router";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  PawPrint,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useState, type MouseEvent } from "react";
import { AmenityTags } from "@/components/amenity-tags";
import {
  getSpaceGallery,
  type ListedSpace,
} from "@/lib/mock-data";
import { brl } from "@/lib/format";
import { openSpaceInNewTab } from "@/lib/space-links";
import { cn } from "@/lib/utils";

/** Tamanho da foto no card da lista do mapa (Peerspace-like). */
const COMPACT_PHOTO_PX = 280;
/** Tamanho da foto nos cards da landing / grade ampla. */
const DEFAULT_PHOTO_PX = 320;

const statusLabel = {
  livre: "Livre",
  parcial: "Parcial",
  indisponivel: "Indisponível",
} as const;

function PhotoCarousel({
  images,
  alt,
  acitVerified,
  sizePx,
  roundedClass,
  onImageClick,
}: {
  images: string[];
  alt: string;
  acitVerified?: boolean;
  sizePx: number;
  roundedClass: string;
  onImageClick?: () => void;
}) {
  const [index, setIndex] = useState(0);
  const total = images.length;
  const current = images[index] ?? images[0];

  function stopNav(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  function go(delta: number, e: MouseEvent) {
    stopNav(e);
    if (total < 2) return;
    setIndex((i) => (i + delta + total) % total);
  }

  return (
    <div
      className={cn(
        "group/carousel relative shrink-0 overflow-hidden bg-muted",
        roundedClass,
      )}
      style={{ width: sizePx, height: sizePx, maxWidth: "100%" }}
    >
      {current ? (
        <button
          type="button"
          className="absolute inset-0 block size-full cursor-pointer"
          aria-label={alt}
          onClick={() => onImageClick?.()}
        >
          <img
            src={current}
            alt=""
            width={sizePx}
            height={sizePx}
            className="size-full object-cover transition duration-500"
            loading="lazy"
            draggable={false}
          />
        </button>
      ) : null}

      {acitVerified ? (
        <span className="pointer-events-none absolute left-2 top-2 z-[1] inline-flex items-center gap-1 rounded-md bg-[var(--forest)] px-1.5 py-0.5 text-[0.65rem] font-semibold text-white">
          <ShieldCheck className="size-3" />
          OK
        </span>
      ) : null}

      {total > 1 ? (
        <>
          <button
            type="button"
            aria-label="Foto anterior"
            className="absolute left-1.5 top-1/2 z-[2] grid size-7 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-foreground opacity-0 shadow-sm transition group-hover/carousel:opacity-100"
            onClick={(e) => go(-1, e)}
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Próxima foto"
            className="absolute right-1.5 top-1/2 z-[2] grid size-7 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-foreground opacity-0 shadow-sm transition group-hover/carousel:opacity-100"
            onClick={(e) => go(1, e)}
          >
            <ChevronRight className="size-4" />
          </button>
          <div className="absolute inset-x-0 bottom-2 z-[2] flex justify-center gap-1">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Foto ${i + 1}`}
                className={cn(
                  "size-1.5 rounded-full transition",
                  i === index ? "bg-white" : "bg-white/50",
                )}
                onClick={(e) => {
                  stopNav(e);
                  setIndex(i);
                }}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

export function SpaceCard({
  space,
  searchDate,
  searchPeriod,
  compact = false,
  onSelect,
}: {
  space: ListedSpace;
  searchDate?: string;
  searchPeriod?: string;
  compact?: boolean;
  onSelect?: (slug: string) => void;
}) {
  const gallery = getSpaceGallery(space, 5);

  const detailSearch = {
    ...(searchDate ? { data: searchDate } : {}),
    ...(searchPeriod ? { periodo: searchPeriod } : {}),
  };

  function openSpace() {
    if (onSelect) {
      onSelect(space.slug);
      return;
    }
    openSpaceInNewTab(space.slug, detailSearch);
  }

  if (compact) {
    return (
      <article className="group flex w-full max-w-[280px] flex-col overflow-hidden bg-transparent text-left">
        <PhotoCarousel
          images={gallery}
          alt={space.name}
          acitVerified={space.acitVerified}
          sizePx={COMPACT_PHOTO_PX}
          roundedClass="rounded-xl"
          onImageClick={openSpace}
        />
        <button
          type="button"
          onClick={openSpace}
          className="w-full space-y-1 px-0.5 pt-2 pb-1 text-left transition hover:opacity-80"
        >
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 text-sm font-semibold tracking-tight text-foreground">
              {space.name}
            </h3>
            <span
              className={cn(
                "shrink-0 rounded-md px-1.5 py-0.5 text-[0.65rem] font-semibold",
                space.status === "livre" && "bg-emerald-100 text-emerald-900",
                space.status === "parcial" && "bg-amber-100 text-amber-950",
                space.status === "indisponivel" && "bg-rose-100 text-rose-950",
              )}
            >
              {statusLabel[space.status]}
            </span>
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {space.region} · até {space.capacity} · {space.rentalAreaM2} m²
          </p>
          <p className="text-sm font-semibold text-foreground">
            {brl(space.basePrice)}
            <span className="ml-1 text-xs font-normal text-muted-foreground">
              base
            </span>
          </p>
        </button>
      </article>
    );
  }

  return (
    <article className="group flex h-full w-full max-w-[320px] flex-col overflow-hidden bg-transparent transition duration-300 hover:-translate-y-0.5">
      <PhotoCarousel
        images={gallery}
        alt={space.name}
        acitVerified={space.acitVerified}
        sizePx={DEFAULT_PHOTO_PX}
        roundedClass="rounded-2xl"
        onImageClick={openSpace}
      />
      <Link
        to="/espaco/$slug"
        params={{ slug: space.slug }}
        search={detailSearch}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-0 flex-1 flex-col px-0.5 pt-3"
      >
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 font-display text-base font-semibold tracking-tight text-foreground">
            {space.name}
          </h3>
          <span
            className={cn(
              "shrink-0 rounded-md px-1.5 py-0.5 text-[0.65rem] font-semibold",
              space.status === "livre" && "bg-emerald-100 text-emerald-900",
              space.status === "parcial" && "bg-amber-100 text-amber-950",
              space.status === "indisponivel" && "bg-rose-100 text-rose-950",
            )}
          >
            {statusLabel[space.status]}
          </span>
        </div>
        <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground">
          <MapPin className="size-3 shrink-0" />
          {space.region} · {space.city}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
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
        <AmenityTags
          amenities={space.amenities}
          limit={3}
          className="mt-2 max-h-8 overflow-hidden"
        />
        <div className="mt-3 flex items-baseline justify-between gap-2">
          <p className="font-display text-lg font-semibold text-foreground">
            {brl(space.basePrice)}
          </p>
          <span className="text-xs font-semibold text-primary">Ver espaço →</span>
        </div>
      </Link>
    </article>
  );
}
