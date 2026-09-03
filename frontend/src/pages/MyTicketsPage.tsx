import {useEffect, useState, } from "react";
import {Link, useLocation, useNavigate, } from "react-router-dom";
import {motion, } from "motion/react";
import QRCode from "qrcode";
import { LoadingState } from "../components/ui/LoadingState";
import { useAuth } from "../context/useAuth";
import { api } from "../services/api";
import { formatDate } from "../utils/date";
import { waitForMinimumDuration } from "../utils/minimum-delay";

type Ticket = {
  id: string;
  status:
    | "VALID"
    | "USED"
    | "CANCELLED";

  shareToken: string | null;
  validatedAt: string | null;
  createdAt: string;

  qrCode: string;

  event: {
    id: string;
    title: string;
    startsAt: string;
    venueName: string;
    venueAddress: string | null;
  };
};

type TicketWithQr = Ticket & {
  qrImage: string;
};

export function MyTicketsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useAuth();

  const [tickets, setTickets] =
    useState<TicketWithQr[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [
    copiedShare,
    setCopiedShare,
  ] =
    useState<string | null>(
      null,
    );

  const [
    copiedManualCode,
    setCopiedManualCode,
  ] =
    useState<string | null>(
      null,
    );

  const paymentApproved =
    (
      location.state as {
        paymentApproved?: boolean;
      } | null
    )?.paymentApproved === true;

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "CLIENT") {
      navigate("/");
      return;
    }

    async function loadTickets() {
      const startedAt =
        performance.now();

      try {
        const { data } =
          await api.get<Ticket[]>(
            "/tickets/me",
          );

        const withQr =
          await Promise.all(
            data.map(
              async (ticket) => ({
                ...ticket,

                qrImage:
                  await QRCode.toDataURL(
                    ticket.qrCode,
                    {
                      width: 280,
                      margin: 1,
                    },
                  ),
              }),
            ),
          );

        setTickets(withQr);
      } finally {
        await waitForMinimumDuration(
          startedAt,
        );

        setLoading(false);
      }
    }

    void loadTickets();
  }, [
    user,
    navigate,
  ]);

  async function shareTicket(
    ticket: Ticket,
  ) {
    if (!ticket.shareToken) {
      return;
    }

    const url =
      `${window.location.origin}/shared/${ticket.shareToken}`;

    await navigator.clipboard.writeText(
      url,
    );

    setCopiedShare(ticket.id);

    window.setTimeout(() => {
      setCopiedShare(null);
    }, 2000);
  }

  async function copyManualCode(
    ticket: Ticket,
  ) {
    await navigator.clipboard.writeText(
      ticket.id,
    );

    setCopiedManualCode(
      ticket.id,
    );

    window.setTimeout(() => {
      setCopiedManualCode(null);
    }, 2000);
  }

  if (loading) {
    return (
      <main className="tickets-page">
        <header className="details-header">
          <Link
            to="/"
            className="brand"
          >
            ELITE
            <span>/TICKETS</span>
          </Link>

          <Link
            to="/"
            className="back-link"
          >
            ← PROGRAMAÇÃO
          </Link>
        </header>

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
      <header className="details-header">
        <Link
          to="/"
          className="brand"
        >
          ELITE
          <span>/TICKETS</span>
        </Link>

        <Link
          to="/"
          className="back-link"
        >
          ← PROGRAMAÇÃO
        </Link>
      </header>

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
              ease: [
                0.22,
                1,
                0.36,
                1,
              ],
            }}
          >
            <strong>
              PAGAMENTO APROVADO ✓
            </strong>

            <span>
              Seus ingressos já estão
              disponíveis abaixo.
            </span>
          </motion.div>
        )}
      </section>

      {tickets.length === 0 ? (
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
          {tickets.map(
            (ticket) => (
              <motion.article
                className={`ticket ticket-${ticket.status.toLowerCase()}`}
                key={ticket.id}
                variants={{
                  hidden: {
                    opacity: 0,
                    y: 22,
                  },

                  visible: {
                    opacity: 1,
                    y: 0,

                    transition: {
                      duration:
                        0.55,

                      ease: [
                        0.22,
                        1,
                        0.36,
                        1,
                      ],
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
                      {
                        ticket.event
                          .title
                      }
                    </h2>

                    <p className="ticket-date">
                      {formatDate(
                        ticket.event
                          .startsAt,
                      )}
                    </p>

                    <div className="ticket-place">
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
                            ticket
                              .event
                              .venueAddress
                          }
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="ticket-status">
                    {ticket.status ===
                      "VALID" &&
                      "VÁLIDO"}

                    {ticket.status ===
                      "USED" &&
                      "UTILIZADO"}

                    {ticket.status ===
                      "CANCELLED" &&
                      "CANCELADO"}
                  </div>
                </div>

                <div className="ticket-stub">
                  <img
                    src={
                      ticket.qrImage
                    }
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
                        onClick={() =>
                          copyManualCode(
                            ticket,
                          )
                        }
                      >
                        {copiedManualCode ===
                        ticket.id
                          ? "CÓDIGO MANUAL COPIADO ✓"
                          : "COPIAR CÓDIGO PARA PORTARIA"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          shareTicket(
                            ticket,
                          )
                        }
                      >
                        {copiedShare ===
                        ticket.id
                          ? "LINK COPIADO ✓"
                          : "COMPARTILHAR INGRESSO ↗"}
                      </button>
                    </>
                  )}
                </div>
              </motion.article>
            ),
          )}
        </motion.section>
      )}
    </main>
  );
}