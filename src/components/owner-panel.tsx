import { Link, getRouteApi } from "@tanstack/react-router";
import {
  CalendarDays,
  Check,
  CircleHelp,
  ClipboardList,
  Home,
  LayoutDashboard,
  Plus,
  Settings2,
  ShieldCheck,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { OwnerAgenda } from "@/components/owner-agenda";
import { AgendaSummaryStrip, OwnerDashboard } from "@/components/owner-dashboard";
import { SpaceRegistrationWizard } from "@/components/space-registration-wizard";
import { Button } from "@/components/ui/button";
import { formatDateBR, brl } from "@/lib/format";
import { getSpaceBySlug, periodLabel, type Space } from "@/lib/mock-data";
import type { MockUser } from "@/lib/mock-session";
import {
  acceptOwnerRequest,
  confirmOwnerRequestPayment,
  listActionableOwnerRequests,
  listPendingOwnerRequests,
  refuseOwnerRequest,
  resetOwnerRequestsSeed,
  STATUS_LABEL_CLIENT,
  type OwnerReservationRequest,
} from "@/lib/owner-panel-data";
import {
  getBookingSettings,
  saveBookingSettings,
  type BookingMode,
  type SpaceBookingSettings,
} from "@/lib/reservations";
import {
  listOwnerListings,
  resolveSpaceDisplayName,
  type PublishedSpaceListing,
} from "@/lib/space-registration";
import { cn } from "@/lib/utils";

type TabId =
  | "agenda"
  | "solicitacoes"
  | "dashboard"
  | "anuncios"
  | "cadastrar"
  | "regras";

const painelRoute = getRouteApi("/painel");

export function OwnerPanel({ user }: { user: MockUser }) {
  const search = painelRoute.useSearch();
  const spaceSlugs = useMemo(
    () => user.spaceSlugs ?? ["vila-verde"],
    [user.spaceSlugs],
  );
  const ownedSpaces = useMemo(
    () =>
      spaceSlugs
        .map((s) => getSpaceBySlug(s))
        .filter((s): s is Space => Boolean(s)),
    [spaceSlugs],
  );

  const [tab, setTab] = useState<TabId>("agenda");
  const [activeSlug, setActiveSlug] = useState(
    () => ownedSpaces[0]?.slug ?? spaceSlugs[0]!,
  );
  const [tick, setTick] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const refresh = () => setTick((n) => n + 1);

  useEffect(() => {
    if (search.aba === "solicitacoes") {
      setTab("solicitacoes");
    }
  }, [search.aba]);

  const published = useMemo(
    () => listOwnerListings(user.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user.id, tick],
  );

  // Ler localStorage só no cliente (evita badge vazio por SSR / storage stale).
  useEffect(() => {
    setPendingCount(listPendingOwnerRequests(spaceSlugs).length);
  }, [spaceSlugs, tick]);

  const activeSpace =
    ownedSpaces.find((s) => s.slug === activeSlug) ?? ownedSpaces[0];

  const nav = [
    { id: "agenda" as const, label: "Agenda", icon: CalendarDays },
    {
      id: "solicitacoes" as const,
      label: "Solicitações",
      icon: ClipboardList,
      badge: pendingCount,
    },
    { id: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
    { id: "anuncios" as const, label: "Meus anúncios", icon: Home },
    { id: "cadastrar" as const, label: "Cadastrar espaço", icon: Plus },
    { id: "regras" as const, label: "Regras de reserva", icon: Settings2 },
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 md:flex-row md:px-6">
      <aside className="shrink-0 md:w-56">
        <div className="rounded-2xl border border-border bg-white p-3 shadow-sm">
          <div className="mb-3 flex items-center gap-2 px-1">
            <span className="grid size-9 place-items-center rounded-full bg-[var(--leaf)] text-xs font-bold text-[var(--ink)]">
              {user.initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user.name}</p>
              <p className="truncate text-[0.65rem] text-muted-foreground">
                {user.roleLabel}
              </p>
            </div>
          </div>
          <nav className="space-y-1">
            {nav.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition",
                    tab === item.id
                      ? "bg-[var(--ink)] text-white"
                      : "text-foreground hover:bg-muted",
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge != null && item.badge > 0 ? (
                    <span
                      className={cn(
                        "grid min-w-5 place-items-center rounded-full px-1.5 text-[0.65rem] font-bold",
                        tab === item.id
                          ? "bg-white/20 text-white"
                          : "bg-[var(--warm)] text-white",
                      )}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
          <Link
            to="/ajuda"
            className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <CircleHelp className="size-4 shrink-0" />
            Ajuda
          </Link>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {tab === "agenda" && activeSpace ? (
          <div className="space-y-3">
            <AgendaSummaryStrip
              spaceSlugs={spaceSlugs}
              tick={tick}
              onOpenDashboard={() => setTab("dashboard")}
            />
            <OwnerAgenda
              space={activeSpace}
              spaces={ownedSpaces}
              onSelectSpace={setActiveSlug}
              tick={tick}
              onRefresh={refresh}
            />
          </div>
        ) : null}
        {tab === "solicitacoes" ? (
          <OwnerRequests
            spaceSlugs={spaceSlugs}
            ownerId={user.id}
            highlightId={search.destaque}
            onRefresh={refresh}
          />
        ) : null}
        {tab === "dashboard" ? (
          <OwnerDashboard spaceSlugs={spaceSlugs} tick={tick} />
        ) : null}
        {tab === "anuncios" ? (
          <OwnerListings
            spaces={ownedSpaces}
            published={published}
            onEdit={() => setTab("cadastrar")}
            onNew={() => setTab("cadastrar")}
          />
        ) : null}
        {tab === "cadastrar" ? (
          <SpaceRegistrationWizard
            ownerId={user.id}
            onDone={() => {
              refresh();
              setTab("anuncios");
            }}
          />
        ) : null}
        {tab === "regras" && activeSpace ? (
          <BookingRulesPanel
            space={activeSpace}
            spaces={ownedSpaces}
            onSelectSpace={setActiveSlug}
          />
        ) : null}
      </div>
    </div>
  );
}

function OwnerRequests({
  spaceSlugs,
  ownerId,
  highlightId,
  onRefresh,
}: {
  spaceSlugs: string[];
  ownerId: string;
  highlightId?: string;
  onRefresh: () => void;
}) {
  const [items, setItems] = useState<OwnerReservationRequest[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [activeHighlightId, setActiveHighlightId] = useState<string | null>(
    null,
  );
  const cardRefs = useRef<Record<string, HTMLLIElement | null>>({});
  const spaceKey = spaceSlugs.join("|");

  function reload() {
    setItems(listActionableOwnerRequests(spaceSlugs));
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spaceKey]);

  useEffect(() => {
    if (!highlightId) return;
    setActiveHighlightId(highlightId);
    window.setTimeout(() => {
      cardRefs.current[highlightId]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 80);
    const t = window.setTimeout(() => setActiveHighlightId(null), 2600);
    return () => window.clearTimeout(t);
  }, [highlightId, items.length]);

  function onAccept(req: OwnerReservationRequest) {
    const updated = acceptOwnerRequest(req.id, ownerId);
    reload();
    onRefresh();
    const msg = updated
      ? `Solicitação de ${req.clientName} aprovada — aguardando pagamento (hold no calendário).`
      : "Não foi possível aprovar a solicitação.";
    setFeedback(msg);
    toast.success(msg);
  }

  function onConfirmPayment(req: OwnerReservationRequest) {
    const updated = confirmOwnerRequestPayment(req.id, ownerId);
    reload();
    onRefresh();
    const msg = updated
      ? `Reserva de ${req.clientName} confirmada. Concorrentes foram para a fila.`
      : "Não foi possível confirmar (possível conflito).";
    setFeedback(msg);
    if (updated) toast.success(msg);
    else toast.error(msg);
  }

  function onRefuse(req: OwnerReservationRequest) {
    const updated = refuseOwnerRequest(req.id, ownerId);
    reload();
    onRefresh();
    const msg = updated
      ? `Solicitação de ${req.clientName} recusada.`
      : "Não foi possível recusar a solicitação.";
    setFeedback(msg);
    toast.message(msg);
  }

  const pending = items.filter(
    (r) =>
      r.reservationStatus === "pending" ||
      r.reservationStatus === "requested" ||
      r.status === "pendente",
  );
  const awaiting = items.filter(
    (r) => r.reservationStatus === "awaiting_payment",
  );
  const waitlisted = items.filter(
    (r) => r.reservationStatus === "waitlisted",
  );

  return (
    <section className="space-y-4">
      <div>
        <h1 className="font-display text-xl font-semibold tracking-tight md:text-2xl">
          Solicitações ({pending.length} pendentes)
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Várias solicitações podem disputar o mesmo período. Só a confirmação
          bloqueia de forma definitiva.
        </p>
      </div>

      {feedback ? (
        <p
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-950"
          role="status"
        >
          {feedback}
        </p>
      ) : null}

      {items.length === 0 ? (
        <div className="space-y-3 rounded-2xl border border-dashed border-border bg-white p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhuma solicitação no momento.
          </p>
          <Button
            type="button"
            variant="outline"
            className="font-semibold"
            onClick={() => {
              resetOwnerRequestsSeed();
              reload();
              onRefresh();
              setFeedback("Solicitações demo restauradas.");
            }}
          >
            Restaurar solicitações demo
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {[...pending, ...awaiting, ...waitlisted].map((req) => {
            const spaceName =
              getSpaceBySlug(req.spaceSlug)?.name ??
              resolveSpaceDisplayName(req.spaceSlug);
            const st = req.reservationStatus;
            const label = st
              ? STATUS_LABEL_CLIENT[st]
              : String(req.status);
            return (
              <li
                key={req.id}
                ref={(node) => {
                  cardRefs.current[req.id] = node;
                }}
                className={cn(
                  "rounded-2xl border border-border bg-white p-4 shadow-sm transition duration-700",
                  activeHighlightId === req.id &&
                    "border-amber-300 bg-amber-50 shadow-[0_0_0_5px_rgba(251,191,36,0.18)]",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="font-semibold">
                    {req.clientName} — {formatDateBR(req.date)} —{" "}
                    {req.eventType}
                  </p>
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-[0.7rem] font-semibold">
                    {label}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {spaceName} · {req.guests} convidados
                  {req.period ? ` · ${periodLabel(req.period)}` : ""}
                </p>
                <p className="mt-2 text-sm">
                  Comodidades:{" "}
                  {req.amenities.length > 0
                    ? req.amenities.join(", ")
                    : "Nenhuma opcional"}
                </p>
                <p className="mt-1 text-sm font-semibold">
                  Total estimado: {brl(req.estimatedTotal)}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {st === "pending" ||
                  st === "requested" ||
                  req.status === "pendente" ? (
                    <>
                      <Button
                        type="button"
                        className="font-semibold"
                        onClick={() => onAccept(req)}
                      >
                        <Check className="size-4" />
                        Aprovar
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="font-semibold"
                        onClick={() => onRefuse(req)}
                      >
                        <X className="size-4" />
                        Recusar
                      </Button>
                    </>
                  ) : null}
                  {st === "awaiting_payment" ? (
                    <Button
                      type="button"
                      className="font-semibold"
                      onClick={() => onConfirmPayment(req)}
                    >
                      Confirmar pagamento (demo)
                    </Button>
                  ) : null}
                  {st === "waitlisted" ? (
                    <p className="text-sm text-muted-foreground">
                      Na fila — período com hold/confirmação de outro pedido.
                    </p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => {
          resetOwnerRequestsSeed();
          reload();
          onRefresh();
        }}
      >
        Restaurar seed demo
      </Button>
    </section>
  );
}

function BookingRulesPanel({
  space,
  spaces,
  onSelectSpace,
}: {
  space: Space;
  spaces: Space[];
  onSelectSpace: (slug: string) => void;
}) {
  const [settings, setSettings] = useState<SpaceBookingSettings>(() =>
    getBookingSettings(space.slug),
  );

  useEffect(() => {
    setSettings(getBookingSettings(space.slug));
  }, [space.slug]);

  function persist(next: SpaceBookingSettings) {
    setSettings(saveBookingSettings(next));
    toast.success("Regras de reserva salvas (mock).");
  }

  return (
    <section className="space-y-4">
      <div>
        <h1 className="font-display text-xl font-semibold tracking-tight md:text-2xl">
          Regras de reserva
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Modo manual ou automático (estilo Airbnb). Conflito de agenda sempre
          tem prioridade.
        </p>
      </div>

      {spaces.length > 1 ? (
        <select
          className="appearance-none rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none transition hover:border-stone-300 focus:border-stone-300 focus:outline-none focus:ring-0 focus:shadow-[0_0_0_3px_rgba(120,113,108,0.22)] focus-visible:outline-none focus-visible:ring-0 focus-visible:shadow-[0_0_0_3px_rgba(120,113,108,0.22)]"
          value={space.slug}
          onChange={(e) => onSelectSpace(e.target.value)}
        >
          {spaces.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.name}
            </option>
          ))}
        </select>
      ) : null}

      <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold">{space.name}</p>
        <fieldset className="mt-4 space-y-2">
          <legend className="text-sm font-medium text-muted-foreground">
            Modo de reserva
          </legend>
          {(
            [
              ["manual", "Aprovação manual"],
              ["automatic", "Aprovação automática (requisitos)"],
            ] as [BookingMode, string][]
          ).map(([mode, label]) => (
            <label
              key={mode}
              className="flex cursor-pointer items-center gap-2 text-sm"
            >
              <input
                type="radio"
                name="bookingMode"
                checked={settings.bookingMode === mode}
                onChange={() =>
                  persist({ ...settings, bookingMode: mode })
                }
              />
              {label}
            </label>
          ))}
        </fieldset>

        <label className="mt-4 block space-y-1.5 text-sm">
          <span className="font-medium text-muted-foreground">
            Hold de pagamento (minutos)
          </span>
          <input
            type="number"
            min={1}
            max={120}
            className="w-full max-w-xs rounded-lg border border-border px-3 py-2"
            value={settings.paymentHoldMinutes}
            onChange={(e) =>
              persist({
                ...settings,
                paymentHoldMinutes: Math.max(
                  1,
                  Number(e.target.value) || 15,
                ),
              })
            }
          />
        </label>

        <label className="mt-4 block space-y-1.5 text-sm">
          <span className="font-medium text-muted-foreground">
            Antecedência mínima (horas)
          </span>
          <input
            type="number"
            min={0}
            className="w-full max-w-xs rounded-lg border border-border px-3 py-2"
            value={settings.minNoticeHours}
            onChange={(e) =>
              persist({
                ...settings,
                minNoticeHours: Math.max(0, Number(e.target.value) || 0),
              })
            }
          />
        </label>

        <p className="mt-4 text-xs text-muted-foreground">
          Capacidade máxima usada na autoaprovação: {space.capacity} convidados
          · tipos permitidos: {space.eventTypes.join(", ")}.
        </p>
      </div>
    </section>
  );
}

function OwnerListings({
  spaces,
  published,
  onEdit,
  onNew,
}: {
  spaces: Space[];
  published: PublishedSpaceListing[];
  onEdit: () => void;
  onNew: () => void;
}) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold tracking-tight md:text-2xl">
            Meus anúncios
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Espaços da conta + cadastros publicados neste dispositivo
          </p>
        </div>
        <Button type="button" className="font-semibold" onClick={onNew}>
          <Plus className="size-4" />
          Cadastrar novo espaço
        </Button>
      </div>

      <ul className="space-y-3">
        {spaces.map((space) => (
          <li
            key={space.slug}
            className="flex gap-3 overflow-hidden rounded-2xl border border-border bg-white shadow-sm"
          >
            <img
              src={space.image}
              alt=""
              className="h-28 w-28 shrink-0 object-cover sm:h-32 sm:w-36"
            />
            <div className="flex min-w-0 flex-1 flex-col justify-center py-3 pr-3">
              <p className="truncate font-display text-lg font-semibold">
                {space.name}
              </p>
              <p className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                {space.acitVerified ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-[var(--forest)] px-2 py-0.5 font-semibold text-white">
                    <ShieldCheck className="size-3" />
                    Verificado
                  </span>
                ) : (
                  <span className="rounded-md bg-amber-100 px-2 py-0.5 font-semibold text-amber-950">
                    Aguardando homologação
                  </span>
                )}
                <span className="text-muted-foreground">Ativo</span>
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="mt-3 w-fit font-semibold"
                onClick={onEdit}
              >
                Editar
              </Button>
            </div>
          </li>
        ))}

        {published.map((listing) => (
          <li
            key={listing.id}
            className="flex gap-3 overflow-hidden rounded-2xl border border-border bg-white shadow-sm"
          >
            <img
              src={listing.image}
              alt=""
              className="h-28 w-28 shrink-0 object-cover sm:h-32 sm:w-36"
            />
            <div className="flex min-w-0 flex-1 flex-col justify-center py-3 pr-3">
              <p className="truncate font-display text-lg font-semibold">
                {listing.name}
              </p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {listing.address}
              </p>
              <p className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                {listing.status === "verificado" ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-[var(--forest)] px-2 py-0.5 font-semibold text-white">
                    <ShieldCheck className="size-3" />
                    Verificado
                  </span>
                ) : listing.status === "recusado" ? (
                  <span className="rounded-md bg-rose-100 px-2 py-0.5 font-semibold text-rose-900">
                    Homologação recusada
                  </span>
                ) : (
                  <span className="rounded-md bg-amber-100 px-2 py-0.5 font-semibold text-amber-950">
                    Aguardando homologação
                  </span>
                )}
                <span className="text-muted-foreground">
                  {listing.capacity} pessoas · a partir de{" "}
                  {brl(listing.basePrice)}
                </span>
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="mt-3 w-fit font-semibold"
                onClick={onEdit}
              >
                Editar
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
