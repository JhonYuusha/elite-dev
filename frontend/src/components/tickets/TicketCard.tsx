import { useState } from "react";
import { motion } from "motion/react";

import type {
  TicketWithQr,
} from "../../hooks/tickets/useMyTickets";
import type {
  TicketSeatType,
} from "../../services/ticket.service";

import {
  editorialEase,
} from "../../lib/motion";
import {
  formatDate,
} from "../../utils/date";

type TicketCardProps = {
  ticket: TicketWithQr;
};

function getStatusLabel(
  status: TicketWithQr["status"],
) {
  if (status === "VALID") {
    return "VÁLIDO";
  }

  if (status === "USED") {
    return "UTILIZADO";
  }

  return "CANCELADO";
}

function getSeatTypeLabel(
  type: TicketSeatType | undefined,
) {
  if (!type) {
    return null;
  }

  if (type === "VIP") {
    return "VIP";
  }

  if (type === "ACCESSIBLE") {
    return "ACESSÍVEL";
  }

  if (type === "COMPANION") {
    return "ACOMPANHANTE";
  }

  return "PADRÃO";
}

export function TicketCard({
  ticket,
}: TicketCardProps) {
  const [
    copiedShare,
    setCopiedShare,
  ] = useState(false);

  const [
    copiedManualCode,
    setCopiedManualCode,
  ] = useState(false);

  const seatTypeLabel =
    getSeatTypeLabel(
      ticket.seat?.type,
    );

  async function copyManualCode() {
    await navigator.clipboard.writeText(
      ticket.id,
    );

    setCopiedManualCode(true);

    window.setTimeout(() => {
      setCopiedManualCode(false);
    }, 2000);
  }

  async function shareTicket() {
    if (!ticket.shareToken) {
      return;
    }

    const url =
      `${window.location.origin}/shared/${ticket.shareToken}`;

    await navigator.clipboard.writeText(
      url,
    );

    setCopiedShare(true);

    window.setTimeout(() => {
      setCopiedShare(false);
    }, 2000);
  }

  return (
    <motion.article
      className={`ticket ticket-${ticket.status.toLowerCase()}`}
      variants={{
        hidden: {
          opacity: 0,
          y: 22,
        },

        visible: {
          opacity: 1,
          y: 0,

          transition: {
            duration: 0.55,
            ease: editorialEase,
          },
        },
      }}
    >
      <div className="ticket-main">
        <div>
          <span className="ticket-label">
            ELITE / ADMISSÃO
          </span>

          <h2>
            {ticket.event.title}
          </h2>

          <p className="ticket-date">
            {formatDate(
              ticket.event.startsAt,
            )}
          </p>

          <div className="ticket-details">
            <div className="ticket-place">
              <span>
                LOCAL
              </span>

              <strong>
                {ticket.event.venueName}
              </strong>

              {ticket.event
                .venueAddress && (
                <p>
                  {
                    ticket.event
                      .venueAddress
                  }
                </p>
              )}
            </div>

            <div className="ticket-seat">
              <span>
                ASSENTO
              </span>

              <strong>
                {ticket.seat?.label ??
                  "—"}
              </strong>

              {seatTypeLabel && (
                <p>
                  {seatTypeLabel}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="ticket-status">
          {getStatusLabel(
            ticket.status,
          )}
        </div>
      </div>

      <div className="ticket-stub">
        <img
          src={ticket.qrImage}
          alt={`QR Code do ingresso para ${ticket.event.title}`}
        />

        <span className="ticket-code">
          {ticket.id
            .slice(0, 8)
            .toUpperCase()}
        </span>

        <small className="ticket-code-help">
          Código visual
        </small>

        {ticket.status ===
          "VALID" && (
          <>
            <button
              type="button"
              onClick={
                copyManualCode
              }
            >
              {copiedManualCode
                ? "CÓDIGO MANUAL COPIADO ✓"
                : "COPIAR CÓDIGO PARA PORTARIA"}
            </button>

            {ticket.shareToken && (
              <button
                type="button"
                onClick={
                  shareTicket
                }
              >
                {copiedShare
                  ? "LINK COPIADO ✓"
                  : "COMPARTILHAR INGRESSO ↗"}
              </button>
            )}
          </>
        )}
      </div>
    </motion.article>
  );
}