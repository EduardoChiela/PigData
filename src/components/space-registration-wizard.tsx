import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  Check,
  ImagePlus,
  MapPin,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { brl } from "@/lib/format";
import type { EventType, SpaceClass } from "@/lib/mock-data";
import {
  amenityCatalog,
  draftFromGooglePlace,
  emptyDraft,
  eventTypes,
  infraAttributes,
  PHOTO_PRESETS,
  publishSpaceDraft,
  searchMockPlaces,
  spaceClasses,
  type DraftAmenity,
  type SpaceRegistrationDraft,
} from "@/lib/space-registration";
import { cn } from "@/lib/utils";

type Step =
  | "entry"
  | "google-search"
  | "basics"
  | "pigdata"
  | "infra"
  | "amenities"
  | "photos"
  | "pricing"
  | "review"
  | "done";

const STEP_ORDER: Step[] = [
  "entry",
  "google-search",
  "basics",
  "pigdata",
  "infra",
  "amenities",
  "photos",
  "pricing",
  "review",
  "done",
];

const STEP_LABEL: Partial<Record<Step, string>> = {
  entry: "Início",
  "google-search": "Google",
  basics: "Dados básicos",
  pigdata: "Dados do espaço",
  infra: "Infraestrutura",
  amenities: "Comodidades",
  photos: "Fotos",
  pricing: "Preço",
  review: "Revisão",
  done: "Publicado",
};

