import {
  ArrowRight,
  CalendarCheck2,
  ClipboardList,
  Percent,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useMemo } from "react";
import { brl } from "@/lib/format";
import { getDashboardMetrics } from "@/lib/owner-dashboard-data";

/** Rampa ordinal (clara → escura) reaproveitando os tons da marca já em styles.css. */
const FUNNEL_RAMP = ["#b8e07a", "#1f6b45", "#0f2e1e"];

/** Faixa resumo exibida no topo da Agenda — 3 números + atalho para o dashboard completo. */
export function AgendaSummaryStrip({
  spaceSlugs,
  tick,
  onOpenDashboard,
}: {
  spaceSlugs: string[];
  tick: number;
  onOpenDashboard: () => void;
}) {
  const metrics = useMemo(
    () => getDashboardMetrics(spaceSlugs),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [spaceSlugs, tick],
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-white px-4 py-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <SummaryItem label="Faturamento do mês" value={brl(metrics.revenueTotal)} />
        <SummaryItem
          label="Ocupação"
          value={`${Math.round(metrics.occupancyRate * 100)}%`}
        />
        <SummaryItem label="Pendentes" value={String(metrics.pendingCount)} />
      </div>
      <button
        type="button"
        onClick={onOpenDashboard}
        className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[var(--color-primary)] hover:underline"
      >
        Ver dashboard completo
        <ArrowRight className="size-3.5" />
      </button>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="font-display text-base font-semibold">{value}</p>
    </div>
  );
}

