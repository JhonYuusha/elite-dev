import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

import { api } from "../services/api";

type SharedTicket = {
  id: string;
  status: "VALID" | "USED" | "CANCELLED";
  ownerName: string;

  event: {
    title: string;
    startsAt: string;
    venueName: string;
    venueAddress: string | null;
  };
};

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

function statusLabel(status: SharedTicket["status"]) {
  if (status === "VALID") return "VÁLIDO";
  if (status === "USED") return "UTILIZADO";
  return "CANCELADO";
}

export function SharedTicketPage() {
  const { token } = useParams<{ token: string }>();

  const [ticket, setTicket] = useState<SharedTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTicket() {
      try {
        setLoading(true);
        setError("");

        const { data } = await api.get<SharedTicket>(
          `/tickets/shared/${token}`,
        );

        setTicket(data);
      } catch (requestError) {
        if (axios.isAxiosError(requestError)) {
          setError(
            requestError.response?.data?.message ??
              "Este ingresso não está disponível.",
          );
        } else {
          setError("Este ingresso não está disponível.");
        }
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      loadTicket();
    }
  }, [token]);

  if (loading) {
    return (
      <main className="shared-ticket-state">
        <span>CARREGANDO INGRESSO...</span>
      </main>
    );
  }

  if (!ticket) {
    return (
      <main className="shared-ticket-state">
        <p className="eyebrow">LINK / INGRESSO</p>

        <h1>INGRESSO<br />INDISPONÍVEL.</h1>

        <p>{error}</p>

        <Link to="/">← VOLTAR À PROGRAMAÇÃO</Link>
      </main>
    );
  }

  return (
    <main className="shared-ticket-page">
      <header className="details-header">
        <Link to="/" className="brand">
          ELITE<span>/TICKETS</span>
        </Link>

        <span className="shared-header-label">
          INGRESSO COMPARTILHADO
        </span>
      </header>

      <section className="shared-ticket-layout">
        <div className="shared-ticket-intro">
          <p className="eyebrow">ADMISSÃO / COMPARTILHADA</p>

          <h1>
            SEU LUGAR
            <br />
            ESTÁ AQUI.
          </h1>

          <p className="shared-ticket-explanation">
            Este link confirma os dados do ingresso compartilhado.
            A validação de entrada continua sendo realizada pela
            portaria da Elite.
          </p>
        </div>

        <article
          className={`shared-ticket-card shared-ticket-${ticket.status.toLowerCase()}`}
        >
          <div className="shared-ticket-top">
            <span>ELITE / ADMISSÃO</span>

            <strong>{statusLabel(ticket.status)}</strong>
          </div>

          <div className="shared-ticket-event">
            <p>{formatDate(ticket.event.startsAt)}</p>

            <h2>{ticket.event.title}</h2>
          </div>

          <div className="shared-ticket-data">
            <div>
              <span>LOCAL</span>
              <strong>{ticket.event.venueName}</strong>

              {ticket.event.venueAddress && (
                <p>{ticket.event.venueAddress}</p>
              )}
            </div>

            <div>
              <span>PORTADOR</span>
              <strong>{ticket.ownerName}</strong>
            </div>
          </div>

          <div className="shared-ticket-footer">
            <span>INGRESSO</span>
            <code>{ticket.id.slice(0, 8).toUpperCase()}</code>
          </div>
        </article>
      </section>
    </main>
  );
}
