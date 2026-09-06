/** Sessão mock — login real fica para depois. */

export type MockRole = "cliente" | "parceiro";

export type MockUser = {
  id: string;
  name: string;
  email: string;
  role: MockRole;
  roleLabel: string;
  initials: string;
  /** Slugs dos espaços do parceiro (só role parceiro) */
  spaceSlugs?: string[];
  password: string;
};

export const MOCK_ACCOUNTS: MockUser[] = [
  {
    id: "cli-ana",
    name: "Ana Ribeiro",
    email: "ana.ribeiro@email.com",
    role: "cliente",
    roleLabel: "Cliente",
    initials: "AR",
    password: "demo",
  },
  {
    id: "par-vila",
    name: "Marcos Oliveira",
    email: "parceiro@acit.toledo.br",
    role: "parceiro",
    roleLabel: "Parceiro ACIT",
    initials: "MO",
    spaceSlugs: ["vila-verde", "salao-corujas"],
    password: "demo",
  },
];

const AUTH_KEY = "agora.mock.auth";
const USER_KEY = "agora.mock.userId";

/** Protótipo: deslogado por padrão — usar /entrar. */
const DEFAULT_AUTHENTICATED = false;
const DEFAULT_USER_ID = MOCK_ACCOUNTS[0]!.id;

export function getMockUserById(id: string) {
  return MOCK_ACCOUNTS.find((a) => a.id === id);
}

export function getMockSession(): MockUser | null {
  if (!isMockAuthenticated()) return null;
  if (typeof window === "undefined") {
    return getMockUserById(DEFAULT_USER_ID) ?? null;
  }
  const id = window.localStorage.getItem(USER_KEY) ?? DEFAULT_USER_ID;
  return getMockUserById(id) ?? null;
}

export function isMockAuthenticated(): boolean {
  if (typeof window === "undefined") return DEFAULT_AUTHENTICATED;
  const stored = window.localStorage.getItem(AUTH_KEY);
  if (stored === "0") return false;
  if (stored === "1") return true;
  return DEFAULT_AUTHENTICATED;
}

export function setMockAuthenticated(value: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_KEY, value ? "1" : "0");
  if (!value) window.localStorage.removeItem(USER_KEY);
}

export function loginMock(email: string, password: string): MockUser | null {
  const account = MOCK_ACCOUNTS.find(
    (a) => a.email.toLowerCase() === email.trim().toLowerCase(),
  );
  if (!account || account.password !== password) return null;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(AUTH_KEY, "1");
    window.localStorage.setItem(USER_KEY, account.id);
  }
  return account;
}

export function loginAsMock(userId: string): MockUser | null {
  const account = getMockUserById(userId);
  if (!account) return null;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(AUTH_KEY, "1");
    window.localStorage.setItem(USER_KEY, account.id);
  }
  return account;
}

/** Cadastro mock: cria conta leve em localStorage e entra. */
export function registerMock(input: {
  name: string;
  email: string;
  role: MockRole;
}): MockUser {
  const initials = input.name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
  const user: MockUser = {
    id: `reg-${Date.now()}`,
    name: input.name.trim() || "Novo usuário",
    email: input.email.trim().toLowerCase(),
    role: input.role,
    roleLabel: input.role === "parceiro" ? "Parceiro ACIT" : "Cliente",
    initials: initials || "NU",
    password: "demo",
    spaceSlugs:
      input.role === "parceiro" ? ["vila-verde", "salao-corujas"] : undefined,
  };
  if (typeof window !== "undefined") {
    const raw = window.localStorage.getItem("agora.mock.extraUsers");
    const extra: MockUser[] = raw ? (JSON.parse(raw) as MockUser[]) : [];
    extra.push(user);
    window.localStorage.setItem("agora.mock.extraUsers", JSON.stringify(extra));
    window.localStorage.setItem(AUTH_KEY, "1");
    window.localStorage.setItem(USER_KEY, user.id);
  }
  return user;
}

export function resolveMockUser(id: string): MockUser | null {
  const base = getMockUserById(id);
  if (base) return base;
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("agora.mock.extraUsers");
    const extra: MockUser[] = raw ? (JSON.parse(raw) as MockUser[]) : [];
    return extra.find((u) => u.id === id) ?? null;
  } catch {
    return null;
  }
}

/** Preferir resolveMockUser na UI — inclui contas cadastradas no mock. */
export function getActiveMockUser(): MockUser | null {
  if (!isMockAuthenticated()) return null;
  if (typeof window === "undefined") {
    return getMockUserById(DEFAULT_USER_ID) ?? null;
  }
  const id = window.localStorage.getItem(USER_KEY) ?? DEFAULT_USER_ID;
  return resolveMockUser(id);
}

export function homePathForRole(role: MockRole): "/" | "/painel" {
  return role === "parceiro" ? "/painel" : "/";
}

/** @deprecated use getActiveMockUser */
export const MOCK_USER = MOCK_ACCOUNTS[0]!;
