import { Link } from "@tanstack/react-router";
import { APP_NAME, PILOT_CITY_LABEL } from "@/lib/mock-data";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-[var(--forest-deep)] text-white/80">
      <div className="page-shell grid gap-8 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-display text-xl font-semibold text-white">{APP_NAME}</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/65">
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
              <Link to="/buscar" className="hover:text-white">
                Buscar espaços livres
              </Link>
            </li>
            <li>
              <Link to="/buscar" search={{ acit: "1" }} className="hover:text-white">
                Parceiros verificados ACIT
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
          <span>Codinome interno: PigData · nome comercial a definir</span>
          <span>Mock piloto — sem pagamento real</span>
        </div>
      </div>
    </footer>
  );
}
