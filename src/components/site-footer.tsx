import { Link } from "@tanstack/react-router";
import { APP_NAME, APP_TAGLINE, PILOT_CITY_LABEL } from "@/lib/mock-data";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-[var(--ink)] text-white/80">
      <div className="page-shell grid gap-8 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <img
              src="/agora-logo.png"
              alt=""
              className="size-9 rounded-full bg-white object-cover"
              width={36}
              height={36}
            />
            <div>
              <p className="font-display text-xl font-semibold tracking-[0.12em] text-white">
                {APP_NAME.toUpperCase()}
              </p>
              <p className="text-xs text-white/50">{APP_TAGLINE}</p>
            </div>
          </div>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/65">
            Plataforma de espaços para eventos com disponibilidade em tempo real.
            Piloto em {PILOT_CITY_LABEL}, em parceria com a rede ACIT.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--leaf)]">
            Explorar
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/" className="hover:text-white">
                Buscar espaços livres
              </Link>
            </li>
            <li>
              <Link to="/" search={{ acit: "1" }} className="hover:text-white">
                Parceiros verificados ACIT
              </Link>
            </li>
            <li>
              <Link to="/bem-vindo" className="hover:text-white">
                Apresentação
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--leaf)]">
            Sobre
          </p>
          <p className="mt-3 text-sm leading-relaxed">
            Solicitação não é reserva. Você só paga depois da aprovação do
            estabelecimento.
          </p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="page-shell flex flex-wrap items-center justify-between gap-2 py-4 text-xs text-white/45">
          <span>
            {APP_NAME} · rede {APP_TAGLINE} · codinome PigData
          </span>
          <span>Mock piloto — sem pagamento real</span>
        </div>
      </div>
    </footer>
  );
}
