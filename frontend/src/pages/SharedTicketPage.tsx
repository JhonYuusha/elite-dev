import {
  Link,
  useParams,
} from "react-router-dom";

import {
  LoadingState,
} from "../components/ui/LoadingState";

import {
  useSharedTicket,
} from "../hooks/tickets/useSharedTicket";

import type {
  TicketSeatType,
  TicketStatus,
} from "../services/ticket.service";

import {
  formatLongDate,
} from "../utils/date";

import "../styles/shared-ticket-v2.css";

function getStatusLabel(
  status: TicketStatus,
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

export function SharedTicketPage() {
  const { token } = useParams<{
    token: string;
  }>();

  const {
    data: ticket,
    isLoading,
    isError,
    error,
    refetch,
  } = useSharedTicket(token);

  if (isLoading) {
    return (
      <main className="shared-ticket-page">
        <header className="details-header">
          <Link
            to="/"
            className="brand"
          >
            ELITE
            <span>/TICKETS</span>
          </Link>

          <span className="shared-header-label">
            INGRESSO COMPARTILHADO
          </span>
        </header>

        <section className="shared-ticket-layout">
          <LoadingState
            variant="sharedTicket"
          />
        </section>
      </main>
    );
  }

  if (
    isError ||
    !ticket
  ) {
    return (
      <main className="shared-ticket-state">
        <p className="eyebrow">
          LINK / INGRESSO
        </p>

        <h1>
          INGRESSO
          <br />
          INDISPONÍVEL.
        </h1>

        <p>
          {error instanceof Error
            ? error.message
            : "Este ingresso não está disponível."}
        </p>

        <div className="shared-ticket-state-actions">
          <button
            type="button"
            onClick={() => {
              void refetch();
            }}
          >
            TENTAR NOVAMENTE
          </button>

          <Link to="/">
            ← VOLTAR À PROGRAMAÇÃO
          </Link>
        </div>
      </main>
    );
  }

  const seatTypeLabel =
    getSeatTypeLabel(
      ticket.seat?.type,
    );

  return (
    <main className="shared-ticket-page">
      <header className="details-header">
        <Link
          to="/"
          className="brand"
        >
          ELITE
          <span>/TICKETS</span>
        </Link>

        <span className="shared-header-label">
          INGRESSO COMPARTILHADO
        </span>
      </header>

      <section className="shared-ticket-layout">
        <div className="shared-ticket-intro">
          <p className="eyebrow">
            ADMISSÃO / COMPARTILHADA
          </p>

          <h1>
            SEU LUGAR
            <br />
            ESTÁ AQUI.
          </h1>

          <p className="shared-ticket-explanation">
            Este link confirma os dados
            públicos do ingresso. A entrada
            continua sendo validada pela
            portaria da Elite.
          </p>

          <div className="shared-ticket-security">
            <span>
              LINK PÚBLICO
            </span>

            <p>
              O código de validação não é
              exposto nesta página.
            </p>
          </div>
        </div>

        <article
          className={`shared-ticket-card shared-ticket-${ticket.status.toLowerCase()}`}
        >
          <div className="shared-ticket-top">
            <span>
              ELITE / ADMISSÃO
            </span>

            <strong>
              {getStatusLabel(
                ticket.status,
              )}
            </strong>
          </div>

          <div className="shared-ticket-event">
            <p>
              {formatLongDate(
                ticket.event.startsAt,
              )}
            </p>

            <h2>
              {ticket.event.title}
            </h2>
          </div>

          <div className="shared-ticket-data">
            <div className="shared-ticket-field shared-ticket-location">
              <span>
                LOCAL
              </span>

              <strong>
                {
                  ticket.event
                    .venueName
                }
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

            <div className="shared-ticket-field">
              <span>
                ASSENTO
              </span>

              <strong className="shared-ticket-seat">
                {ticket.seat?.label ??
                  "—"}
              </strong>

              {seatTypeLabel && (
                <p>
                  {seatTypeLabel}
                </p>
              )}
            </div>

            <div className="shared-ticket-field">
              <span>
                PORTADOR
              </span>

              <strong>
                {ticket.ownerName}
              </strong>
            </div>
          </div>

          <div className="shared-ticket-footer">
            <span>
              INGRESSO
            </span>

            <code>
              {ticket.id
                .slice(0, 8)
                .toUpperCase()}
            </code>
          </div>
        </article>
      </section>
    </main>
  );
}