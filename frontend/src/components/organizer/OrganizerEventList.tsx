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
      <div className="section-heading">
        <p>SUAS SESSÕES</p>
        <span>{events.length} cadastradas</span>
      </div>

      {events.length === 0 ? (
        <EmptyState
          title="Nenhuma sessão publicada"
          message="Escolha um filme no catálogo e configure sua primeira sessão."
        />
      ) : (
        <div className="organizer-event-list">
          {events.map((event) => (
            <OrganizerEventRow
              key={event.id}
              event={event}
              onUpdate={onEventUpdate}
            />
          ))}
        </div>
      )}
    </section>
  );
}