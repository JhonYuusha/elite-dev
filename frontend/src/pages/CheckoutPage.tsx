import {
  Link,
  useParams,
} from "react-router-dom";

import {
  CheckoutContent,
} from "../components/checkout/CheckoutContent";

import {
  LoadingState,
} from "../components/ui/LoadingState";

import {
  useReservationDetails,
} from "../hooks/reservations/useReservationDetails";

import "../styles/checkout-v2.css";

export function CheckoutPage() {
  const { id } = useParams<{
    id: string;
  }>();

  const reservationQuery =
    useReservationDetails(id);

  if (
    reservationQuery.isPending
  ) {
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
    !reservationQuery.data
  ) {
    return (
      <main className="checkout-v2-page">
        <CheckoutHeader />

        <section className="checkout-v2-state">
          <p>
            RESERVA / ERRO
          </p>

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

  return (
    <main className="checkout-v2-page">
      <CheckoutHeader />

      <CheckoutContent
        key={
          reservationQuery.data.id
        }
        reservation={
          reservationQuery.data
        }
      />
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
        <span>
          /TICKETS
        </span>
      </Link>

      <div className="checkout-v2-header-meta">
        <span>
          CHECKOUT / PAGAMENTO
        </span>

        <strong>
          02 / 03
        </strong>
      </div>
    </header>
  );
}