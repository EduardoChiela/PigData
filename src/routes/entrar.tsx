import { createFileRoute, redirect } from "@tanstack/react-router";
import { LoginPage } from "@/components/login-page";
import { APP_NAME } from "@/lib/mock-data";
import {
  getActiveMockUser,
  homePathForRole,
  isMockAuthenticated,
} from "@/lib/mock-session";

export const Route = createFileRoute("/entrar")({
  beforeLoad: () => {
    if (isMockAuthenticated()) {
      const user = getActiveMockUser();
      throw redirect({
        to: user ? homePathForRole(user.role) : "/",
      });
    }
  },
  head: () => ({
    meta: [{ title: `Entrar — ${APP_NAME}` }],
  }),
  component: LoginPage,
});
