import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  MapPin,
  PawPrint,
  Plug,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useState } from "react";
import { AmenityTags } from "@/components/amenity-tags";
import { BookingRequestFlow } from "@/components/booking-request-flow";
import { ImageLightbox } from "@/components/image-lightbox";
import { Button } from "@/components/ui/button";
import { brl } from "@/lib/format";
import {
  getSpaceGallery,
  withAvailability,
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

export type SpaceDetailSearch = {
  data?: string;
  dataFim?: string;
  periodo?: string;
  horaInicio?: string;
  horaFim?: string;
  evento?: string;
  capacidade?: string;
};

export function SpaceDetailPage({
  space,
  search,
}: {
  space: Space | ListedSpace;
  search: SpaceDetailSearch;
}) {
  const navigate = useNavigate();
  const [step, setStep] = useState<"detail" | "booking">("detail");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const listed: ListedSpace =
    "status" in space
      ? space
      : withAvailability(space, search.data);

  const status: Availability = listed.status;
  const gallery = getSpaceGallery(listed);
  const included = listed.amenities.filter((a) => a.included);
  const optional = listed.amenities.filter((a) => !a.included);
  const guests = search.capacidade ? Number(search.capacidade) : undefined;

  return (
    <div className="min-h-[calc(100dvh-3.75rem)] bg-white">
      <div className="sticky top-[3.75rem] z-30 border-b border-border/70 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 md:px-6">
          <Button asChild type="button" size="sm" variant="ghost">
            <Link
              to="/"
              search={{
                ...(search.data ? { data: search.data } : {}),
                ...(search.dataFim ? { dataFim: search.dataFim } : {}),
                ...(search.periodo ? { periodo: search.periodo } : {}),
                ...(search.horaInicio
                  ? { horaInicio: search.horaInicio }
                  : {}),
                ...(search.horaFim ? { horaFim: search.horaFim } : {}),
                ...(search.evento ? { evento: search.evento } : {}),
                ...(search.capacidade
                  ? { capacidade: search.capacidade }
                  : {}),
              }}
            >
              <ArrowLeft className="size-4" />
              Voltar ao mapa
            </Link>
          </Button>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-base font-semibold md:text-lg">
              {listed.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {listed.address}
            </p>
          </div>
          {step === "booking" ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setStep("detail")}
            >
              Ver perfil
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-4 md:px-6 md:py-6">
        {step === "booking" ? (
          <BookingRequestFlow
            space={listed}
            {...(search.data ? { initialDate: search.data } : {})}
            {...(search.dataFim ? { initialEndDate: search.dataFim } : {})}
            {...(search.periodo ? { initialPeriod: search.periodo } : {})}
            {...(search.horaInicio
              ? { initialStartTime: search.horaInicio }
              : {})}
            {...(search.horaFim ? { initialEndTime: search.horaFim } : {})}
            {...(search.evento ? { initialEventType: search.evento } : {})}
            {...(guests && !Number.isNaN(guests)
              ? { initialGuests: guests }
              : {})}
            onBackToProfile={() => setStep("detail")}
            onDone={() => {
              void navigate({ to: "/minhas-reservas" });
            }}
          />
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {listed.acitVerified ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-[var(--forest)] px-2 py-0.5 text-[0.7rem] font-semibold text-white">
                  <ShieldCheck className="size-3.5" />
                  Verificado
                </span>
              ) : null}
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
            </div>

            <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
              {listed.name}
            </h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" />
              {listed.address}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
              {gallery.map((src, i) => (
                <button
                  key={`${listed.slug}-g-${i}`}
                  type="button"
                  onClick={() => setLightboxIndex(i)}
                  className={cn(
                    "group relative overflow-hidden bg-muted text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--leaf)]",
                    i === 0
                      ? "col-span-2 row-span-2 aspect-[4/3] rounded-2xl"
                      : "aspect-[4/3] rounded-xl",
                    i > 4 && "hidden md:block",
                  )}
                  aria-label={`Abrir foto ${i + 1} de ${gallery.length}`}
                >
                  <img
                    src={src}
                    alt=""
                    className="size-full object-cover transition duration-300 group-hover:scale-[1.03]"
                    loading={i === 0 ? "eager" : "lazy"}
                  />
                </button>
              ))}
            </div>

            <ImageLightbox
              images={gallery}
              index={lightboxIndex ?? 0}
              open={lightboxIndex != null}
              altPrefix={listed.name}
              onClose={() => setLightboxIndex(null)}
              onIndexChange={setLightboxIndex}
            />

            <div className="mt-8 grid gap-10 pb-28 lg:grid-cols-[1fr_20rem]">
              <div className="space-y-8">
                <section>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {listed.blurb}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 px-2.5 py-1">
                      <Users className="size-3.5" />
                      até {listed.capacity} pessoas
                    </span>
                    <span className="rounded-full border border-border bg-muted/40 px-2.5 py-1">
                      {listed.rentalAreaM2} m² locáveis
                    </span>
                    {listed.allowsPets ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 px-2.5 py-1">
                        <PawPrint className="size-3.5" />
                        Aceita pets
                      </span>
                    ) : (
                      <span className="rounded-full border border-border bg-muted/40 px-2.5 py-1">
                        Pets não
                      </span>
                    )}
                    {listed.hasWindows ? (
                      <span className="rounded-full border border-border bg-muted/40 px-2.5 py-1">
                        {listed.windowCount} janelas
                      </span>
                    ) : null}
                  </div>
                </section>

                <section>
                  <h2 className="text-sm font-semibold text-foreground">
                    Classes e eventos
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {listed.classes.join(" · ")}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {listed.eventTypes.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-border px-2.5 py-0.5 text-xs font-medium"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="text-sm font-semibold text-foreground">
                    Infraestrutura
                  </h2>
                  <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                    {listed.outlets.map((o) => (
                      <li key={o.voltage} className="flex items-center gap-2">
                        <Plug className="size-3.5 shrink-0" />
                        {o.quantity} tomadas {o.voltage} V
                      </li>
                    ))}
                    <li>
                      Locação:{" "}
                      {[
                        listed.allowsFullDayRental ? "dia/período" : null,
                        listed.allowsHourlyRental ? "por horário" : null,
                      ]
                        .filter(Boolean)
                        .join(" e ")}
                      {listed.hourlyPrice
                        ? ` · ${brl(listed.hourlyPrice)}/h`
                        : null}
                    </li>
                  </ul>
                </section>

                {included.length > 0 ? (
                  <section>
                    <h2 className="text-sm font-semibold text-foreground">
                      Comodidades inclusas
                    </h2>
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
                    <h2 className="text-sm font-semibold text-foreground">
                      Comodidades opcionais
                    </h2>
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
                  <h2 className="text-sm font-semibold text-foreground">
                    Regras de uso
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {listed.rules}
                  </p>
                </section>
              </div>

              <aside className="h-fit rounded-2xl border border-border bg-muted/20 p-5 lg:sticky lg:top-[7.5rem]">
                <p className="text-[0.7rem] uppercase tracking-[0.12em] text-muted-foreground">
                  Preço base
                </p>
                <p className="font-display text-3xl font-semibold">
                  {brl(listed.basePrice)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Cotação inicial · pagamento só após aprovação
                </p>
                <Button
                  type="button"
                  className="mt-4 w-full font-semibold"
                  size="lg"
                  onClick={() => setStep("booking")}
                >
                  Escolher data e solicitar
                </Button>
              </aside>
            </div>
          </>
        )}
      </div>

      {step === "detail" ? (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border/70 bg-white/95 p-3 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-6xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">A partir de</p>
              <p className="font-display text-lg font-semibold">
                {brl(listed.basePrice)}
              </p>
            </div>
            <Button
              type="button"
              className="font-semibold"
              onClick={() => setStep("booking")}
            >
              Solicitar
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
