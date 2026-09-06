import {
  CalendarDays,
  Check,
  ClipboardList,
  Home,
  Plus,
  ShieldCheck,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { OwnerAgenda } from "@/components/owner-agenda";
import { SpaceRegistrationWizard } from "@/components/space-registration-wizard";
import { Button } from "@/components/ui/button";
import { formatDateBR, brl } from "@/lib/format";
import { getSpaceBySlug, type Space } from "@/lib/mock-data";
import type { MockUser } from "@/lib/mock-session";
import {
  acceptOwnerRequest,
  listPendingOwnerRequests,
  refuseOwnerRequest,
  type OwnerReservationRequest,
} from "@/lib/owner-panel-data";
import {
  listOwnerListings,
  type PublishedSpaceListing,
} from "@/lib/space-registration";
import { cn } from "@/lib/utils";

type TabId = "agenda" | "solicitacoes" | "anuncios" | "cadastrar";

export function OwnerPanel({ user }: { user: MockUser }) {
  const spaceSlugs = user.spaceSlugs ?? ["vila-verde"];
  const ownedSpaces = spaceSlugs
    .map((s) => getSpaceBySlug(s))
    .filter((s): s is Space => Boolean(s));

  const [tab, setTab] = useState<TabId>("agenda");
  const [activeSlug, setActiveSlug] = useState(
    ownedSpaces[0]?.slug ?? spaceSlugs[0]!,
  );
  const [tick, setTick] = useState(0);
  const refresh = () => setTick((n) => n + 1);

  const published = useMemo(
    () => listOwnerListings(user.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user.id, tick],
  );

  const activeSpace =
    ownedSpaces.find((s) => s.slug === activeSlug) ?? ownedSpaces[0];

  const pending = useMemo(
    () => listPendingOwnerRequests(spaceSlugs),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [spaceSlugs, tick],
  );

  const nav = [
    { id: "agenda" as const, label: "Agenda", icon: CalendarDays },
    {
      id: "solicitacoes" as const,
      label: "Solicitações",
      icon: ClipboardList,
      badge: pending.length,
    },
    { id: "anuncios" as const, label: "Meus anúncios", icon: Home },
    { id: "cadastrar" as const, label: "Cadastrar espaço", icon: Plus },
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
                  {item.badge ? (
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
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {tab === "agenda" && activeSpace ? (
          <OwnerAgenda
            space={activeSpace}
            spaces={ownedSpaces}
            onSelectSpace={setActiveSlug}
            tick={tick}
            onRefresh={refresh}
          />
        ) : null}
        {tab === "solicitacoes" ? (
          <OwnerRequests
            spaceSlugs={spaceSlugs}
            tick={tick}
            onRefresh={refresh}
          />
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
      </div>
    </div>
  );
}

function OwnerRequests({
  spaceSlugs,
  tick,
  onRefresh,
}: {
  spaceSlugs: string[];
  tick: number;
  onRefresh: () => void;
}) {
  const pending = useMemo(
    () => listPendingOwnerRequests(spaceSlugs),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [spaceSlugs, tick],
  );

  function onAccept(req: OwnerReservationRequest) {
    acceptOwnerRequest(req.id);
    onRefresh();
  }

  function onRefuse(id: string) {
    refuseOwnerRequest(id);
    onRefresh();
  }

  return (
    <section className="space-y-4">
      <div>
        <h1 className="font-display text-xl font-semibold tracking-tight md:text-2xl">
          Solicitações pendentes ({pending.length})
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pedidos de reserva de evento — distintos de “Agendar visita”
        </p>
      </div>

      {pending.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-white p-8 text-center text-sm text-muted-foreground">
          Nenhuma solicitação pendente.
        </p>
      ) : (
        <ul className="space-y-3">
          {pending.map((req) => {
            const space = getSpaceBySlug(req.spaceSlug);
            return (
              <li
                key={req.id}
                className="rounded-2xl border border-border bg-white p-4 shadow-sm"
              >
                <p className="font-semibold">
                  {req.clientName} — {formatDateBR(req.date)} — {req.eventType}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {space?.name} · {req.guests} convidados
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
                  <Button
                    type="button"
                    className="font-semibold"
                    onClick={() => onAccept(req)}
                  >
                    <Check className="size-4" />
                    Aceitar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="font-semibold"
                    onClick={() => onRefuse(req.id)}
                  >
                    <X className="size-4" />
                    Recusar
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
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
                    Verificado ACIT
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
                <span className="rounded-md bg-amber-100 px-2 py-0.5 font-semibold text-amber-950">
                  Aguardando homologação ACIT
                </span>
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
