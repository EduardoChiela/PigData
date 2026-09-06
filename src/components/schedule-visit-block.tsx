import { MessageCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Space } from "@/lib/mock-data";
import { getSpaceWhatsAppUrl, registerVisitRequest } from "@/lib/visit-request";

export function ScheduleVisitBlock({
  space,
  onScheduled,
}: {
  space: Space;
  onScheduled?: () => void;
}) {
  const [skipped, setSkipped] = useState(false);

  function onYes() {
    registerVisitRequest(space.slug);
    onScheduled?.();
    const url = getSpaceWhatsAppUrl(space);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  if (skipped) {
    return (
      <p className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        Sem visita por agora — você pode seguir com a data do evento. Visita
        continua disponível depois pelo WhatsApp do espaço.
      </p>
    );
  }

  return (
    <section className="rounded-2xl border-2 border-[var(--leaf)]/50 bg-[color-mix(in_oklab,var(--leaf)_18%,white)] p-5 shadow-[0_12px_40px_-28px_rgba(20,40,30,0.45)]">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[var(--forest)]">
        Antes de solicitar
      </p>
      <h3 className="mt-1 font-display text-xl font-semibold tracking-tight text-[var(--ink)] md:text-2xl">
        Gostaria de agendar uma visita?
      </h3>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--ink)]/75">
        Quer conhecer o espaço pessoalmente? Registramos o interesse e abrimos o
        WhatsApp do proprietário com uma mensagem pronta — o horário combinam
        vocês na conversa.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="button"
          size="lg"
          className="bg-[var(--ink)] font-semibold text-white hover:bg-[var(--ink-soft)]"
          onClick={onYes}
        >
          <MessageCircle className="size-4" />
          Sim, agendar visita
        </Button>
        <Button
          type="button"
          size="lg"
          variant="outline"
          className="font-semibold"
          onClick={() => setSkipped(true)}
        >
          Agora não
        </Button>
      </div>
    </section>
  );
}
