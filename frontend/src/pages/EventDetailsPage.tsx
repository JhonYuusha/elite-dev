import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import type { Event } from "../types/event";

function formatPrice(priceCents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(priceCents / 100);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

type ReservationResponse = {
  id: string;
  quantity: number;
  totalCents: number;
  status: string;
};

export function EventDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadEvent() {
      try {
        const { data } = await api.get<Event>(`/events/${id}`);
        setEvent(data);
      } catch {
        setError("Evento não encontrado.");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadEvent();
    }
  }, [id]);

  async function handleReservation() {
    if (!event) {
      return;
    }

    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "CLIENT") {
      setError("Entre com uma conta de cliente para reservar ingressos.");
      return;
    }

    try {
      setReserving(true);
      setError("");

      const { data } = await api.post<ReservationResponse>("/reservations", {
        eventId: event.id,
        quantity,
      });

      navigate(`/checkout/${data.id}`);
    } catch (requestError) {
      if (axios.isAxiosError(requestError)) {
        setError(
          requestError.response?.data?.message ??
            "Não foi possível realizar a reserva.",
        );
      } else {
        setError("Não foi possível realizar a reserva.");
      }
    } finally {
      setReserving(false);
    }
  }

  if (loading) {
    return (
      <main className="details-state">
        <p>CARREGANDO SESSÃO...</p>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="details-state">
        <p>EVENTO NÃO ENCONTRADO</p>
        <Link to="/">Voltar para programação</Link>
      </main>
    );
  }

  const soldOut = event.availableTickets <= 0;

  return (
    <main className="event-details-page">
      <header className="details-header">
        <Link to="/" className="brand">
          ELITE<span>/TICKETS</span>
        </Link>

        <Link to="/" className="back-link">
          ← PROGRAMAÇÃO
        </Link>
      </header>

      <section className="event-details">
        <div className="details-poster">
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt={`Pôster de ${event.title}`}
            />
          ) : (
            <div className="poster-placeholder">
              <span>SEM PÔSTER</span>
            </div>
          )}
        </div>

        <div className="details-content">
          <p className="details-date">
            {formatDate(event.startsAt)}
          </p>

          <h1>{event.title}</h1>

          <p className="details-description">
            {event.description ||
              "Informações da sessão não disponíveis."}
          </p>

          <div className="details-location">
            <span>ONDE</span>

            <strong>{event.venueName}</strong>

            {event.venueAddress && (
              <p>{event.venueAddress}</p>
            )}
          </div>

          <div className="ticket-selector">
            <div className="ticket-selector-heading">
              <div>
                <span>INGRESSO / PISTA</span>
                <strong>{formatPrice(event.priceCents)}</strong>
              </div>

              <p>{event.availableTickets} disponíveis</p>
            </div>

            {!soldOut && (
              <>
                <div className="quantity-control">
                  <button
                    type="button"
                    aria-label="Diminuir quantidade"
                    onClick={() =>
                      setQuantity((current) =>
                        Math.max(1, current - 1),
                      )
                    }
                  >
                    −
                  </button>

                  <strong>{quantity}</strong>

                  <button
                    type="button"
                    aria-label="Aumentar quantidade"
                    onClick={() =>
                      setQuantity((current) =>
                        Math.min(
                          Math.min(event.availableTickets, 6),
                          current + 1,
                        ),
                      )
                    }
                  >
                    +
                  </button>
                </div>

                <div className="reservation-total">
                  <span>TOTAL</span>

                  <strong>
                    {formatPrice(
                      event.priceCents * quantity,
                    )}
                  </strong>
                </div>

                {error && (
                  <p className="details-error">
                    {error}
                  </p>
                )}

                {!user && (
                  <div className="login-hint">
                    <span>QUER RESERVAR?</span>

                    <p>
                      Entre como cliente para continuar com a compra.
                    </p>

                    <button
                      type="button"
                      onClick={() => navigate("/login")}
                    >
                      FAZER LOGIN →
                    </button>
                  </div>
                )}

                {user && user.role !== "CLIENT" && (
                  <div className="login-hint">
                    <span>CONTA DE {user.role}</span>

                    <p>
                      Para comprar ingressos, entre com uma conta de cliente.
                    </p>

                    <button
                      type="button"
                      onClick={() => navigate("/login")}
                    >
                      TROCAR DE CONTA →
                    </button>
                  </div>
                )}

                {user?.role === "CLIENT" && (
                  <button
                    type="button"
                    className="reserve-button"
                    disabled={reserving}
                    onClick={handleReservation}
                  >
                    <span>
                      {reserving
                        ? "RESERVANDO..."
                        : "RESERVAR INGRESSOS"}
                    </span>

                    <span>→</span>
                  </button>
                )}
              </>
            )}

            {soldOut && (
              <div className="sold-out">
                <span>ESGOTADO</span>

                <p>
                  Não há mais ingressos disponíveis para esta sessão.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}