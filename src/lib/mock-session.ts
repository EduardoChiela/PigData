/** Sessão mock — login real fica para depois. */

export type MockUser = {
  name: string;
  email: string;
  roleLabel: string;
  initials: string;
};

export const MOCK_USER: MockUser = {
  name: "Ana Ribeiro",
  email: "ana.ribeiro@email.com",
  roleLabel: "Cliente",
  initials: "AR",
};

const STORAGE_KEY = "agora.mock.auth";

/** Protótipo: usuário logado por padrão (mapa como home). */
const DEFAULT_AUTHENTICATED = true;

export function isMockAuthenticated(): boolean {
  if (typeof window === "undefined") return DEFAULT_AUTHENTICATED;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "0") return false;
  if (stored === "1") return true;
  return DEFAULT_AUTHENTICATED;
}

export function setMockAuthenticated(value: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
}
