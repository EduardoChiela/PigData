import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CircleHelp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/mock-data";

export const Route = createFileRoute("/ajuda")({
  head: () => ({
    meta: [{ title: `Ajuda — ${APP_NAME}` }],
  }),
  component: HelpPage,
});

function HelpPage() {
  return (
    <div className="page-shell py-10 md:py-14">
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <Button asChild variant="outline" size="sm">
          <Link to="/bem-vindo">
            <ArrowLeft className="size-4" />
            Apresentação
          </Link>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link to="/painel">Painel do parceiro</Link>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link to="/entrar">Entrar</Link>
        </Button>
      </div>

      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-[var(--ink)] text-[var(--leaf)]">
            <CircleHelp className="size-5" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
              Ajuda — {APP_NAME}
            </h1>
            <p className="text-sm text-muted-foreground">
              Guia rápido para demo e banca. Documento completo em{" "}
              <code className="text-xs">docs/guia-usuario.md</code>.
            </p>
          </div>
        </div>

        <section className="space-y-3 rounded-2xl border border-border bg-white p-5 shadow-sm">
          <h2 className="font-display text-lg font-semibold">Contas demo</h2>
          <p className="text-sm text-muted-foreground">
            Senha de todas: <strong className="text-foreground">demo</strong>
          </p>
          <ul className="space-y-2 text-sm">
            <li>
              <strong>Cliente:</strong> ana.ribeiro@email.com — mapa e
              solicitação
            </li>
            <li>
              <strong>Parceiro:</strong> parceiro@acit.toledo.br — painel
              administrativo
            </li>
            <li>
              <strong>Organizador ACIT:</strong> organizador@acit.toledo.br —
              painel da rede (legado; pode sair do sistema — item R2 do backlog)
            </li>
          </ul>
          <Button asChild className="mt-2">
            <Link to="/entrar">Ir para Entrar</Link>
          </Button>
        </section>

        <section className="mt-6 space-y-3 rounded-2xl border border-border bg-white p-5 shadow-sm">
          <h2 className="font-display text-lg font-semibold">
            Caminho do cliente
          </h2>
          <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>
              Em <strong className="text-foreground">/bem-vindo</strong>, use{" "}
              <strong className="text-foreground">Ver espaços</strong> (entra
              como Ana) ou a barra de busca.
            </li>
            <li>No mapa, abra um espaço → Escolher data e solicitar.</li>
            <li>
              Complete data → comodidades → revisão → enviar.{" "}
              <strong className="text-foreground">
                Solicitação ≠ reserva
              </strong>
              . Acompanhe em Minhas reservas e no sino; se aprovada, use
              Continuar para pagamento (demo).
            </li>
          </ol>
        </section>

        <section className="mt-6 space-y-3 rounded-2xl border border-border bg-white p-5 shadow-sm">
          <h2 className="font-display text-lg font-semibold">
            Caminho do parceiro (admin)
          </h2>
          <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>
              Entre com a conta parceiro → abre{" "}
              <strong className="text-foreground">/painel</strong>.
            </li>
            <li>
              <strong className="text-foreground">Agenda</strong> — vê
              solicitações, hold e confirmadas no calendário.
            </li>
            <li>
              <strong className="text-foreground">Solicitações</strong> —
              aprovar, recusar ou confirmar pagamento demo.
            </li>
            <li>
              <strong className="text-foreground">Regras de reserva</strong> —
              modo manual ou automático.
            </li>
            <li>
              <strong className="text-foreground">Meus anúncios</strong> e{" "}
              <strong className="text-foreground">Cadastrar espaço</strong> —
              listings e wizard de cadastro.
            </li>
          </ol>
          <Button asChild variant="outline" className="mt-2">
            <Link to="/painel">Abrir painel</Link>
          </Button>
        </section>

        <section className="mt-6 space-y-3 rounded-2xl border border-border bg-[var(--sand)]/50 p-5">
          <h2 className="font-display text-lg font-semibold">
            Fora desta demo
          </h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>Pagamento real / gateway</li>
            <li>Google Places API real</li>
            <li>E-mail / WhatsApp providers (só in-app no mock)</li>
            <li>Auth real (hoje é mock em localStorage)</li>
          </ul>
        </section>

        <section className="mt-6 space-y-3 rounded-2xl border border-border bg-white p-5 shadow-sm">
          <h2 className="font-display text-lg font-semibold">
            Checklist — usar sem explicação oral
          </h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>☐ Da landing chegar ao mapa e ver espaços</li>
            <li>☐ Entender solicitação ≠ reserva pela própria UI</li>
            <li>☐ Enviar uma solicitação mock</li>
            <li>☐ No parceiro, achar e aceitar/recusar solicitação</li>
            <li>☐ Saber qual conta demo usar (tabela acima)</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
