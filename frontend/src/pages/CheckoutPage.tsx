import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import { api } from "../services/api";

type Reservation = {
  id: string;
  quantity: number;
  totalCents: number;
  status: "PENDING" | "PAID" | "PAYMENT_FAILED" | "CANCELLED";
  event: {
    id: string;
    title: string;
    imageUrl: string | null;
    startsAt: string;
    venueName: string;
    venueAddress: string | null;
    priceCents: number;
  };
};

function money(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value / 100);
}

export function CheckoutPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadReservation() {
      try {
        const { data } = await api.get<Reservation>(
          `/reservations/${id}`,
        );

        setReservation(data);
      } catch {
        setError("Não foi possível carregar esta reserva.");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadReservation();
    }
  }, [id]);

  async function processPayment(result: "APPROVED" | "DECLINED") {
    if (!reservation) return;

    try {
      setProcessing(true);
      setError("");

      await api.post(
        `/payments/reservations/${reservation.id}/pay`,
        { result },
      );

      if (result === "APPROVED") {
        navigate("/tickets", {
          state: {
            paymentApproved: true,
          },
        });

        return;
      }

      setReservation({
        ...reservation,
        status: "PAYMENT_FAILED",
      });
    } catch (requestError) {
      if (axios.isAxiosError(requestError)) {
        setError(
          requestError.response?.data?.message ??
            "Não foi possível processar o pagamento.",
        );
      } else {
        setError("Não foi possível processar o pagamento.");
      }
    } finally {
      setProcessing(false);
    }
  }

  if (loading) {
    return <main className="checkout-state">CARREGANDO RESERVA...</main>;
  }

  if (!reservation) {
    return (
      <main className="checkout-state">
        <p>{error || "Reserva não encontrada."}</p>
        <Link to="/">VOLTAR PARA PROGRAMAÇÃO</Link>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <header className="details-header">
        <Link to="/" className="brand">
          ELITE<span>/TICKETS</span>
        </Link>

        <span className="checkout-step">02 / PAGAMENTO</span>
      </header>

      <section className="checkout-layout">
        <div className="checkout-copy">
          <p className="eyebrow">RESERVA CONFIRMADA</p>

          <h1>
            ÚLTIMO PASSO
            <br />
            ANTES DA SESSÃO.
          </h1>

          <p>
            A cobrança abaixo é simulada. Escolha aprovação ou recusa
            para testar os dois caminhos do checkout.
          </p>
        </div>

        <aside className="checkout-ticket">
          <div className="checkout-event">
            {reservation.event.imageUrl && (
              <img
                src={reservation.event.imageUrl}
                alt={reservation.event.title}
              />
            )}

            <div>
              <span>EVENTO</span>
              <h2>{reservation.event.title}</h2>
              <p>{reservation.event.venueName}</p>
            </div>
          </div>

          <div className="checkout-row">
            <span>INGRESSOS</span>
            <strong>{reservation.quantity}</strong>
          </div>

          <div className="checkout-row">
            <span>VALOR UNITÁRIO</span>
            <strong>{money(reservation.event.priceCents)}</strong>
          </div>

          <div className="checkout-total">
            <span>TOTAL</span>
            <strong>{money(reservation.totalCents)}</strong>
          </div>

          {reservation.status === "PENDING" ? (
            <>
              {error && <p className="details-error">{error}</p>}

              <button
                type="button"
                className="approve-payment"
                disabled={processing}
                onClick={() => processPayment("APPROVED")}
              >
                APROVAR PAGAMENTO
                <span>→</span>
              </button>

              <button
                type="button"
                className="decline-payment"
                disabled={processing}
                onClick={() => processPayment("DECLINED")}
              >
                SIMULAR RECUSA
              </button>
            </>
          ) : (
            <div className="payment-declined">
              <span>PAGAMENTO RECUSADO</span>
              <p>
                A reserva foi encerrada e os ingressos voltaram para o
                estoque.
              </p>

              <Link to={`/events/${reservation.event.id}`}>
                VOLTAR AO EVENTO →
              </Link>
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}