export function SpaceRegistrationWizard({
  ownerId,
  onDone,
}: {
  ownerId: string;
  onDone?: () => void;
}) {
  const [step, setStep] = useState<Step>("entry");
  const [draft, setDraft] = useState<SpaceRegistrationDraft>(emptyDraft);
  const [query, setQuery] = useState("");
  const [skipGoogle, setSkipGoogle] = useState(false);

  const suggestions = useMemo(() => searchMockPlaces(query), [query]);

  function patch(partial: Partial<SpaceRegistrationDraft>) {
    setDraft((d) => ({ ...d, ...partial }));
  }

  function go(next: Step) {
    setStep(next);
  }

  function startGoogle() {
    setSkipGoogle(false);
    patch({ source: "google" });
    go("google-search");
  }

  function startManual() {
    setSkipGoogle(true);
    setDraft({ ...emptyDraft(), source: "manual" });
    go("basics");
  }

  function selectPlace(placeId: string) {
    const place = suggestions.find((p) => p.placeId === placeId);
    if (!place) return;
    setDraft((d) => ({ ...d, ...draftFromGooglePlace(place) }));
    go("basics");
  }

  function publish() {
    publishSpaceDraft(ownerId, draft);
    go("done");
  }

  const progressSteps = STEP_ORDER.filter(
    (s) => s !== "entry" && s !== "done" && !(skipGoogle && s === "google-search"),
  );
  const progressIndex = progressSteps.indexOf(step);

  function toggleClass(c: SpaceClass) {
    patch({
      classes: draft.classes.includes(c)
        ? draft.classes.filter((x) => x !== c)
        : [...draft.classes, c],
    });
  }

  function toggleEvent(e: EventType) {
    patch({
      eventTypes: draft.eventTypes.includes(e)
        ? draft.eventTypes.filter((x) => x !== e)
        : [...draft.eventTypes, e],
    });
  }

  function updateAmenity(itemId: string, patchA: Partial<DraftAmenity>) {
    patch({
      amenities: draft.amenities.map((a) =>
        a.itemId === itemId ? { ...a, ...patchA } : a,
      ),
    });
  }

  function togglePhoto(url: string) {
    patch({
      photoUrls: draft.photoUrls.includes(url)
        ? draft.photoUrls.filter((u) => u !== url)
        : [...draft.photoUrls, url],
    });
  }

  const basicsOk =
    draft.name.trim().length > 1 &&
    draft.address.trim().length > 3 &&
    draft.phone.trim().length > 5;

  const pigOk =
    Number(draft.capacity) > 0 &&
    draft.classes.length > 0 &&
    draft.eventTypes.length > 0;

  const photosOk = draft.photoUrls.length >= 1;
  const priceOk = Number(draft.basePrice) > 0;

  return (
    <section className="rounded-2xl border border-border bg-white shadow-sm">
      <div className="border-b border-border px-4 py-3 md:px-5">
        <h1 className="font-display text-xl font-semibold tracking-tight md:text-2xl">
          Cadastrar espaço
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Assistido por Google ou manual · aguarda homologação ACIT ao publicar
        </p>
        {step !== "entry" && step !== "done" ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {progressSteps.map((s, i) => (
              <span
                key={s}
                className={cn(
                  "rounded-full px-2 py-0.5 text-[0.65rem] font-semibold",
                  i < progressIndex && "bg-emerald-100 text-emerald-900",
                  i === progressIndex && "bg-[var(--ink)] text-white",
                  i > progressIndex && "bg-muted text-muted-foreground",
                )}
              >
                {i + 1}. {STEP_LABEL[s]}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="p-4 md:p-5">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            {step === "entry" ? (
              <div className="mx-auto max-w-md space-y-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Cadastre seu espaço
                </p>
                <Button
                  type="button"
                  size="lg"
                  className="w-full font-semibold"
                  onClick={startGoogle}
                >
                  <Search className="size-4" />
                  Encontrar meu espaço no Google
                </Button>
                <p className="text-xs text-muted-foreground">ou</p>
                <Button
                  type="button"
                  size="lg"
                  variant="outline"
                  className="w-full font-semibold"
                  onClick={startManual}
                >
                  Cadastrar manualmente
                </Button>
              </div>
            ) : null}

            {step === "google-search" ? (
              <div className="mx-auto max-w-lg space-y-4">
                <p className="text-sm font-medium">
                  Seu espaço já está no Google?
                </p>
                <label className="flex items-center gap-2 rounded-xl border border-border px-3 py-2.5">
                  <Search className="size-4 shrink-0 text-muted-foreground" />
                  <input
                    className="min-w-0 flex-1 bg-transparent outline-none"
                    placeholder="Pesquise pelo nome ou endereço…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoFocus
                  />
                </label>
                <ul className="space-y-1">
                  {suggestions.map((p) => (
                    <li key={p.placeId}>
                      <button
                        type="button"
                        className="flex w-full flex-col rounded-xl border border-border px-3 py-2.5 text-left hover:bg-muted/50"
                        onClick={() => selectPlace(p.placeId)}
                      >
                        <span className="font-medium">{p.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {p.address}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => go("entry")}
                  >
                    <ArrowLeft className="size-4" />
                    Voltar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="font-semibold"
                    onClick={startManual}
                  >
                    Continuar com cadastro manual
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Mock de Autocomplete Places — sem chave Google neste passo.
                </p>
              </div>
            ) : null}

            {step === "basics" ? (
              <div className="mx-auto max-w-xl space-y-3">
                <p className="text-sm text-muted-foreground">
                  {draft.source === "google"
                    ? "Encontramos isso no Google. Confira se está certo (tudo editável):"
                    : "Preencha os dados básicos do espaço:"}
                </p>
                <Field
                  label="Nome"
                  value={draft.name}
                  onChange={(v) => patch({ name: v })}
                  required
                />
                <Field
                  label="Endereço"
                  value={draft.address}
                  onChange={(v) => patch({ address: v })}
                  required
                />
                <Field
                  label="Telefone"
                  value={draft.phone}
                  onChange={(v) => patch({ phone: v })}
                  required
                />
                <Field
                  label="Site"
                  value={draft.website}
                  onChange={(v) => patch({ website: v })}
                />
                <Field
                  label="Horário de funcionamento"
                  value={draft.openingHours}
                  onChange={(v) => patch({ openingHours: v })}
                />
                <div className="rounded-xl border border-dashed border-border bg-muted/30 p-3 text-sm text-muted-foreground">
                  <p className="inline-flex items-center gap-1.5 font-medium text-foreground">
                    <MapPin className="size-4" />
                    Localização (mock)
                  </p>
                  <p className="mt-1 text-xs">
                    lat {draft.lat.toFixed(4)} · lng {draft.lng.toFixed(4)}
                    {draft.googleMapsUri ? (
                      <>
                        {" "}
                        ·{" "}
                        <a
                          href={draft.googleMapsUri}
                          target="_blank"
                          rel="noreferrer"
                          className="underline"
                        >
                          Abrir no Google Maps
                        </a>
                      </>
                    ) : null}
                  </p>
                </div>
                <NavRow
                  onBack={() =>
                    go(draft.source === "google" ? "google-search" : "entry")
                  }
                  onNext={() => go("pigdata")}
                  nextDisabled={!basicsOk}
                  nextLabel="Está tudo certo, continuar"
                />
                {draft.source === "google" ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-sm"
                    onClick={() => go("google-search")}
                  >
                    Não é meu espaço, buscar de novo
                  </Button>
                ) : null}
              </div>
            ) : null}

            {step === "pigdata" ? (
              <div className="mx-auto max-w-xl space-y-4">
                <p className="text-sm font-medium">Complete os dados do seu espaço</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <NumberField
                    label="Capacidade (pessoas)"
                    value={draft.capacity}
                    onChange={(v) => patch({ capacity: v })}
                    required
                  />
                  <NumberField
                    label="Área locável (m²)"
                    value={draft.rentalAreaM2}
                    onChange={(v) => patch({ rentalAreaM2: v })}
                  />
                </div>
                <fieldset>
                  <legend className="mb-2 text-sm font-medium">
                    Classes do espaço *
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {spaceClasses.map((c) => (
                      <CheckChip
                        key={c}
                        label={c}
                        checked={draft.classes.includes(c)}
                        onToggle={() => toggleClass(c)}
                      />
                    ))}
                  </div>
                </fieldset>
                <fieldset>
                  <legend className="mb-2 text-sm font-medium">
                    Tipos de evento *
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {eventTypes.map((e) => (
                      <CheckChip
                        key={e}
                        label={e}
                        checked={draft.eventTypes.includes(e)}
                        onToggle={() => toggleEvent(e)}
                      />
                    ))}
                  </div>
                </fieldset>
                <fieldset className="space-y-2">
                  <legend className="text-sm font-medium">Modalidades</legend>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={draft.allowsFullDay}
                      onChange={(e) =>
                        patch({ allowsFullDay: e.target.checked })
                      }
                    />
                    Dia / período
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={draft.allowsHourly}
                      onChange={(e) =>
                        patch({ allowsHourly: e.target.checked })
                      }
                    />
                    Por horário
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={draft.allowsPets}
                      onChange={(e) => patch({ allowsPets: e.target.checked })}
                    />
                    Aceita pets
                  </label>
                </fieldset>
                <NavRow
                  onBack={() => go("basics")}
                  onNext={() => go("infra")}
                  nextDisabled={!pigOk}
                />
              </div>
            ) : null}

            {step === "infra" ? (
              <div className="mx-auto max-w-xl space-y-4">
                <p className="text-sm font-medium">
                  Atributos de infraestrutura básica
                </p>
                <p className="text-xs text-muted-foreground">
                  Separado do catálogo de comodidades (checklist de qualidade).
                </p>
                <div className="space-y-2">
                  {infraAttributes.map((attr) => (
                    <label
                      key={attr.id}
                      className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={draft.infra.includes(attr.id)}
                        onChange={(e) => {
                          patch({
                            infra: e.target.checked
                              ? [...draft.infra, attr.id]
                              : draft.infra.filter((x) => x !== attr.id),
                          });
                        }}
                      />
                      {attr.label}
                    </label>
                  ))}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={draft.hasWindows}
                      onChange={(e) => patch({ hasWindows: e.target.checked })}
                    />
                    Tem janelas
                  </label>
                  <NumberField
                    label="Qtd. janelas"
                    value={draft.windowCount}
                    onChange={(v) => patch({ windowCount: v })}
                  />
                  <NumberField
                    label="Tomadas 127 V"
                    value={draft.outlets127}
                    onChange={(v) => patch({ outlets127: v })}
                  />
                  <NumberField
                    label="Tomadas 220 V"
                    value={draft.outlets220}
                    onChange={(v) => patch({ outlets220: v })}
                  />
                </div>
                <NavRow onBack={() => go("pigdata")} onNext={() => go("amenities")} />
              </div>
            ) : null}

            {step === "amenities" ? (
              <div className="mx-auto max-w-xl space-y-3">
                <p className="text-sm font-medium">
                  Quais comodidades seu espaço oferece?
                </p>
                <p className="text-xs text-muted-foreground">
                  Opcional sem preço salva o cadastro, mas só entra no pedido do
                  cliente quando precificado.
                </p>
                <ul className="max-h-[28rem] space-y-2 overflow-y-auto pr-1">
                  {draft.amenities.map((a) => {
                    const meta = amenityCatalog.find((c) => c.itemId === a.itemId);
                    return (
                      <li
                        key={a.itemId}
                        className="rounded-xl border border-border p-3"
                      >
                        <label className="flex items-center gap-2 text-sm font-medium">
                          <input
                            type="checkbox"
                            checked={a.offered}
                            onChange={(e) =>
                              updateAmenity(a.itemId, {
                                offered: e.target.checked,
                              })
                            }
                          />
                          {meta?.name ?? a.itemId}
                        </label>
                        {a.offered ? (
                          <div className="mt-2 flex flex-wrap items-center gap-3 pl-6 text-sm">
                            <label className="inline-flex items-center gap-1.5">
                              <input
                                type="radio"
                                name={`inc-${a.itemId}`}
                                checked={a.included}
                                onChange={() =>
                                  updateAmenity(a.itemId, {
                                    included: true,
                                    price: 0,
                                  })
                                }
                              />
                              Inclusa
                            </label>
                            <label className="inline-flex items-center gap-1.5">
                              <input
                                type="radio"
                                name={`inc-${a.itemId}`}
                                checked={!a.included}
                                onChange={() =>
                                  updateAmenity(a.itemId, { included: false })
                                }
                              />
                              Opcional
                            </label>
                            {!a.included ? (
                              <input
                                type="number"
                                min={0}
                                placeholder="R$"
                                className="w-28 rounded-md border border-border px-2 py-1"
                                value={a.price}
                                onChange={(e) =>
                                  updateAmenity(a.itemId, {
                                    price:
                                      e.target.value === ""
                                        ? ""
                                        : Number(e.target.value),
                                  })
                                }
                              />
                            ) : null}
                          </div>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
                <NavRow onBack={() => go("infra")} onNext={() => go("photos")} />
              </div>
            ) : null}

            {step === "photos" ? (
              <div className="mx-auto max-w-xl space-y-4">
                <p className="text-sm font-medium">
                  Fotos do espaço (mín. 1) — próprias, sem importar do Google
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {PHOTO_PRESETS.map((url) => {
                    const on = draft.photoUrls.includes(url);
                    return (
                      <button
                        key={url}
                        type="button"
                        className={cn(
                          "relative aspect-[4/3] overflow-hidden rounded-xl border-2",
                          on ? "border-[var(--forest)]" : "border-transparent",
                        )}
                        onClick={() => togglePhoto(url)}
                      >
                        <img
                          src={url}
                          alt=""
                          className="size-full object-cover"
                        />
                        {on ? (
                          <span className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-[var(--forest)] text-white">
                            <Check className="size-3.5" />
                          </span>
                        ) : (
                          <span className="absolute inset-0 grid place-items-center bg-black/0 hover:bg-black/20">
                            <ImagePlus className="size-6 text-white opacity-0 hover:opacity-100" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Mock: selecione imagens de exemplo (upload real depois).
                </p>
                <NavRow
                  onBack={() => go("amenities")}
                  onNext={() => go("pricing")}
                  nextDisabled={!photosOk}
                />
              </div>
            ) : null}

            {step === "pricing" ? (
              <div className="mx-auto max-w-xl space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <NumberField
                    label="Preço base (R$)"
                    value={draft.basePrice}
                    onChange={(v) => patch({ basePrice: v })}
                    required
                  />
                  {draft.allowsHourly ? (
                    <NumberField
                      label="Preço/hora (R$)"
                      value={draft.hourlyPrice}
                      onChange={(v) => patch({ hourlyPrice: v })}
                    />
                  ) : null}
                </div>
                <label className="block space-y-1 text-sm">
                  <span className="font-medium text-muted-foreground">
                    Regras de uso
                  </span>
                  <textarea
                    className="min-h-28 w-full rounded-lg border border-border px-3 py-2"
                    value={draft.rules}
                    onChange={(e) => patch({ rules: e.target.value })}
                    placeholder="Horário limite de som, cancelamento, etc."
                  />
                </label>
                <NavRow
                  onBack={() => go("photos")}
                  onNext={() => go("review")}
                  nextDisabled={!priceOk}
                />
              </div>
            ) : null}

            {step === "review" ? (
              <div className="mx-auto max-w-xl space-y-4">
                <p className="text-sm font-medium">
                  Revise seu cadastro antes de publicar
                </p>
                <div className="rounded-xl border border-border p-4 text-sm">
                  <p className="font-display text-lg font-semibold">
                    {draft.name}
                  </p>
                  <p className="mt-1 text-muted-foreground">{draft.address}</p>
                  <p className="mt-3">
                    Capacidade: {draft.capacity} · Área:{" "}
                    {draft.rentalAreaM2 || "—"} m²
                  </p>
                  <p className="mt-1">
                    Classes: {draft.classes.join(", ") || "—"}
                  </p>
                  <p className="mt-1">
                    Eventos: {draft.eventTypes.join(", ") || "—"}
                  </p>
                  <p className="mt-1">
                    Preço base:{" "}
                    {Number(draft.basePrice)
                      ? brl(Number(draft.basePrice))
                      : "—"}
                  </p>
                  <p className="mt-1">
                    Comodidades:{" "}
                    {draft.amenities
                      .filter((a) => a.offered)
                      .map((a) => {
                        const name =
                          amenityCatalog.find((c) => c.itemId === a.itemId)
                            ?.name ?? a.itemId;
                        return a.included
                          ? `${name} (incluso)`
                          : `${name} (${a.price === "" ? "sem preço" : brl(Number(a.price))})`;
                      })
                      .join(" · ") || "Nenhuma"}
                  </p>
                  <p className="mt-1">
                    {draft.photoUrls.length} foto(s) · selo ACIT só após
                    homologação
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => go("pricing")}
                  >
                    Voltar e editar
                  </Button>
                  <Button
                    type="button"
                    className="font-semibold"
                    onClick={publish}
                  >
                    Publicar espaço
                  </Button>
                </div>
              </div>
            ) : null}

            {step === "done" ? (
              <div className="mx-auto max-w-md space-y-4 text-center">
                <div className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-100 text-emerald-800">
                  <ShieldCheck className="size-7" />
                </div>
                <h2 className="font-display text-xl font-semibold">
                  Espaço publicado
                </h2>
                <p className="text-sm text-muted-foreground">
                  Status: <strong>aguardando homologação ACIT</strong>. Ele
                  aparece em Meus anúncios; o selo e a prioridade no mapa vêm
                  depois da rede.
                </p>
                <Button
                  type="button"
                  className="font-semibold"
                  onClick={() => onDone?.()}
                >
                  Ver meus anúncios
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDraft(emptyDraft());
                    setQuery("");
                    setSkipGoogle(false);
                    go("entry");
                  }}
                >
                  Cadastrar outro
                </Button>
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block space-y-1 text-sm">
      <span className="font-medium text-muted-foreground">
        {label}
        {required ? " *" : ""}
      </span>
      <input
        className="w-full rounded-lg border border-border px-3 py-2.5"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: number | "";
  onChange: (v: number | "") => void;
  required?: boolean;
}) {
  return (
    <label className="block space-y-1 text-sm">
      <span className="font-medium text-muted-foreground">
        {label}
        {required ? " *" : ""}
      </span>
      <input
        type="number"
        min={0}
        className="w-full rounded-lg border border-border px-3 py-2.5"
        value={value}
        onChange={(e) =>
          onChange(e.target.value === "" ? "" : Number(e.target.value))
        }
      />
    </label>
  );
}

function CheckChip({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-medium transition",
        checked
          ? "border-[var(--forest)] bg-[color-mix(in_oklab,var(--leaf)_22%,white)] text-[var(--forest)]"
          : "border-border bg-white text-muted-foreground hover:bg-muted",
      )}
    >
      {checked ? "✓ " : ""}
      {label}
    </button>
  );
}

function NavRow({
  onBack,
  onNext,
  nextDisabled,
  nextLabel = "Continuar",
}: {
  onBack: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2 pt-2">
      <Button type="button" variant="outline" onClick={onBack}>
        <ArrowLeft className="size-4" />
        Voltar
      </Button>
      <Button
        type="button"
        className="font-semibold"
        disabled={nextDisabled}
        onClick={onNext}
      >
        {nextLabel}
      </Button>
    </div>
  );
}
