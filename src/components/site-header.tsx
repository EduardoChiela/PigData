import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  User,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { APP_NAME, APP_TAGLINE, PILOT_CITY_LABEL } from "@/lib/mock-data";
import {
  getActiveMockUser,
  isMockAuthenticated,
  setMockAuthenticated,
  type MockUser,
} from "@/lib/mock-session";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState<MockUser | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUser(isMockAuthenticated() ? getActiveMockUser() : null);
  }, [pathname]);

  useEffect(() => {
    if (!profileOpen) return;
    function onPointer(e: MouseEvent) {
      if (!profileRef.current?.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [profileOpen]);

  function signOutMock() {
    setMockAuthenticated(false);
    setUser(null);
    setProfileOpen(false);
    setOpen(false);
    void navigate({ to: "/bem-vindo" });
  }

  const authed = Boolean(user);
  const isPartner = user?.role === "parceiro";
  const mapMode = pathname === "/" || pathname.startsWith("/buscar");
  const panelMode = pathname.startsWith("/painel");
  const homeTo = !authed ? "/bem-vindo" : isPartner ? "/painel" : "/";

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b text-white backdrop-blur",
        mapMode || panelMode
          ? "border-white/8 bg-[color-mix(in_oklab,var(--ink)_94%,black)]"
          : "border-white/10 bg-[color-mix(in_oklab,var(--ink)_92%,black)]",
      )}
    >
      <div className="flex h-[3.75rem] items-center justify-between gap-4 px-4 md:px-6">
        <Link to={homeTo} className="flex items-center gap-2.5">
          <img
            src="/agora-logo.png"
            alt=""
            className="size-9 rounded-full bg-white object-cover shadow-sm ring-1 ring-white/20"
            width={36}
            height={36}
          />
          <span className="leading-none">
            <span className="block font-display text-[0.95rem] font-semibold tracking-[0.14em]">
              {APP_NAME.toUpperCase()}
            </span>
            <span className="mt-0.5 block text-[0.65rem] font-medium tracking-wide text-white/55">
              {isPartner
                ? "Painel do parceiro"
                : `${APP_TAGLINE} · ${PILOT_CITY_LABEL}`}
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {authed && user ? (
            <>
              {isPartner ? (
                <Link
                  to="/painel"
                  className="rounded-md px-3 py-2 text-sm font-medium text-white/85 hover:bg-white/10 hover:text-white"
                >
                  Painel
                </Link>
              ) : (
                <>
                  <Link
                    to="/"
                    className="rounded-md px-3 py-2 text-sm font-medium text-white/85 hover:bg-white/10 hover:text-white"
                  >
                    Mapa
                  </Link>
                  <Link
                    to="/"
                    search={{ acit: "1" }}
                    className="rounded-md px-3 py-2 text-sm font-medium text-white/85 hover:bg-white/10 hover:text-white"
                  >
                    Verificados ACIT
                  </Link>
                </>
              )}

              <div className="relative ml-2" ref={profileRef}>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full border border-white/15 bg-white/8 py-1 pl-1 pr-2.5 text-left hover:bg-white/12"
                  aria-expanded={profileOpen}
                  onClick={() => setProfileOpen((v) => !v)}
                >
                  <span className="grid size-8 place-items-center rounded-full bg-[var(--leaf)] text-xs font-bold text-[var(--ink)]">
                    {user.initials}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold leading-tight">
                      {user.name}
                    </span>
                    <span className="block truncate text-[0.65rem] text-white/55">
                      {user.roleLabel}
                    </span>
                  </span>
                  <ChevronDown className="size-3.5 shrink-0 text-white/50" />
                </button>

                {profileOpen ? (
                  <div className="absolute right-0 top-[calc(100%+0.4rem)] z-50 w-64 overflow-hidden rounded-xl border border-border bg-white text-foreground shadow-xl">
                    <div className="border-b border-border/70 px-3 py-3">
                      <p className="text-sm font-semibold">{user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    <div className="p-1.5">
                      {isPartner ? (
                        <Link
                          to="/painel"
                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm hover:bg-muted"
                          onClick={() => setProfileOpen(false)}
                        >
                          <LayoutDashboard className="size-4 text-muted-foreground" />
                          Abrir painel
                        </Link>
                      ) : (
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm hover:bg-muted"
                          onClick={() => setProfileOpen(false)}
                        >
                          <User className="size-4 text-muted-foreground" />
                          Meu perfil
                        </button>
                      )}
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-rose-700 hover:bg-rose-50"
                        onClick={signOutMock}
                      >
                        <LogOut className="size-4" />
                        Sair
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <Button
              asChild
              size="sm"
              className="ml-2 bg-[var(--leaf)] font-semibold text-[var(--ink)] hover:bg-[var(--leaf-bright)]"
            >
              <Link to="/entrar">Entrar</Link>
            </Button>
          )}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10 md:hidden"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>

      <div
        className={cn(
          "border-t border-white/10 md:hidden",
          open ? "block" : "hidden",
        )}
      >
        <div className="flex flex-col gap-1 px-4 py-3">
          {authed && user ? (
            <>
              <div className="mb-2 flex items-center gap-3 rounded-xl bg-white/8 px-3 py-2.5">
                <span className="grid size-9 place-items-center rounded-full bg-[var(--leaf)] text-xs font-bold text-[var(--ink)]">
                  {user.initials}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{user.name}</p>
                  <p className="truncate text-xs text-white/55">{user.email}</p>
                </div>
              </div>
              {isPartner ? (
                <Link
                  to="/painel"
                  className="rounded-md px-3 py-2.5 text-sm font-medium text-white/90 hover:bg-white/10"
                  onClick={() => setOpen(false)}
                >
                  Painel
                </Link>
              ) : (
                <>
                  <Link
                    to="/"
                    className="rounded-md px-3 py-2.5 text-sm font-medium text-white/90 hover:bg-white/10"
                    onClick={() => setOpen(false)}
                  >
                    Mapa
                  </Link>
                  <Link
                    to="/"
                    search={{ acit: "1" }}
                    className="rounded-md px-3 py-2.5 text-sm font-medium text-white/90 hover:bg-white/10"
                    onClick={() => setOpen(false)}
                  >
                    Verificados ACIT
                  </Link>
                </>
              )}
              <button
                type="button"
                className="rounded-md px-3 py-2.5 text-left text-sm font-medium text-rose-200 hover:bg-white/10"
                onClick={signOutMock}
              >
                Sair
              </button>
            </>
          ) : (
            <Link
              to="/entrar"
              className="rounded-md px-3 py-2.5 text-sm font-medium text-white/90 hover:bg-white/10"
              onClick={() => setOpen(false)}
            >
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
