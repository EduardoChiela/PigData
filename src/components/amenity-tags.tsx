import type { AmenityOffer } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

/** Paleta fixa para tags de comodidade — reutilizável em cards, detalhe, etc. */
const TAG_PALETTE = [
  { bg: "#e8f5e9", fg: "#1b5e20", border: "#a5d6a7" },
  { bg: "#fff3e0", fg: "#e65100", border: "#ffcc80" },
  { bg: "#e3f2fd", fg: "#0d47a1", border: "#90caf9" },
  { bg: "#f3e5f5", fg: "#6a1b9a", border: "#ce93d8" },
  { bg: "#e0f7fa", fg: "#006064", border: "#80deea" },
  { bg: "#fce4ec", fg: "#880e4f", border: "#f48fb1" },
  { bg: "#fff8e1", fg: "#f57f17", border: "#ffe082" },
  { bg: "#efebe9", fg: "#4e342e", border: "#bcaaa4" },
] as const;

function paletteFor(itemId: string) {
  let hash = 0;
  for (let i = 0; i < itemId.length; i++) {
    hash = (hash * 31 + itemId.charCodeAt(i)) >>> 0;
  }
  return TAG_PALETTE[hash % TAG_PALETTE.length]!;
}

export function AmenityTags({
  amenities,
  limit = 3,
  className,
  size = "sm",
}: {
  amenities: AmenityOffer[];
  /** Quantidade máxima de tags (resto vira +N) */
  limit?: number;
  className?: string;
  size?: "sm" | "md";
}) {
  const shown = amenities.slice(0, limit);
  const rest = amenities.length - shown.length;

  if (amenities.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {shown.map((a) => {
        const tone = paletteFor(a.itemId);
        return (
          <span
            key={a.itemId}
            className={cn(
              "inline-flex max-w-full truncate rounded-md border font-medium",
              size === "sm" && "px-1.5 py-0.5 text-[0.65rem]",
              size === "md" && "px-2 py-0.5 text-xs",
            )}
            style={{
              background: tone.bg,
              color: tone.fg,
              borderColor: tone.border,
            }}
            title={
              a.included
                ? `${a.name} (incluso)`
                : `${a.name} — R$ ${a.price.toLocaleString("pt-BR")}`
            }
          >
            {a.name}
          </span>
        );
      })}
      {rest > 0 ? (
        <span
          className={cn(
            "inline-flex rounded-md border border-border bg-muted font-medium text-muted-foreground",
            size === "sm" && "px-1.5 py-0.5 text-[0.65rem]",
            size === "md" && "px-2 py-0.5 text-xs",
          )}
        >
          +{rest}
        </span>
      ) : null}
    </div>
  );
}
