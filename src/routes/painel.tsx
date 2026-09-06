import { createFileRoute, redirect } from "@tanstack/react-router";
import { OwnerPanel } from "@/components/owner-panel";
import { APP_NAME } from "@/lib/mock-data";
import { getActiveMockUser, isMockAuthenticated } from "@/lib/mock-session";

export const Route = createFileRoute("/painel")({
  beforeLoad: () => {
    if (!isMockAuthenticated()) {
      throw redirect({ to: "/entrar" });
    }
    const user = getActiveMockUser();
    if (!user || user.role !== "parceiro") {
      throw redirect({ to: "/" });
    }
  },
  head: () => ({
    meta: [{ title: `Painel do parceiro — ${APP_NAME}` }],
  }),
  component: PainelPage,
});

function PainelPage() {
  const user = getActiveMockUser();
  if (!user) return null;
  return <OwnerPanel user={user} />;
}
