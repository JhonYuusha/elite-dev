import { useState } from "react";
import { motion } from "motion/react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { LoadingState } from "../components/ui/LoadingState";
import { useAuth } from "../context/useAuth";
import { useEventDetails } from "../hooks/events/useEventDetails";
import { useReservation } from "../hooks/reservations/useReservation";
import { editorialEase } from "../lib/motion";
import { formatLongDate } from "../utils/date";
import { formatMoney } from "../utils/money";

import "../styles/event-details-v2.css";

const MAX_TICKETS_PER_RESERVATION = 6;

export function EventDetailsPage() {
  const { id } = useParams<{
    id: string;
  }>();

  const navigate = useNavigate();
  const { user } = useAuth();

  const [quantity, setQuantity] =
    useState(1);

  const eventQuery = useEventDetails(id);
  const reservation = useReservation();

  const event = eventQuery.data;

  function decreaseQuantity() {
    setQuantity((current) =>
      Math.max(1, current - 1),
    );
  }

  function increaseQuantity() {
    if (!event) {
      return;
    }

    const limit = Math.min(
      event.availableTickets,
      MAX_TICKETS_PER_RESERVATION,
    );

    setQuantity((current) =>
      Math.min(limit, current + 1),
    );
  }

  async function handleReservation() {
    if (!event) {
      return;
    }

    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "CLIENT") {
      return;
    }

    try {
      const createdReservation =
        await reservation.mutateAsync({
          eventId: event.id,
          quantity,
        });

      navigate(
        `/checkout/${createdReservation.id}`,
      );
    } catch {
      // O erro é exposto pelo estado da mutation.
    }
  }

  if (eventQuery.isPending) {
    return (
      <main className="event-details-v2-page">
        <DetailsHeader />

        <section className="event-details-v2-loading">
          <LoadingState variant="event" />
        </section>
      </main>
    );
  }

  if (eventQuery.isError || !event) {
    return (
      <main className="event-details-v2-page">
        <DetailsHeader />

        <section className="event-details-v2-state">
          <p>PROGRAMAÇÃO / ERRO</p>

          <h1>
            SESSÃO
            <br />
            NÃO ENCONTRADA.
          </h1>

          <span>
            {eventQuery.error instanceof Error
              ? eventQuery.error.message
              : "Não foi possível carregar esta sessão."}
          </span>

          <Link to="/">
            ← VOLTAR PARA PROGRAMAÇÃO
          </Link>
        </section>
      </main>
    );
  }

  const soldOut =
    event.availableTickets <= 0;

  const totalCents =
    event.priceCents * quantity;

  const reservationError =
    reservation.error instanceof Error
      ? reservation.error.message
      : "";

  return (
    <main className="event-details-v2-page">
      <DetailsHeader />

      <motion.section
        className="event-details-v2-layout"
        initial={{
          opacity: 0,
          y: 24,
        }}
        animate={{
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.65,
            ease: editorialEase,
          },
        }}
      >
        <aside className="event-details-v2-visual">
          <div className="event-details-v2-index">
            <span>EXIBIÇÃO</span>
            <strong>
              / {event.id.slice(0, 4)}
            </strong>
          </div>

          <div className="event-details-v2-poster">
            {event.imageUrl ? (
              <img
                src={event.imageUrl}
                alt={`Pôster de ${event.title}`}
              />
            ) : (
              <div className="event-details-v2-poster-empty">
                <span>ELITE / TICKETS</span>
                <strong>SEM PÔSTER</strong>
              </div>
            )}
          </div>

          <div className="event-details-v2-poster-meta">
            <span>SESSÃO PROGRAMADA</span>

            <span>
              {String(
                event.availableTickets,
              ).padStart(2, "0")}{" "}
              LUGARES
            </span>
          </div>
        </aside>

        <div className="event-details-v2-content">
          <div className="event-details-v2-heading">
            <p>
              {formatLongDate(
                event.startsAt,
              )}
            </p>

            <div className="event-details-v2-title-mask">
              <h1>{event.title}</h1>
            </div>
          </div>

          <div className="event-details-v2-information">
            <div className="event-details-v2-description">
              <span>SOBRE / SESSÃO</span>

              <p>
                {event.description ||
                  "Informações adicionais desta sessão não estão disponíveis."}
              </p>
            </div>

            <div className="event-details-v2-location">
              <div>
                <span>LOCAL</span>
                <strong>
                  {event.venueName}
                </strong>
              </div>

              {event.venueAddress && (
                <p>
                  {event.venueAddress}
                </p>
              )}
            </div>
          </div>

          <section className="event-details-v2-purchase">
            <div className="event-details-v2-purchase-heading">
              <div>
                <span>INGRESSOS / SESSÃO</span>

                <strong>
                  {formatMoney(
                    event.priceCents,
                  )}
                </strong>
              </div>

              <p>
                {soldOut
                  ? "SESSÃO ESGOTADA"
                  : `${event.availableTickets} DISPONÍVEIS`}
              </p>
            </div>

            {soldOut ? (
              <div className="event-details-v2-sold-out">
                <span>ESGOTADO / 00</span>

                <strong>
                  NÃO HÁ MAIS
                  <br />
                  LUGARES.
                </strong>

                <p>
                  Todos os ingressos desta
                  sessão já foram reservados.
                </p>
              </div>
            ) : (
              <>
                <div className="event-details-v2-reservation">
                  <div className="event-details-v2-quantity">
                    <span>QUANTIDADE</span>

                    <div>
                      <button
                        type="button"
                        aria-label="Diminuir quantidade"
                        disabled={
                          quantity <= 1
                        }
                        onClick={
                          decreaseQuantity
                        }
                      >
                        −
                      </button>

                      <strong>
                        {String(
                          quantity,
                        ).padStart(
                          2,
                          "0",
                        )}
                      </strong>

                      <button
                        type="button"
                        aria-label="Aumentar quantidade"
                        disabled={
                          quantity >=
                          Math.min(
                            event.availableTickets,
                            MAX_TICKETS_PER_RESERVATION,
                          )
                        }
                        onClick={
                          increaseQuantity
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="event-details-v2-total">
                    <span>TOTAL</span>

                    <strong>
                      {formatMoney(
                        totalCents,
                      )}
                    </strong>
                  </div>
                </div>

                {reservationError && (
                  <p className="event-details-v2-error">
                    {reservationError}
                  </p>
                )}

                {!user && (
                  <div className="event-details-v2-access">
                    <div>
                      <span>
                        AUTENTICAÇÃO /
                        NECESSÁRIA
                      </span>

                      <p>
                        Entre como cliente
                        para continuar com a
                        reserva.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        navigate("/login")
                      }
                    >
                      <span>FAZER LOGIN</span>
                      <span>↗</span>
                    </button>
                  </div>
                )}

                {user &&
                  user.role !==
                    "CLIENT" && (
                    <div className="event-details-v2-access">
                      <div>
                        <span>
                          CONTA /{" "}
                          {user.role}
                        </span>

                        <p>
                          A compra de
                          ingressos é
                          exclusiva para
                          contas de cliente.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            "/login",
                          )
                        }
                      >
                        <span>
                          TROCAR CONTA
                        </span>

                        <span>↗</span>
                      </button>
                    </div>
                  )}

                {user?.role ===
                  "CLIENT" && (
                  <button
                    type="button"
                    className="event-details-v2-reserve"
                    disabled={
                      reservation.isPending
                    }
                    onClick={
                      handleReservation
                    }
                  >
                    <span>
                      {reservation.isPending
                        ? "RESERVANDO..."
                        : "RESERVAR INGRESSOS"}
                    </span>

                    <span>↗</span>
                  </button>
                )}
              </>
            )}
          </section>
        </div>
      </motion.section>
    </main>
  );
}

function DetailsHeader() {
  return (
    <header className="event-details-v2-header">
      <Link
        to="/"
        className="brand"
      >
        ELITE
        <span>/TICKETS</span>
      </Link>

      <div className="event-details-v2-header-meta">
        <span>
          PROGRAMAÇÃO / DETALHES
        </span>

        <Link to="/">
          ← VOLTAR
        </Link>
      </div>
    </header>
  );
}