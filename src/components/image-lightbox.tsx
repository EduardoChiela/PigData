import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export function ImageLightbox({
  images,
  index,
  open,
  altPrefix = "Foto",
  onClose,
  onIndexChange,
}: {
  images: string[];
  index: number;
  open: boolean;
  altPrefix?: string;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}) {
  const total = images.length;
  const safeIndex = total > 0 ? ((index % total) + total) % total : 0;
  const src = images[safeIndex];

  const go = useCallback(
    (delta: number) => {
      if (total <= 1) return;
      onIndexChange((safeIndex + delta + total) % total);
    },
    [onIndexChange, safeIndex, total],
  );

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, go]);

  if (!open || !src || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex flex-col bg-black/92 text-white"
      role="dialog"
      aria-modal="true"
      aria-label="Galeria em tela cheia"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Fechar galeria"
        onClick={onClose}
      />

      <div
        className="relative z-10 flex shrink-0 items-center justify-between gap-3 px-4 py-3 md:px-6"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm font-medium text-white/80">
          {safeIndex + 1} / {total}
        </p>
        <button
          type="button"
          className="grid size-10 place-items-center rounded-full bg-white/10 hover:bg-white/20"
          aria-label="Fechar galeria"
          onClick={onClose}
        >
          <X className="size-5" />
        </button>
      </div>

      <div
        className="relative z-10 flex min-h-0 flex-1 items-center justify-center px-4 md:px-16"
        onClick={(e) => e.stopPropagation()}
      >
        {total > 1 ? (
          <button
            type="button"
            className="absolute left-2 z-10 grid size-11 place-items-center rounded-full bg-white/10 hover:bg-white/20 md:left-6"
            aria-label="Foto anterior"
            onClick={() => go(-1)}
          >
            <ChevronLeft className="size-6" />
          </button>
        ) : null}

        <img
          src={src}
          alt={`${altPrefix} ${safeIndex + 1} de ${total}`}
          className="max-h-full max-w-full object-contain select-none"
          draggable={false}
          onClick={(e) => e.stopPropagation()}
        />

        {total > 1 ? (
          <button
            type="button"
            className="absolute right-2 z-10 grid size-11 place-items-center rounded-full bg-white/10 hover:bg-white/20 md:right-6"
            aria-label="Próxima foto"
            onClick={() => go(1)}
          >
            <ChevronRight className="size-6" />
          </button>
        ) : null}
      </div>

      {total > 1 ? (
        <div
          className="relative z-10 flex shrink-0 justify-center gap-1.5 overflow-x-auto px-4 py-3 md:py-4"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((thumb, i) => (
            <button
              key={`lb-thumb-${i}`}
              type="button"
              aria-label={`Ir para foto ${i + 1}`}
              aria-current={i === safeIndex}
              className={cn(
                "size-12 shrink-0 overflow-hidden rounded-md ring-2 transition md:size-14",
                i === safeIndex
                  ? "ring-white"
                  : "ring-transparent opacity-60 hover:opacity-100",
              )}
              onClick={() => onIndexChange(i)}
            >
              <img src={thumb} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>,
    document.body,
  );
}
