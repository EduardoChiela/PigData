import { createFileRoute, redirect } from "@tanstack/react-router";
import { AcitOrganizerPanel } from "@/components/acit-organizer-panel";
import { APP_NAME } from "@/lib/mock-data";
import { getActiveMockUser, isMockAuthenticated } from "@/lib/mock-session";

export const Route = createFileRoute("/painel-acit")({
  beforeLoad: () => {
    if (!isMockAuthenticated()) {
      throw redirect({ to: "/entrar" });
    }
    const user = getActiveMockUser();
    if (!user || user.role !== "organizador") {
      throw redirect({ to: "/" });
    }
  },
  head: () => ({
    meta: [{ title: `Painel ACIT — ${APP_NAME}` }],
  }),
  component: PainelAcitPage,
});

function PainelAcitPage() {
  const user = getActiveMockUser();
  if (!user) return null;
  return <AcitOrganizerPanel user={user} />;
}