export function OwnerDashboard({
  spaceSlugs,
  tick,
}: {
  spaceSlugs: string[];
  tick: number;
}) {
  const metrics = useMemo(
    () => getDashboardMetrics(spaceSlugs),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [spaceSlugs, tick],
  );

  const pct = (n: number | null) => (n == null ? "—" : `${Math.round(n * 100)}%`);
  const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

  return (
    <section className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-semibold tracking-tight md:text-2xl">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Métricas dos seus espaços — dados combinados de agenda e solicitações
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          icon={Wallet}
          label="Faturamento (reservas aceitas)"
          value={brl(metrics.revenueTotal)}
        />
        <StatTile
          icon={TrendingUp}
          label="Ticket médio"
          value={metrics.acceptedCount > 0 ? brl(metrics.avgTicket) : "—"}
        />
        <StatTile
          icon={Percent}
          label="Taxa de conversão"
          value={pct(metrics.conversionRate)}
          hint={`${plural(metrics.acceptedCount, "aceita")} · ${plural(metrics.refusedCount, "recusada")}`}
        />
        <StatTile
          icon={ClipboardList}
          label="Solicitações pendentes"
          value={String(metrics.pendingCount)}
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="space-y-5 rounded-2xl border border-border bg-white p-4 shadow-sm">
          <OccupancyMeter rate={metrics.occupancyRate} />
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
              <CalendarCheck2 className="size-4" />
              Funil da jornada
            </p>
            <FunnelChart stages={metrics.funnel} />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold">Faturamento — últimos 6 meses</p>
          <TrendChart points={metrics.trend} />
          <p className="mt-1 text-xs text-muted-foreground">
            * Meses anteriores ao atual são estimativas ilustrativas para
            comparação de desempenho.
          </p>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <p className="mb-3 text-sm font-semibold">Mix de tipos de evento</p>
          {metrics.eventMix.length > 0 ? (
            <BarList
              items={metrics.eventMix.map((e) => ({ label: e.label, value: e.count }))}
            />
          ) : (
            <EmptyHint />
          )}
        </div>

        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <p className="mb-3 text-sm font-semibold">
            Comodidades mais escolhidas (reservas aceitas)
          </p>
          {metrics.amenitiesTop.length > 0 ? (
            <BarList
              items={metrics.amenitiesTop.map((a) => ({
                label: a.label,
                value: a.count,
                sub: a.revenue > 0 ? `+${brl(a.revenue)}` : undefined,
              }))}
            />
          ) : (
            <EmptyHint />
          )}
        </div>
      </div>

      {metrics.perSpace.length > 1 ? (
        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <p className="border-b border-border px-4 py-3 text-sm font-semibold">
            Comparativo por espaço
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="px-4 py-2 font-medium">Espaço</th>
                  <th className="px-4 py-2 font-medium">Faturamento</th>
                  <th className="px-4 py-2 font-medium">Ocupação</th>
                  <th className="px-4 py-2 font-medium">Conversão</th>
                </tr>
              </thead>
              <tbody>
                {metrics.perSpace.map((s) => (
                  <tr key={s.slug} className="border-t border-border">
                    <td className="px-4 py-2.5 font-medium">{s.name}</td>
                    <td className="px-4 py-2.5">{brl(s.revenue)}</td>
                    <td className="px-4 py-2.5">{Math.round(s.occupancyRate * 100)}%</td>
                    <td className="px-4 py-2.5">{pct(s.conversionRate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function EmptyHint() {
  return (
    <p className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
      Ainda sem dados suficientes.
    </p>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="size-3.5 shrink-0" />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="mt-2 truncate font-display text-2xl font-semibold tracking-tight">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function OccupancyMeter({ rate }: { rate: number }) {
  const percent = Math.round(rate * 100);
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-semibold">Ocupação da agenda</p>
        <p className="font-display text-lg font-semibold">{percent}%</p>
      </div>
      <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-[var(--sand)]">
        <div
          className="h-full rounded-full bg-[var(--color-primary)] transition-[width]"
          style={{ width: `${Math.max(2, percent)}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Dias bloqueados ou reservados na janela de 30 dias
      </p>
    </div>
  );
}

function FunnelChart({ stages }: { stages: { label: string; value: number }[] }) {
  const max = Math.max(1, ...stages.map((s) => s.value));
  return (
    <div className="space-y-2.5">
      {stages.map((stage, i) => {
        const percent = Math.max(6, Math.round((stage.value / max) * 100));
        const color = FUNNEL_RAMP[Math.min(i, FUNNEL_RAMP.length - 1)];
        return (
          <div key={stage.label}>
            <div className="flex items-baseline justify-between text-xs">
              <span className="font-medium text-foreground">{stage.label}</span>
              <span className="font-semibold">{stage.value}</span>
            </div>
            <div className="mt-1 h-5 w-full overflow-hidden rounded-full bg-[var(--sand)]">
              <div
                className="h-full rounded-full"
                style={{ width: `${percent}%`, backgroundColor: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BarList({
  items,
}: {
  items: { label: string; value: number; sub?: string | undefined }[];
}) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <ul className="space-y-2.5">
      {items.map((item) => {
        const percent = Math.max(4, Math.round((item.value / max) * 100));
        return (
          <li key={item.label}>
            <div className="flex items-baseline justify-between gap-2 text-xs">
              <span className="truncate font-medium text-foreground">
                {item.label}
              </span>
              <span className="shrink-0 font-semibold text-muted-foreground">
                {item.value}
                {item.sub ? (
                  <span className="ml-1.5 text-[var(--color-primary)]">
                    {item.sub}
                  </span>
                ) : null}
              </span>
            </div>
            <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-[var(--sand)]">
              <div
                className="h-full rounded-full bg-[var(--color-primary)]"
                style={{ width: `${percent}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function TrendChart({ points }: { points: { label: string; value: number }[] }) {
  const width = 560;
  const height = 190;
  const padX = 10;
  const topPad = 14;
  const bottomPad = 34;
  const plotH = height - topPad - bottomPad;
  const max = Math.max(1, ...points.map((p) => p.value));
  const stepX = points.length > 1 ? (width - padX * 2) / (points.length - 1) : 0;

  const coords = points.map((p, i) => {
    const x = padX + i * stepX;
    const y = topPad + plotH - (p.value / max) * plotH;
    return [x, y] as const;
  });

  const linePath = coords
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");
  const baseline = topPad + plotH;
  const areaPath =
    coords.length > 0
      ? `${linePath} L${coords[coords.length - 1]![0].toFixed(1)},${baseline} ` +
        `L${coords[0]![0].toFixed(1)},${baseline} Z`
      : "";

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mt-2 w-full"
      role="img"
      aria-label="Evolução do faturamento nos últimos 6 meses"
    >
      <line
        x1={padX}
        y1={baseline}
        x2={width - padX}
        y2={baseline}
        stroke="#d5d9de"
        strokeWidth={1}
      />
      {areaPath ? (
        <path d={areaPath} fill="var(--color-primary)" opacity={0.1} stroke="none" />
      ) : null}
      <path
        d={linePath}
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {coords.map(([x, y], i) => (
        <circle
          key={points[i]!.label}
          cx={x}
          cy={y}
          r={4}
          fill="var(--color-primary)"
          stroke="#ffffff"
          strokeWidth={2}
        >
          <title>{`${points[i]!.label}: ${brl(points[i]!.value)}`}</title>
        </circle>
      ))}
      {points.map((p, i) => (
        <text
          key={p.label}
          x={coords[i]![0]}
          y={height - 10}
          fontSize={10}
          textAnchor="middle"
          fill="#5c6570"
        >
          {p.label}
        </text>
      ))}
    </svg>
  );
}
