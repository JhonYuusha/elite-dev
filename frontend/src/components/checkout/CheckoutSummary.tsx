import {
  Link,
} from "react-router-dom";

import type {
  Reservation,
} from "../../services/reservation.service";

import {
  formatMoney,
} from "../../utils/money";

type CheckoutSummaryProps = {
  reservation:
    Reservation;

  seatLabels: string;

  productsSubtotalCents:
    number;

  totalCents: number;

  hasUnsavedChanges:
    boolean;

  paymentPending:
    boolean;

  concessionPending:
    boolean;

  paymentError:
    string;

  onPayment: (
    result:
      | "APPROVED"
      | "DECLINED",
  ) => void;
};

export function CheckoutSummary({
  reservation,
  seatLabels,
  productsSubtotalCents,
  totalCents,
  hasUnsavedChanges,
  paymentPending,
  concessionPending,
  paymentError,
  onPayment,
}: CheckoutSummaryProps) {
  const isPending =
    reservation.status ===
    "PENDING";

  return (
    <aside className="checkout-v2-summary">
      <div className="checkout-v2-summary-top">
        <div>
          <span>
            RESUMO / COMPRA
          </span>

          <strong>
            {String(
              reservation.quantity,
            ).padStart(
              2,
              "0",
            )}{" "}
            INGRESSOS
          </strong>
        </div>

        <span>
          {reservation.status}
        </span>
      </div>

      <div className="checkout-v2-row checkout-v2-row-seats">
        <span>
          LUGARES
        </span>

        <strong>
          {seatLabels}
        </strong>
      </div>

      <div className="checkout-v2-row">
        <span>
          INGRESSOS
        </span>

        <strong>
          {reservation.quantity}
          {" × "}
          {formatMoney(
            reservation.ticketUnitPriceCents,
          )}
        </strong>
      </div>

      <div className="checkout-v2-row">
        <span>
          BOMBONIERE
        </span>

        <strong>
          {formatMoney(
            productsSubtotalCents,
          )}
        </strong>
      </div>

      <div className="checkout-v2-row">
        <span>
          TAXAS
        </span>

        <strong>
          {formatMoney(0)}
        </strong>
      </div>

      <div className="checkout-v2-total">
        <span>
          {hasUnsavedChanges
            ? "TOTAL / PRÉVIA"
            : "TOTAL"}
        </span>

        <strong>
          {formatMoney(
            totalCents,
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

          {hasUnsavedChanges && (
            <p className="checkout-v2-payment-notice">
              Atualize a bomboniere
              antes de aprovar o
              pagamento.
            </p>
          )}

          {paymentError && (
            <p className="checkout-v2-error">
              {paymentError}
            </p>
          )}

          <button
            type="button"
            className="checkout-v2-approve"
            disabled={
              paymentPending ||
              concessionPending ||
              hasUnsavedChanges
            }
            onClick={() =>
              onPayment(
                "APPROVED",
              )
            }
          >
            <span>
              {paymentPending
                ? "PROCESSANDO..."
                : "APROVAR PAGAMENTO"}
            </span>

            <span>
              ↗
            </span>
          </button>

          <button
            type="button"
            className="checkout-v2-decline"
            disabled={
              paymentPending ||
              concessionPending
            }
            onClick={() =>
              onPayment(
                "DECLINED",
              )
            }
          >
            <span>
              SIMULAR RECUSA
            </span>

            <span>
              ×
            </span>
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
            Os lugares foram
            liberados e podem ser
            reservados novamente.
          </p>

          <Link
            to={`/events/${reservation.event.id}`}
          >
            <span>
              VOLTAR AO EVENTO
            </span>

            <span>
              ↗
            </span>
          </Link>
        </div>
      )}
    </aside>
  );
}
