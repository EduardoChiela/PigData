import {
  APIProvider,
  Map,
  AdvancedMarker,
  RenderingType,
  useMap,
} from "@vis.gl/react-google-maps";
import { useEffect } from "react";
import { PILOT_MAP_CENTER, type ListedSpace } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

/** Map ID vetorial — necessário para tilt/heading e AdvancedMarker */
const MAP_ID = "DEMO_MAP_ID";

const PIN = {
  acit: { fill: "#c8e87a", stroke: "#1a4d32", glyph: "#0f2e1e" },
  other: { fill: "#9ca3af", stroke: "#374151", glyph: "#ffffff" },
} as const;

type Props = {
  spaces: ListedSpace[];
  selectedSlug?: string;
  onSelect: (slug: string) => void;
  className?: string;
  fullBleed?: boolean;
  legendClassName?: string;
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

/** Marcador estilo pin do Google Maps (teardrop) */
function MapPinGlyph({
  acit,
  selected,
}: {
  acit: boolean;
  selected: boolean;
}) {
  const tone = acit ? PIN.acit : PIN.other;
  const scale = selected ? 1.2 : acit ? 1.12 : 1;
  const w = 36 * scale;
  const h = 48 * scale;

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 36 48"
      className="drop-shadow-md"
      aria-hidden
    >
      <path
        d="M18 1.5C9.44 1.5 2.5 8.44 2.5 17c0 11.25 15.5 28.5 15.5 28.5S33.5 28.25 33.5 17C33.5 8.44 26.56 1.5 18 1.5z"
        fill={tone.fill}
        stroke={tone.stroke}
        strokeWidth={acit ? 2.75 : 2}
      />
      <circle cx="18" cy="17" r="6.5" fill={tone.glyph} opacity={0.92} />
      {acit ? (
        <circle
          cx="18"
          cy="17"
          r="3.2"
          fill={tone.fill}
          stroke={tone.stroke}
          strokeWidth="1.2"
        />
      ) : null}
    </svg>
  );
}

function SpacePinMarker({
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
      zIndex={selected ? 40 : space.acitVerified ? 20 : 5}
      onClick={() => onSelect(space.slug)}
    >
      <div
        className={cn(
          "-mb-1 flex flex-col items-center transition-transform",
          selected && "scale-110",
        )}
      >
        <MapPinGlyph acit={space.acitVerified} selected={selected} />
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
        <SpacePinMarker
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
        Nenhum espaço para exibir no mapa
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
      aria-label="Mapa mock isométrico dos espaços"
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
      <div className="absolute left-3 top-3 z-10 rounded-md bg-black/45 px-2 py-1 text-[0.65rem] font-medium text-white/85 backdrop-blur">
        Mapa mock · defina VITE_GOOGLE_MAPS_API_KEY para o Google Maps
      </div>
      {spaces.map((space) => {
        const pos = toPercent(space);
        const selected = space.slug === selectedSlug;
        return (
          <button
            key={space.slug}
            type="button"
            className={cn(
              "absolute z-[1] -translate-x-1/2 -translate-y-full transition",
              selected && "z-20 scale-125",
            )}
            style={{ left: pos.left, top: pos.top }}
            title={space.name}
            aria-label={space.name}
            aria-pressed={selected}
            onClick={() => onSelect(space.slug)}
          >
            <MapPinGlyph acit={space.acitVerified} selected={!!selected} />
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

      <div
        className={cn(
          "pointer-events-none absolute bottom-3 z-10 flex flex-wrap gap-2",
          !props.legendClassName && "left-3",
          props.legendClassName,
        )}
      >
        <span className="rounded-md bg-black/55 px-2 py-1 text-[0.65rem] font-medium text-white backdrop-blur">
          Verde claro = ACIT · cinza = cadastrado
        </span>
      </div>
    </section>
  );
}
