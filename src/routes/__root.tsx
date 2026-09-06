import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
  useRouterState,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { APP_NAME } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import appCss from "@/styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        title: `${APP_NAME} — espaços livres em Toledo - PR`,
      },
      {
        name: "description",
        content:
          "Encontre espaços para eventos disponíveis por data e período. Rede ACIT em Toledo - PR.",
      },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  component: RootComponent,
});

function RootComponent() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const mapFullscreen = pathname.startsWith("/buscar");

  return (
    <RootDocument>
      <div id="app" className={cn(mapFullscreen && "h-dvh overflow-hidden")}>
        <SiteHeader />
        <main className={cn("flex-1", mapFullscreen && "min-h-0")}>
          <Outlet />
        </main>
        {mapFullscreen ? null : <SiteFooter />}
      </div>
    </RootDocument>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
