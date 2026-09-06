import { AnimatePresence, motion } from "motion/react";
import {
  MapPin,
  PawPrint,
  Plug,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { AmenityTags } from "@/components/amenity-tags";
import { BookingRequestFlow } from "@/components/booking-request-flow";
import { Button } from "@/components/ui/button";
import { brl } from "@/lib/format";
import {
  getSpaceGallery,
  type Availability,
  type ListedSpace,
  type Space,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const statusLabel = {
  livre: "Livre nesta data",
  parcial: "Parcial nesta data",
  indisponivel: "Indisponível nesta data",
} as const;

export function SpaceDetailPanel({
  space,
  open,
  listOpen,
  onClose,
  initialDate,
  initialPeriod,
}: {
  space: (Space | ListedSpace) | null;
  open: boolean;
  listOpen: boolean;
  onClose: () => void;
  initialDate?: string;
  initialPeriod?: string;
}) {
  const [step, setStep] = useState<"detail" | "booking">("detail");

  useEffect(() => {
    if (!open) {
      setStep("detail");
      return;
    }
    setStep("detail");
  }, [open, space?.slug]);

  const status: Availability | undefined =
    space && "status" in space ? space.status : undefined;
  const gallery = space ? getSpaceGallery(space) : [];
  const included = space?.amenities.filter((a) => a.included) ?? [];
  const optional = space?.amenities.filter((a) => !a.included) ?? [];
  const expanded = step === "booking";

  return (
    <AnimatePresence>
      {open && space ? (
        <motion.aside
          key={space.slug}
          role="dialog"
          aria-modal={expanded}
          aria-label={
            expanded
              ? `Solicitar ${space.name}`
              : `Detalhes de ${space.name}`
          }
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 36 }}
          transition={{ type: "spring", stiffness: 340, damping: 32 }}
          className={cn(
            "z-40 flex flex-col overflow-hidden border border-stone-200 bg-white shadow-2xl",
            expanded
              ? "fixed inset-x-0 bottom-0 top-[3.75rem] rounded-none"
              : cn(
                  "absolute bottom-[42dvh] left-0 right-0 top-0 rounded-none md:top-20 md:bottom-4 md:rounded-2xl",
                  listOpen
                    ? "md:left-[calc(26rem+1.25rem)] md:w-[calc((100%-26rem-2.25rem)*0.8)]"
                    : "md:left-4 md:w-[calc((100%-2rem)*0.8)]",
                ),
          )}
        >
          <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border/70 px-4 py-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {space.acitVerified ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-[var(--forest)] px-2 py-0.5 text-[0.7rem] font-semibold text-white">
                    <ShieldCheck className="size-3.5" />
                    Verificado ACIT
                  </span>
                ) : null}
                {status && !expanded ? (
                  <span
                    className={cn(
                      "rounded-md px-2 py-0.5 text-[0.7rem] font-semibold",
                      status === "livre" && "bg-emerald-100 text-emerald-900",
                      status === "parcial" && "bg-amber-100 text-amber-950",
                      status === "indisponivel" && "bg-rose-100 text-rose-950",
                    )}
                  >
                    {statusLabel[status]}
                  </span>
                ) : null}
                {expanded ? (
                  <span className="rounded-md bg-muted px-2 py-0.5 text-[0.7rem] font-semibold text-muted-foreground">
                    Pedido
                  </span>
                ) : null}
              </div>
              <h2 className="mt-1 truncate font-display text-xl font-semibold tracking-tight md:text-2xl">
                {space.name}
              </h2>
              <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-muted-foreground">
                <MapPin className="size-3.5 shrink-0" />
                {space.address}
              </p>
            </div>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="shrink-0"
              aria-label="Fechar"
              onClick={onClose}
            >
              <X className="size-5" />
            </Button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <AnimatePresence mode="wait" initial={false}>
              {expanded ? (
                <motion.div
                  key="booking"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <BookingRequestFlow
                    space={space}
                    initialDate={initialDate}
                    initialPeriod={initialPeriod}
                    onBackToProfile={() => setStep("detail")}
                    onDone={onClose}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="detail"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="grid grid-cols-2 gap-1.5 p-3 md:grid-cols-4 md:gap-2 md:p-4">
                    {gallery.map((src, i) => (
                      <div
                        key={`${space.slug}-g-${i}`}
                        className={cn(
                          "overflow-hidden bg-muted",
                          i === 0
                            ? "col-span-2 row-span-2 aspect-[4/3] rounded-xl md:rounded-2xl"
                            : "aspect-[4/3] rounded-lg md:rounded-xl",
                          i > 4 && "hidden md:block",
                        )}
                      >
                        <img
                          src={src}
                          alt=""
                          className="size-full object-cover"
                          loading={i === 0 ? "eager" : "lazy"}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-6 px-4 pb-28 md:px-5">
                    <section>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {space.blurb}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/40 px-2 py-1">
                          <Users className="size-3.5" />
                          até {space.capacity} pessoas
                        </span>
                        <span className="rounded-md border border-border bg-muted/40 px-2 py-1">
                          {space.rentalAreaM2} m² locáveis
                        </span>
                        {space.allowsPets ? (
                          <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/40 px-2 py-1">
                            <PawPrint className="size-3.5" />
                            Aceita pets
                          </span>
                        ) : (
                          <span className="rounded-md border border-border bg-muted/40 px-2 py-1">
                            Pets não
                          </span>
                        )}
                        {space.hasWindows ? (
                          <span className="rounded-md border border-border bg-muted/40 px-2 py-1">
                            {space.windowCount} janelas
                          </span>
                        ) : null}
                      </div>
                    </section>

                    <section>
                      <h3 className="text-sm font-semibold text-foreground">
                        Classes e eventos
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {space.classes.join(" · ")}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {space.eventTypes.map((t) => (
                          <span
                            key={t}
                            className="rounded-md border border-border px-2 py-0.5 text-xs font-medium"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </section>

                    <section>
                      <h3 className="text-sm font-semibold text-foreground">
                        Infraestrutura
                      </h3>
                      <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                        {space.outlets.map((o) => (
                          <li key={o.voltage} className="flex items-center gap-2">
                            <Plug className="size-3.5 shrink-0" />
                            {o.quantity} tomadas {o.voltage} V
                          </li>
                        ))}
                        <li>
                          Locação:{" "}
                          {[
                            space.allowsFullDayRental ? "dia/período" : null,
                            space.allowsHourlyRental ? "por horário" : null,
                          ]
                            .filter(Boolean)
                            .join(" e ")}
                          {space.hourlyPrice
                            ? ` · ${brl(space.hourlyPrice)}/h`
                            : null}
                        </li>
                      </ul>
                    </section>

                    {included.length > 0 ? (
                      <section>
                        <h3 className="text-sm font-semibold text-foreground">
                          Comodidades inclusas
                        </h3>
                        <AmenityTags
                          amenities={included}
                          limit={included.length}
                          size="md"
                          className="mt-2"
                        />
                      </section>
                    ) : null}

                    {optional.length > 0 ? (
                      <section>
                        <h3 className="text-sm font-semibold text-foreground">
                          Comodidades opcionais
                        </h3>
                        <ul className="mt-2 space-y-2">
                          {optional.map((a) => (
                            <li
                              key={a.itemId}
                              className="flex items-center justify-between gap-3 border-b border-border/50 py-1.5 text-sm last:border-0"
                            >
                              <span>{a.name}</span>
                              <span className="shrink-0 font-medium tabular-nums">
                                {brl(a.price)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </section>
                    ) : null}

                    <section>
                      <h3 className="text-sm font-semibold text-foreground">
                        Regras de uso
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {space.rules}
                      </p>
                    </section>

                    <section className="rounded-xl border border-border bg-muted/30 p-4">
                      <p className="text-[0.7rem] uppercase tracking-[0.12em] text-muted-foreground">
                        Preço base
                      </p>
                      <p className="font-display text-2xl font-semibold">
                        {brl(space.basePrice)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Cotação inicial · pagamento só após aprovação do pedido
                      </p>
                    </section>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {!expanded ? (
            <div className="absolute inset-x-0 bottom-0 border-t border-border/70 bg-white/95 p-3 backdrop-blur-sm md:p-4">
              <Button
                type="button"
                className="w-full font-semibold"
                size="lg"
                onClick={() => setStep("booking")}
              >
                Escolher data e solicitar
              </Button>
            </div>
          ) : null}
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
