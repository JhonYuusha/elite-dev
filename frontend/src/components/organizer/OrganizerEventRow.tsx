import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { editorialEase } from "../../lib/motion";
import type { UpdateEventInput } from "../../services/event.service";
import type { OrganizerEvent } from "../../types/event";
import { formatDate } from "../../utils/date";
import {
  formatMoney,
  formatMoneyInput,
  parseMoneyToCents,
} from "../../utils/money";

type OrganizerEventRowProps = {
  event: OrganizerEvent;
  index: number;
  onUpdate: (
    eventId: string,
    input: UpdateEventInput,
  ) => Promise<OrganizerEvent>;
};

export function OrganizerEventRow({
  event,
  index,
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

  const occupied = event.capacity - event.availableTickets;

  return (
    <motion.article
      className={`organizer-event-row ${editing ? "is-editing" : ""}`}
      variants={{
        hidden: {
          opacity: 0,
          y: 20,
        },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.5,
            ease: editorialEase,
          },
        },
      }}
    >
      <div className="organizer-event-main">
        <span className="organizer-event-index">
          {String(index + 1).padStart(2, "0")}
        </span>

        <div className="organizer-event-poster">
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt={`Pôster de ${event.title}`}
            />
          ) : (
            <div className="catalog-no-poster">
              SEM PÔSTER
            </div>
          )}
        </div>

        <div className="organizer-event-title">
          <span>{formatDate(event.startsAt)}</span>
          <strong>{event.title}</strong>
          <p>{event.venueName}</p>
        </div>

        <div className="organizer-event-stat">
          <span>OCUPAÇÃO</span>
          <strong>
            {occupied}
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

        {!editing ? (
          <button
            type="button"
            className="manage-event-button"
            onClick={startEditing}
          >
            <span>GERENCIAR</span>
            <span>↗</span>
          </button>
        ) : (
          <span
            className="organizer-event-open-label"
            aria-hidden="true"
          >
            EM AJUSTE
          </span>
        )}
      </div>

      <AnimatePresence initial={false}>
        {editing && (
          <motion.div
            className="organizer-event-editor"
            initial={{
              height: 0,
              opacity: 0,
            }}
            animate={{
              height: "auto",
              opacity: 1,
              transition: {
                height: {
                  duration: 0.42,
                  ease: editorialEase,
                },
                opacity: {
                  delay: 0.1,
                  duration: 0.25,
                },
              },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: {
                height: {
                  duration: 0.35,
                  ease: editorialEase,
                },
                opacity: {
                  duration: 0.18,
                },
              },
            }}
          >
            <div className="organizer-editor-inner">
              <div className="organizer-editor-header">
                <div className="organizer-editor-heading">
                  <span>AJUSTE / SESSÃO</span>

                  <p>
                    Altere o preço ou disponibilize novos lugares
                    sem recriar a programação.
                  </p>
                </div>

                <button
                  type="button"
                  className="organizer-close-button"
                  onClick={closeEditing}
                >
                  <span>FECHAR</span>
                  <span>×</span>
                </button>
              </div>

              <div className="organizer-editor-fields">
                <label>
                  <span>ADICIONAR LUGARES</span>

                  <input
                    type="number"
                    min="0"
                    value={addCapacity}
                    onChange={(event) =>
                      setAddCapacity(
                        Number(event.target.value),
                      )
                    }
                  />
                </label>

                <label>
                  <span>PREÇO / R$</span>

                  <input
                    type="text"
                    inputMode="decimal"
                    value={editPrice}
                    onChange={(event) =>
                      setEditPrice(event.target.value)
                    }
                  />
                </label>
              </div>

              <div className="organizer-editor-actions">
                <button
                  type="button"
                  className="organizer-save-button"
                  disabled={saving}
                  onClick={saveEvent}
                >
                  <span>
                    {saving
                      ? "SALVANDO..."
                      : "SALVAR ALTERAÇÕES"}
                  </span>

                  <span>↗</span>
                </button>
              </div>

              {(error || success) && (
                <p
                  className={
                    error
                      ? "organizer-error"
                      : "organizer-success"
                  }
                >
                  {error || success}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}