import { motion } from "motion/react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { LoadingState } from "../components/ui/LoadingState";
import { usePayment } from "../hooks/payments/usePayment";
import { useReservationDetails } from "../hooks/reservations/useReservationDetails";
import { editorialEase } from "../lib/motion";
import { queryClient } from "../lib/query-client";
import { formatLongDate } from "../utils/date";
import { formatMoney } from "../utils/money";

import "../styles/checkout-v2.css";

export function CheckoutPage() {
  const { id } = useParams<{
    id: string;
  }>();

  const navigate = useNavigate();

  const reservationQuery =
    useReservationDetails(id);

  const payment = usePayment();

  const reservation =
    reservationQuery.data;

  async function processPayment(
    result:
      | "APPROVED"
      | "DECLINED",
  ) {
    if (!reservation) {
      return;
    }

    try {
      await payment.mutateAsync({
        reservationId:
          reservation.id,
        result,
      });

      if (result === "APPROVED") {
        await queryClient.invalidateQueries({
          queryKey: ["tickets"],
        });

        navigate("/tickets", {
          state: {
            paymentApproved: true,
          },
        });

        return;
      }

      queryClient.setQueryData(
        [
          "reservations",
          "details",
          reservation.id,
        ],
        {
          ...reservation,
          status: "PAYMENT_FAILED",
        },
      );
    } catch {
      // O erro é exibido pelo estado da mutation.
    }
  }

  if (reservationQuery.isPending) {
    return (
      <main className="checkout-v2-page">
        <CheckoutHeader />

        <section className="checkout-v2-loading">
          <LoadingState
            variant="checkout"
          />
        </section>
      </main>
    );
  }

  if (
    reservationQuery.isError ||
    !reservation
  ) {
    return (
      <main className="checkout-v2-page">
        <CheckoutHeader />

        <section className="checkout-v2-state">
          <p>RESERVA / ERRO</p>

          <h1>
            RESERVA
            <br />
            NÃO ENCONTRADA.
          </h1>

          <span>
            {reservationQuery.error instanceof
            Error
              ? reservationQuery.error
                  .message
              : "Não foi possível carregar esta reserva."}
          </span>

          <Link to="/">
            ← VOLTAR PARA PROGRAMAÇÃO
          </Link>
        </section>
      </main>
    );
  }

  const paymentError =
    payment.error instanceof Error
      ? payment.error.message
      : "";

  const isPending =
    reservation.status === "PENDING";

  return (
    <main className="checkout-v2-page">
      <CheckoutHeader />

      <motion.section
        className="checkout-v2-layout"
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
        <div className="checkout-v2-main">
          <div className="checkout-v2-intro">
            <p>
              RESERVA CONFIRMADA / 02
            </p>

            <h1>
              ÚLTIMO
              <br />
              PASSO.
            </h1>

            <span>
              Sua sessão está reservada
              temporariamente. Finalize a
              simulação de pagamento para
              emitir os ingressos.
            </span>
          </div>

          <div className="checkout-v2-session">
            <div className="checkout-v2-session-label">
              <span>
                SESSÃO / CONFIRMADA
              </span>

              <strong>
                #
                {reservation.id
                  .slice(0, 8)
                  .toUpperCase()}
              </strong>
            </div>

            <div className="checkout-v2-session-content">
              {reservation.event
                .imageUrl ? (
                <div className="checkout-v2-poster">
                  <img
                    src={
                      reservation.event
                        .imageUrl
                    }
                    alt={`Pôster de ${reservation.event.title}`}
                  />
                </div>
              ) : (
                <div className="checkout-v2-poster checkout-v2-poster-empty">
                  SEM PÔSTER
                </div>
              )}

              <div className="checkout-v2-event-copy">
                <span>
                  {formatLongDate(
                    reservation.event
                      .startsAt,
                  )}
                </span>

                <h2>
                  {
                    reservation.event
                      .title
                  }
                </h2>

                <div>
                  <strong>
                    {
                      reservation.event
                        .venueName
                    }
                  </strong>

                  {reservation.event
                    .venueAddress && (
                    <p>
                      {
                        reservation.event
                          .venueAddress
                      }
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="checkout-v2-summary">
          <div className="checkout-v2-summary-top">
            <div>
              <span>RESUMO / COMPRA</span>

              <strong>
                {String(
                  reservation.quantity,
                ).padStart(2, "0")}{" "}
                INGRESSOS
              </strong>
            </div>

            <span>
              {reservation.status}
            </span>
          </div>

          <div className="checkout-v2-row">
            <span>QUANTIDADE</span>

            <strong>
              {reservation.quantity}
            </strong>
          </div>

          <div className="checkout-v2-row">
            <span>
              VALOR UNITÁRIO
            </span>

            <strong>
              {formatMoney(
                reservation.event
                  .priceCents,
              )}
            </strong>
          </div>

          <div className="checkout-v2-row">
            <span>TAXAS</span>

            <strong>
              {formatMoney(0)}
            </strong>
          </div>

          <div className="checkout-v2-total">
            <span>TOTAL</span>

            <strong>
              {formatMoney(
                reservation.totalCents,
              )}
            </strong>
          </div>

          {isPending ? (
            <div className="checkout-v2-payment">
              <div className="checkout-v2-payment-heading">
                <span>
                  SIMULAÇÃO / PAGAMENTO
                </span>

                <p>
                  Escolha aprovação ou
                  recusa para testar os
                  dois caminhos da
                  aplicação.
                </p>
              </div>

              {paymentError && (
                <p className="checkout-v2-error">
                  {paymentError}
                </p>
              )}

              <button
                type="button"
                className="checkout-v2-approve"
                disabled={
                  payment.isPending
                }
                onClick={() =>
                  processPayment(
                    "APPROVED",
                  )
                }
              >
                <span>
                  {payment.isPending
                    ? "PROCESSANDO..."
                    : "APROVAR PAGAMENTO"}
                </span>

                <span>↗</span>
              </button>

              <button
                type="button"
                className="checkout-v2-decline"
                disabled={
                  payment.isPending
                }
                onClick={() =>
                  processPayment(
                    "DECLINED",
                  )
                }
              >
                <span>
                  SIMULAR RECUSA
                </span>

                <span>×</span>
              </button>
            </div>
          ) : (
            <div className="checkout-v2-declined">
              <span>
                PAGAMENTO / RECUSADO
              </span>

              <strong>
                RESERVA
                <br />
                ENCERRADA.
              </strong>

              <p>
                Os ingressos foram
                devolvidos ao estoque e
                podem ser reservados
                novamente.
              </p>

              <Link
                to={`/events/${reservation.event.id}`}
              >
                <span>
                  VOLTAR AO EVENTO
                </span>

                <span>↗</span>
              </Link>
            </div>
          )}
        </aside>
      </motion.section>
    </main>
  );
}

function CheckoutHeader() {
  return (
    <header className="checkout-v2-header">
      <Link
        to="/"
        className="brand"
      >
        ELITE
        <span>/TICKETS</span>
      </Link>

      <div className="checkout-v2-header-meta">
        <span>
          CHECKOUT / PAGAMENTO
        </span>

        <strong>02 / 03</strong>
      </div>
    </header>
  );
}