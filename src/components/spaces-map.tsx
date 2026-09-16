import {
  APIProvider,
  AdvancedMarker,
  Map,
  RenderingType,
  useMap,
} from "@vis.gl/react-google-maps";
import { useEffect } from "react";
import { PILOT_MAP_CENTER, type ListedSpace } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const MAP_ID = "DEMO_MAP_ID";

type Props = {
  spaces: ListedSpace[];
  selectedSlug?: string;
  onSelect: (slug: string) => void;
  className?: string;
  fullBleed?: boolean;
};

function MapCamera({ selected }: { selected?: ListedSpace }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    map.setTilt(45);
    map.setHeading(35);
  }, [map]);

  useEffect(() => {
    if (!map || !selected) return;
    map.panTo({ lat: selected.lat, lng: selected.lng });
  }, [map, selected]);

  return null;
}

function priceLabel(value: number) {
  if (value >= 1000) {
    const compact = value / 1000;
    return `R$ ${compact.toLocaleString("pt-BR", {
      maximumFractionDigits: compact % 1 === 0 ? 0 : 1,
    })} mil`;
  }

  return `R$ ${value.toLocaleString("pt-BR")}`;
}

function PriceMarker({
  price,
  selected,
}: {
  price: number;
  selected: boolean;
}) {
  return (
    <div
      className={cn(
        "relative z-30 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-bold shadow-[0_8px_18px_rgba(0,0,0,0.32)] transition",
        selected
          ? "border-white bg-[var(--leaf)] text-[var(--ink)] ring-2 ring-white/80"
          : "border-white bg-white text-[var(--ink)]",
      )}
    >
      {priceLabel(price)}
    </div>
  );
}

function SpacePriceMarker({
  space,
  selected,
  onSelect,
}: {
  space: ListedSpace;
  selected: boolean;
  onSelect: (slug: string) => void;
}) {
  return (
    <AdvancedMarker
      position={{ lat: space.lat, lng: space.lng }}
      title={space.name}
      zIndex={selected ? 40 : 5}
      onClick={() => onSelect(space.slug)}
    >
      <div
        className={cn(
          "flex flex-col items-center transition-transform",
          selected && "scale-110",
        )}
      >
        <PriceMarker price={space.basePrice} selected={selected} />
      </div>
    </AdvancedMarker>
  );
}

function GoogleTiltedMap({ spaces, selectedSlug, onSelect }: Props) {
  const selected = spaces.find((s) => s.slug === selectedSlug) ?? spaces[0];

  return (
    <Map
      defaultCenter={PILOT_MAP_CENTER}
      defaultZoom={14}
      defaultTilt={45}
      defaultHeading={35}
      mapId={MAP_ID}
      mapTypeId="roadmap"
      renderingType={RenderingType.VECTOR}
      gestureHandling="greedy"
      disableDefaultUI={false}
      mapTypeControl={false}
      streetViewControl={false}
      fullscreenControl={false}
      className="size-full"
    >
      <MapCamera selected={selected} />
      {spaces.map((space) => (
        <SpacePriceMarker
          key={space.slug}
          space={space}
          selected={space.slug === selected?.slug}
          onSelect={onSelect}
        />
      ))}
    </Map>
  );
}

function MockIsometricMap({ spaces, selectedSlug, onSelect }: Props) {
  if (spaces.length === 0) {
    return (
      <div className="grid size-full place-items-center bg-[var(--forest-deep)] text-sm text-white/70">
        Nenhum espaco para exibir no mapa
      </div>
    );
  }

  const lats = spaces.map((s) => s.lat);
  const lngs = spaces.map((s) => s.lng);
  const minLat = Math.min(...lats, PILOT_MAP_CENTER.lat - 0.02);
  const maxLat = Math.max(...lats, PILOT_MAP_CENTER.lat + 0.02);
  const minLng = Math.min(...lngs, PILOT_MAP_CENTER.lng - 0.02);
  const maxLng = Math.max(...lngs, PILOT_MAP_CENTER.lng + 0.02);

  function toPercent(space: ListedSpace) {
    const x = ((space.lng - minLng) / (maxLng - minLng || 1)) * 100;
    const y = (1 - (space.lat - minLat) / (maxLat - minLat || 1)) * 100;
    return {
      left: `${Math.min(92, Math.max(8, x))}%`,
      top: `${Math.min(90, Math.max(10, y))}%`,
    };
  }

  return (
    <div
      className="relative size-full overflow-hidden bg-[linear-gradient(145deg,#1a3d2a_0%,#2a5a3c_40%,#1f4a32_100%)]"
      aria-label="Mapa dos espacos"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "48px 28px",
          transform: "perspective(600px) rotateX(48deg) scale(1.35)",
          transformOrigin: "center 70%",
        }}
      />
      {spaces.map((space) => {
        const pos = toPercent(space);
        const selected = space.slug === selectedSlug;
        return (
          <button
            key={space.slug}
            type="button"
            className={cn(
              "absolute z-20 -translate-x-1/2 -translate-y-1/2 transition",
              selected && "z-40 scale-110",
            )}
            style={{ left: pos.left, top: pos.top }}
            title={space.name}
            aria-label={space.name}
            aria-pressed={selected}
            onClick={() => onSelect(space.slug)}
          >
            <PriceMarker price={space.basePrice} selected={!!selected} />
          </button>
        );
      })}
    </div>
  );
}

export function SpacesMap(props: Props) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  const hasKey = Boolean(apiKey && apiKey.trim().length > 0);

  return (
    <section
      className={cn(
        "relative h-full min-h-[22rem] overflow-hidden bg-muted",
        !props.fullBleed && "rounded-2xl border border-border",
        props.className,
      )}
    >
      {hasKey ? (
        <APIProvider apiKey={apiKey!} libraries={["marker"]}>
          <GoogleTiltedMap {...props} />
        </APIProvider>
      ) : (
        <MockIsometricMap {...props} />
      )}
    </section>
  );
}
