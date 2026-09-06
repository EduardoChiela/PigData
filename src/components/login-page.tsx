import { Link, useNavigate } from "@tanstack/react-router";
import {
  Building2,
  CalendarDays,
  ClipboardList,
  LogIn,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { APP_NAME, APP_TAGLINE } from "@/lib/mock-data";
import {
  homePathForRole,
  loginAsMock,
  loginMock,
  MOCK_ACCOUNTS,
  registerMock,
  type MockRole,
} from "@/lib/mock-session";
import { cn } from "@/lib/utils";

export function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<MockRole>("cliente");
  const [error, setError] = useState("");

  function goHome(userRole: MockRole) {
    void navigate({ to: homePathForRole(userRole) });
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (mode === "login") {
      const user = loginMock(email, password);
      if (!user) {
        setError("E-mail ou senha inválidos. Use as contas demo abaixo.");
        return;
      }
      goHome(user.role);
      return;
    }
    if (!name.trim() || !email.trim()) {
      setError("Preencha nome e e-mail.");
      return;
    }
    const user = registerMock({ name, email, role });
    goHome(user.role);
  }

  function quickLogin(userId: string) {
    const user = loginAsMock(userId);
    if (user) goHome(user.role);
  }

  return (
    <div className="mx-auto grid min-h-[calc(100dvh-3.75rem)] w-full max-w-5xl gap-8 px-4 py-10 md:grid-cols-[1.1fr_0.9fr] md:items-center md:px-6">
      <div>
        <p className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--forest)]">
          <ShieldCheck className="size-3.5" />
          {APP_TAGLINE}
        </p>
        <h1 className="mt-4 font-display text-3xl font-bold tracking-tight md:text-4xl">
          Entrar no {APP_NAME}
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          Protótipo com duas contas mock: cliente (mapa e pedidos) e parceiro
          ACIT (painel + mesmo mapa de busca).
        </p>

        <div className="mt-8 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Entrar rapidamente
          </p>
          {MOCK_ACCOUNTS.map((account) => (
            <button
              key={account.id}
              type="button"
              onClick={() => quickLogin(account.id)}
              className="flex w-full items-center gap-3 rounded-2xl border border-border bg-white p-3 text-left shadow-sm transition hover:border-primary/40 hover:shadow-md"
            >
              <span
                className={cn(
                  "grid size-11 place-items-center rounded-full text-sm font-bold",
                  account.role === "parceiro"
                    ? "bg-[var(--leaf)] text-[var(--ink)]"
                    : "bg-[var(--ink)] text-white",
                )}
              >
                {account.initials}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{account.name}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {account.roleLabel} · {account.email} · senha demo
                </span>
              </span>
              <LogIn className="size-4 shrink-0 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white p-5 shadow-[0_16px_48px_-28px_rgba(20,40,30,0.55)] md:p-6">
        <div className="mb-4 flex gap-1 rounded-xl bg-muted p-1">
          <button
            type="button"
            className={cn(
              "flex-1 rounded-lg px-3 py-2 text-sm font-semibold",
              mode === "login" ? "bg-white shadow-sm" : "text-muted-foreground",
            )}
            onClick={() => setMode("login")}
          >
            Entrar
          </button>
          <button
            type="button"
            className={cn(
              "flex-1 rounded-lg px-3 py-2 text-sm font-semibold",
              mode === "register"
                ? "bg-white shadow-sm"
                : "text-muted-foreground",
            )}
            onClick={() => setMode("register")}
          >
            Cadastro (mock)
          </button>
        </div>

        <form className="space-y-3" onSubmit={onSubmit}>
          {mode === "register" ? (
            <>
              <label className="block space-y-1 text-sm">
                <span className="font-medium text-muted-foreground">Nome</span>
                <input
                  className="w-full rounded-lg border border-border px-3 py-2.5"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                />
              </label>
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium text-muted-foreground">
                  Tipo de conta
                </legend>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="role"
                    checked={role === "cliente"}
                    onChange={() => setRole("cliente")}
                  />
                  <Building2 className="size-4 text-muted-foreground" />
                  Cliente — buscar e solicitar espaços
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="role"
                    checked={role === "parceiro"}
                    onChange={() => setRole("parceiro")}
                  />
                  <ShieldCheck className="size-4 text-[var(--forest)]" />
                  Parceiro ACIT — painel do proprietário
                </label>
              </fieldset>
            </>
          ) : null}

          <label className="block space-y-1 text-sm">
            <span className="font-medium text-muted-foreground">E-mail</span>
            <input
              type="email"
              className="w-full rounded-lg border border-border px-3 py-2.5"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required={mode === "login"}
            />
          </label>

          {mode === "login" ? (
            <label className="block space-y-1 text-sm">
              <span className="font-medium text-muted-foreground">Senha</span>
              <input
                type="password"
                className="w-full rounded-lg border border-border px-3 py-2.5"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="demo"
                required
              />
            </label>
          ) : null}

          {error ? (
            <p className="text-sm text-rose-700" role="alert">
              {error}
            </p>
          ) : null}

          <Button type="submit" className="w-full font-semibold" size="lg">
            {mode === "login" ? "Entrar" : "Criar conta mock"}
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          <Link to="/bem-vindo" className="underline-offset-2 hover:underline">
            Voltar à apresentação
          </Link>
        </p>

        <ul className="mt-5 space-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
          <li className="flex items-center gap-2">
            <CalendarDays className="size-3.5" />
            Parceiro abre na Agenda
          </li>
          <li className="flex items-center gap-2">
            <ClipboardList className="size-3.5" />
            Solicitações com aceitar/recusar
          </li>
          <li className="flex items-center gap-2">
            <Plus className="size-3.5" />
            Cadastro de espaço = fluxo mock
          </li>
        </ul>
      </div>
    </div>
  );
}
