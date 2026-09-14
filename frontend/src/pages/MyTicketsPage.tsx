import {
  useEffect,
} from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  motion,
} from "motion/react";

import {
  TicketCard,
} from "../components/tickets/TicketCard";

import {
  LoadingState,
} from "../components/ui/LoadingState";

import {
  useAuth,
} from "../context/useAuth";

import {
  useMyTickets,
} from "../hooks/tickets/useMyTickets";

import {
  editorialEase,
} from "../lib/motion";

import "../styles/my-tickets-v2.css";

export function MyTicketsPage() {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const { user } =
    useAuth();

  const canLoadTickets =
    user?.role ===
    "CLIENT";

  const ticketsQuery =
    useMyTickets(
      canLoadTickets,
    );

  const paymentApproved =
    (
      location.state as {
        paymentApproved?: boolean;
      } | null
    )?.paymentApproved ===
    true;

  useEffect(() => {
    if (!user) {
      navigate(
        "/login",
        {
          replace: true,
        },
      );

      return;
    }

    if (
      user.role !==
      "CLIENT"
    ) {
      navigate(
        "/",
        {
          replace: true,
        },
      );
    }
  }, [
    user,
    navigate,
  ]);

  if (
    !canLoadTickets ||
    ticketsQuery.isPending
  ) {
    return (
      <main className="tickets-page">
        <TicketsHeader />

        <section className="tickets-heading">
          <LoadingState
            variant="tickets"
          />
        </section>
      </main>
    );
  }

  return (
    <main className="tickets-page">
      <TicketsHeader />

      <section className="tickets-heading">
        <p className="eyebrow">
          CARTEIRA / CLIENTE
        </p>

        <h1>
          MEUS
          <br />
          INGRESSOS
        </h1>

        {paymentApproved && (
          <motion.div
            className="payment-success"
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
              ease:
                editorialEase,
            }}
          >
            <strong>
              PAGAMENTO APROVADO ✓
            </strong>

            <span>
              Seus ingressos já
              estão disponíveis
              abaixo.
            </span>
          </motion.div>
        )}
      </section>

      {ticketsQuery.isError ? (
        <section className="empty-tickets">
          <p>
            NÃO FOI POSSÍVEL
            CARREGAR OS INGRESSOS
          </p>

          <button
            type="button"
            onClick={() =>
              ticketsQuery.refetch()
            }
          >
            TENTAR NOVAMENTE →
          </button>
        </section>
      ) : ticketsQuery.data
          .length === 0 ? (
        <section className="empty-tickets">
          <p>
            VOCÊ AINDA NÃO POSSUI
            INGRESSOS
          </p>

          <Link to="/">
            VER PROGRAMAÇÃO →
          </Link>
        </section>
      ) : (
        <motion.section
          className="tickets-list"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},

            visible: {
              transition: {
                staggerChildren:
                  0.08,
              },
            },
          }}
        >
          {ticketsQuery.data.map(
            (ticket) => (
              <TicketCard
                key={
                  ticket.id
                }
                ticket={
                  ticket
                }
              />
            ),
          )}
        </motion.section>
      )}
    </main>
  );
}

function TicketsHeader() {
  return (
    <header className="details-header">
      <Link
        to="/"
        className="brand"
      >
        ELITE
        <span>
          /TICKETS
        </span>
      </Link>

      <Link
        to="/"
        className="back-link"
      >
        ← PROGRAMAÇÃO
      </Link>
    </header>
  );
}