import { useState } from "react";

import type { UpdateEventInput } from "../../services/event.service";
import type { OrganizerEvent } from "../../types/event";

import {
  formatMoney,
  formatMoneyInput,
  parseMoneyToCents,
} from "../../utils/money";

import { formatDate } from "../../utils/date";

type OrganizerEventRowProps = {
  event: OrganizerEvent;
  onUpdate: (
    eventId: string,
    input: UpdateEventInput,
  ) => Promise<OrganizerEvent>;
};

export function OrganizerEventRow({
  event,
  onUpdate,
}: OrganizerEventRowProps) {
  const [editing, setEditing] = useState(false);
  const [addCapacity, setAddCapacity] = useState(0);
  const [editPrice, setEditPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function startEditing() {
    setEditing(true);
    setAddCapacity(0);
    setEditPrice(formatMoneyInput(event.priceCents));
    setError("");
    setSuccess("");
  }

  function closeEditing() {
    setEditing(false);
    setAddCapacity(0);
    setError("");
    setSuccess("");
  }

  async function saveEvent() {
    const priceCents = parseMoneyToCents(editPrice);

    if (priceCents === null) {
      setError("Informe um preço válido.");
      return;
    }

    if (!Number.isInteger(addCapacity) || addCapacity < 0) {
      setError("Informe uma quantidade válida de novos lugares.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const updatedEvent = await onUpdate(event.id, {
        priceCents,
        ...(addCapacity > 0 && { addCapacity }),
      });

      setAddCapacity(0);
      setEditPrice(formatMoneyInput(updatedEvent.priceCents));
      setSuccess("Sessão atualizada com sucesso.");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar a sessão.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <article className="organizer-event-row">
      <div className="organizer-event-poster">
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.title} />
        ) : (
          <div className="catalog-no-poster">SEM PÔSTER</div>
        )}
      </div>

      <div className="organizer-event-title">
        <span>{formatDate(event.startsAt)}</span>
        <strong>{event.title}</strong>
        <p>{event.venueName}</p>
      </div>

      {editing ? (
        <div className="organizer-event-editor">
          <label>
            ADICIONAR LUGARES
            <input
              type="number"
              min="0"
              value={addCapacity}
              onChange={(event) =>
                setAddCapacity(Number(event.target.value))
              }
            />
          </label>

          <label>
            PREÇO
            <input
              type="text"
              value={editPrice}
              onChange={(event) => setEditPrice(event.target.value)}
            />
          </label>

          {error && <p className="organizer-error">{error}</p>}
          {success && <p className="organizer-success">{success}</p>}

          <button type="button" disabled={saving} onClick={saveEvent}>
            {saving ? "SALVANDO..." : "SALVAR"}
          </button>

          <button type="button" onClick={closeEditing}>
            FECHAR
          </button>
        </div>
      ) : (
        <>
          <div className="organizer-event-stat">
            <span>OCUPADOS</span>
            <strong>
              {event.capacity - event.availableTickets}
              <small> / {event.capacity}</small>
            </strong>
          </div>

          <div className="organizer-event-stat">
            <span>DISPONÍVEIS</span>
            <strong>{event.availableTickets}</strong>
          </div>

          <div className="organizer-event-stat">
            <span>PREÇO</span>
            <strong>{formatMoney(event.priceCents)}</strong>
          </div>

          <button
            type="button"
            className="manage-event-button"
            onClick={startEditing}
          >
            GERENCIAR
          </button>
        </>
      )}
    </article>
  );
}