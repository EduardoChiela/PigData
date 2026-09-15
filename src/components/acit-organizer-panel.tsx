import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Search,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  acitDayKind,
  listAcitMessages,
  listNetworkSpaces,
  sendAcitMessage,
  type AgendaHealth,
} from "@/lib/acit-panel-data";
import { formatDateBR } from "@/lib/format";
import { getSpaceBySlug, spaces, type Space } from "@/lib/mock-data";
import type { MockUser } from "@/lib/mock-session";
import {
  listAllListings,
  listPendingHomologacoes,
  updateListingStatus,
  type PublishedSpaceListing,
} from "@/lib/space-registration";
import { cn } from "@/lib/utils";

type TabId = "calendario" | "filiados" | "mensagens";

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
] as const;

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as const;

function toIso(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function healthDot(health: AgendaHealth) {
  if (health === "ok") return "bg-emerald-500";
  if (health === "warn") return "bg-amber-400";
  return "bg-rose-500";
}

function healthText(health: AgendaHealth) {
  if (health === "ok") return "Agenda em dia";
  if (health === "warn") return "Atenção";
  return "Desatualizada";
}

export function AcitOrganizerPanel({ user }: { user: MockUser }) {
  const [tab, setTab] = useState<TabId>("calendario");
  const [tick, setTick] = useState(0);
  const [query, setQuery] = useState("");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const refresh = () => setTick((n) => n + 1);

  const network = useMemo(
    () => listNetworkSpaces(query),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query, tick],
  );
  const selectedSpace = selectedSlug ? getSpaceBySlug(selectedSlug) : null;

  const [pendingHomologCount, setPendingHomologCount] = useState(0);

  useEffect(() => {
    setPendingHomologCount(listPendingHomologacoes().length);
  }, [tick]);

  const tabs: {
    id: TabId;
    label: string;
    icon: typeof CalendarDays;
    badge?: number;
  }[] = [
    { id: "calendario", label: "Calendário", icon: CalendarDays },
    {
      id: "filiados",
      label: "Filiados",
      icon: Users,
      badge: pendingHomologCount,
    },
    { id: "mensagens", label: "Mensagens", icon: MessageSquare },
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-5 md:px-6 md:py-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--forest)]">
            Rede ACIT · {user.name}
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight md:text-3xl">
            Painel do organizador
          </h1>
        </div>
      </div>

      <nav className="flex flex-wrap gap-1 rounded-xl border border-border bg-white p-1 shadow-sm">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTab(t.id);
                if (t.id === "calendario") setSelectedSlug(null);
              }}
              className={cn(
                "inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition sm:flex-none",
                active
                  ? "bg-[var(--ink)] text-white"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {t.label}
              {t.badge ? (
                <span
                  className={cn(
                    "grid min-w-5 place-items-center rounded-full px-1.5 text-[0.65rem] font-bold",
                    active
                      ? "bg-white/20 text-white"
                      : "bg-[var(--warm)] text-white",
                  )}
                >
                  {t.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {tab === "calendario" ? (
        selectedSpace ? (
          <AcitReadonlyAgenda
            space={selectedSpace}
            onBack={() => setSelectedSlug(null)}
          />
        ) : (
          <NetworkCalendarList
            rows={network}
            total={spaces.length}
            query={query}
            onQuery={setQuery}
            onSelect={(slug) => setSelectedSlug(slug)}
          />
        )
      ) : null}

      {tab === "filiados" ? (
        <FiliadosPanel tick={tick} onRefresh={refresh} />
      ) : null}

      {tab === "mensagens" ? (
        <MensagensPanel tick={tick} onRefresh={refresh} />
      ) : null}
    </div>
  );
}

function NetworkCalendarList({
  rows,
  total,
  query,
  onQuery,
  onSelect,
}: {
  rows: ReturnType<typeof listNetworkSpaces>;
  total: number;
  query: string;
  onQuery: (q: string) => void;
  onSelect: (slug: string) => void;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-semibold tracking-tight">
          Calendário compartilhado — Rede ACIT ({total} espaços)
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Visão de leitura das agendas filiadas. Selecione um espaço para abrir
          o calendário.
        </p>
      </div>

      <label className="relative block">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          className="w-full rounded-xl border border-border bg-white py-2.5 pl-10 pr-3 text-sm shadow-sm"
          placeholder="Buscar espaço..."
          value={query}
          onChange={(e) => onQuery(e.target.value)}
        />
      </label>

      <ul className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        {rows.map((row, i) => (
          <li key={row.space.slug}>
            <button
              type="button"
              onClick={() => onSelect(row.space.slug)}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-muted/60",
                i > 0 && "border-t border-border",
              )}
            >
              <img
                src={row.space.image}
                alt=""
                className="size-12 shrink-0 rounded-lg object-cover"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">
                  {row.space.name}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {row.space.city} - {row.space.state} · {row.space.region}
                </span>
              </span>
              <span className="shrink-0 text-right">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                  <span
                    className={cn(
                      "size-2.5 rounded-full",
                      healthDot(row.health),
                    )}
                  />
                  {healthText(row.health)}
                </span>
                <span className="mt-0.5 block text-[0.65rem] text-muted-foreground">
                  {row.healthLabel}
                </span>
              </span>
            </button>
          </li>
        ))}
        {rows.length === 0 ? (
          <li className="px-4 py-8 text-center text-sm text-muted-foreground">
            Nenhum espaço encontrado.
          </li>
        ) : null}
      </ul>
    </section>
  );
}

function AcitReadonlyAgenda({
  space,
  onBack,
}: {
  space: Space;
  onBack: () => void;
}) {
  const [cursor, setCursor] = useState(() => new Date(2026, 8, 1));
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay();

  const cells: ({ iso: string; day: number } | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ iso: toIso(new Date(year, month, d)), day: d });
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-[#dadce0] bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-2 border-b border-[#dadce0] px-3 py-2.5 md:px-4">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-9 rounded-full border-[#dadce0] font-medium"
          onClick={onBack}
        >
          <ArrowLeft className="size-3.5" />
          Voltar
        </Button>
        <div className="flex items-center">
          <button
            type="button"
            className="grid size-9 place-items-center rounded-full hover:bg-[#f1f3f4]"
            aria-label="Mês anterior"
            onClick={() => setCursor(new Date(year, month - 1, 1))}
          >
            <ChevronLeft className="size-5 text-[#3c4043]" />
          </button>
          <button
            type="button"
            className="grid size-9 place-items-center rounded-full hover:bg-[#f1f3f4]"
            aria-label="Próximo mês"
            onClick={() => setCursor(new Date(year, month + 1, 1))}
          >
            <ChevronRight className="size-5 text-[#3c4043]" />
          </button>
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg font-normal tracking-tight text-[#3c4043] md:text-xl">
            {space.name} — {MONTHS[month]} {year}
          </h2>
          <p className="text-xs text-[#5f6368]">Calendário (somente leitura)</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 border-b border-[#dadce0] px-4 py-2.5 text-xs text-[#5f6368]">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-emerald-500" /> livre
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-rose-500" /> ocupado
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-amber-400" /> bloqueado pelo
          espaço
        </span>
      </div>

      <div className="grid grid-cols-7 border-b border-[#dadce0]">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="border-r border-[#dadce0] py-2 text-center text-[0.7rem] font-medium uppercase tracking-wide text-[#70757a] last:border-r-0"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 auto-rows-[minmax(4.5rem,1fr)]">
        {cells.map((cell, i) => {
          if (!cell) {
            return (
              <div
                key={`e-${i}`}
                className="min-h-[4.5rem] border-b border-r border-[#dadce0] bg-[#f8f9fa]"
              />
            );
          }
          const kind = acitDayKind(space, cell.iso);
          const selected = selectedDay === cell.iso;
          return (
            <button
              key={cell.iso}
              type="button"
              onClick={() => setSelectedDay(cell.iso)}
              className={cn(
                "flex min-h-[4.5rem] flex-col items-center gap-1 border-b border-r border-[#dadce0] bg-white p-1.5 text-center transition hover:bg-[#f8f9fa]",
                selected && "bg-[#e8f0fe] hover:bg-[#e8f0fe]",
              )}
            >
              <span className="text-xs font-medium text-[#3c4043]">
                {cell.day}
              </span>
              <span
                className={cn(
                  "mt-auto mb-1 size-2.5 rounded-full",
                  kind === "livre" && "bg-emerald-500",
                  kind === "ocupado" && "bg-rose-500",
                  kind === "bloqueado" && "bg-amber-400",
                )}
                title={kind}
              />
            </button>
          );
        })}
      </div>

      {selectedDay ? (
        <div className="border-t border-[#dadce0] bg-[#f8f9fa] px-4 py-4">
          <p className="text-sm font-medium text-[#3c4043]">
            {formatDateBR(selectedDay)}
            <span className="ml-2 font-normal text-[#5f6368]">
              ·{" "}
              {acitDayKind(space, selectedDay) === "ocupado"
                ? "Ocupado"
                : acitDayKind(space, selectedDay) === "bloqueado"
                  ? "Bloqueado pelo espaço"
                  : "Livre"}
            </span>
          </p>
          <p className="mt-2 text-xs text-[#5f6368]">
            Organizador ACIT só visualiza — sem bloquear datas nem gerir
            reservas.
          </p>
        </div>
      ) : null}
    </section>
  );
}

function FiliadosPanel({
  tick,
  onRefresh,
}: {
  tick: number;
  onRefresh: () => void;
}) {
  const pending = useMemo(
    () => listPendingHomologacoes(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tick],
  );
  const allListings = useMemo(
    () => listAllListings(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tick],
  );
  const verifiedListings = allListings.filter((l) => l.status === "verificado");
  const verifiedCatalog = spaces.filter((s) => s.acitVerified);
  const [detail, setDetail] = useState<PublishedSpaceListing | null>(null);

  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold tracking-tight">
          Filiados / Parceiros
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Homologação do selo ACIT — ação exclusiva do organizador.
        </p>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Aguardando homologação ({pending.length})
        </h3>
        {pending.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-white px-4 py-6 text-sm text-muted-foreground">
            Nenhum cadastro pendente no momento.
          </p>
        ) : (
          <ul className="space-y-3">
            {pending.map((listing) => (
              <li
                key={listing.id}
                className="rounded-2xl border border-border bg-white p-4 shadow-sm"
              >
                <div className="flex gap-3">
                  <img
                    src={listing.image}
                    alt=""
                    className="size-16 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{listing.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Cadastrado em {formatDateBR(listing.createdAt.slice(0, 10))}{" "}
                      · {listing.address}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="font-semibold"
                        onClick={() => setDetail(listing)}
                      >
                        Ver cadastro completo
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        className="font-semibold"
                        onClick={() => {
                          updateListingStatus(listing.id, "verificado");
                          onRefresh();
                        }}
                      >
                        <Check className="size-3.5" />
                        Homologar
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="font-semibold text-rose-700 hover:bg-rose-50"
                        onClick={() => {
                          updateListingStatus(listing.id, "recusado");
                          onRefresh();
                        }}
                      >
                        <X className="size-3.5" />
                        Recusar
                      </Button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Verificados
        </h3>
        <ul className="space-y-2">
          {verifiedListings.map((listing) => (
            <li
              key={listing.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-white px-4 py-3 shadow-sm"
            >
              <div>
                <p className="font-semibold">{listing.name}</p>
                <p className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--forest)]">
                  <ShieldCheck className="size-3.5" />
                  Verificado ACIT
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="font-semibold"
                onClick={() => {
                  updateListingStatus(listing.id, "aguardando_homologacao");
                  onRefresh();
                }}
              >
                Remover selo
              </Button>
            </li>
          ))}
          {verifiedCatalog.map((space) => (
            <li
              key={space.slug}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-white px-4 py-3 shadow-sm"
            >
              <div>
                <p className="font-semibold">{space.name}</p>
                <p className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--forest)]">
                  <ShieldCheck className="size-3.5" />
                  Verificado ACIT
                </p>
              </div>
              <span className="text-xs text-muted-foreground">
                Catálogo piloto (mock)
              </span>
            </li>
          ))}
        </ul>
      </div>

      {detail ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="max-h-[85dvh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-display text-lg font-semibold">
                {detail.name}
              </h3>
              <button
                type="button"
                className="rounded-full p-1 hover:bg-muted"
                onClick={() => setDetail(null)}
                aria-label="Fechar"
              >
                <X className="size-5" />
              </button>
            </div>
            <img
              src={detail.image}
              alt=""
              className="mt-3 h-40 w-full rounded-xl object-cover"
            />
            <dl className="mt-4 space-y-2 text-sm">
              <div>
                <dt className="text-muted-foreground">Endereço</dt>
                <dd className="font-medium">{detail.address}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Capacidade</dt>
                <dd className="font-medium">{detail.capacity} pessoas</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Preço base</dt>
                <dd className="font-medium">
                  R${" "}
                  {detail.basePrice.toLocaleString("pt-BR", {
                    minimumFractionDigits: 0,
                  })}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Classes</dt>
                <dd className="font-medium">
                  {detail.classes.join(", ") || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Eventos</dt>
                <dd className="font-medium">
                  {detail.eventTypes.join(", ") || "—"}
                </dd>
              </div>
              {detail.rules ? (
                <div>
                  <dt className="text-muted-foreground">Regras</dt>
                  <dd className="font-medium">{detail.rules}</dd>
                </div>
              ) : null}
            </dl>
            <Button
              type="button"
              className="mt-5 w-full font-semibold"
              onClick={() => setDetail(null)}
            >
              Fechar
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function MensagensPanel({
  tick,
  onRefresh,
}: {
  tick: number;
  onRefresh: () => void;
}) {
  const [spaceSlug, setSpaceSlug] = useState(spaces[0]?.slug ?? "vila-verde");
  const [body, setBody] = useState("");
  const messages = useMemo(
    () => listAcitMessages(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tick],
  );
  const space = getSpaceBySlug(spaceSlug);

  function send() {
    if (!body.trim() || !space) return;
    sendAcitMessage({
      spaceSlug: space.slug,
      spaceName: space.name,
      body,
    });
    setBody("");
    onRefresh();
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-semibold tracking-tight">
          Falar com parceiros
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Mensagem direta mock para o espaço selecionado.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-white p-4 shadow-sm md:p-5">
        <label className="block space-y-1 text-sm">
          <span className="font-medium text-muted-foreground">
            Selecionar espaço
          </span>
          <select
            className="w-full rounded-lg border border-border px-3 py-2.5"
            value={spaceSlug}
            onChange={(e) => setSpaceSlug(e.target.value)}
          >
            {spaces.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="mt-3 block space-y-1 text-sm">
          <span className="font-medium text-muted-foreground">Mensagem</span>
          <textarea
            className="min-h-28 w-full rounded-lg border border-border px-3 py-2.5"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Escreva para o parceiro…"
          />
        </label>
        <Button
          type="button"
          className="mt-3 font-semibold"
          disabled={!body.trim()}
          onClick={send}
        >
          Enviar
        </Button>
      </div>

      {messages.length > 0 ? (
        <ul className="space-y-2">
          {messages.map((m) => (
            <li
              key={m.id}
              className="rounded-xl border border-border bg-white px-4 py-3 text-sm shadow-sm"
            >
              <p className="font-semibold">{m.spaceName}</p>
              <p className="mt-1 text-muted-foreground">{m.body}</p>
              <p className="mt-1 text-[0.65rem] text-muted-foreground">
                {new Date(m.createdAt).toLocaleString("pt-BR")}
              </p>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
