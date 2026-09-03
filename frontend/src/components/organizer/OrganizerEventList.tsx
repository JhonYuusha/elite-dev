import { motion } from "motion/react";
import type { UpdateEventInput } from "../../services/event.service";
import type { OrganizerEvent } from "../../types/event";
import { EmptyState } from "../ui/EmptyState";
import { OrganizerEventRow } from "./OrganizerEventRow";

type OrganizerEventListProps = {
  events: OrganizerEvent[];
  onEventUpdate: (
    eventId: string,
    input: UpdateEventInput,
  ) => Promise<OrganizerEvent>;
};

export function OrganizerEventList({
  events,
  onEventUpdate,
}: OrganizerEventListProps) {
  return (
    <section className="organizer-events">
      <div className="section-heading organizer-events-heading">
        <div>
          <p>PROGRAMAÇÃO ATIVA</p>
          <strong>SESSÕES PUBLICADAS</strong>
        </div>

        <span>{String(events.length).padStart(2, "0")} SESSÕES</span>
      </div>

      {events.length === 0 ? (
        <EmptyState
          title="Nenhuma sessão publicada"
          message="Escolha um filme no catálogo e configure sua primeira sessão."
        />
      ) : (
        <motion.div
          className="organizer-event-list"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.07 } },
          }}
        >
          {events.map((event, index) => (
            <OrganizerEventRow
              key={event.id}
              event={event}
              index={index}
              onUpdate={onEventUpdate}
            />
          ))}
        </motion.div>
      )}
    </section>
  );
}