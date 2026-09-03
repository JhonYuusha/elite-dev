import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { LoadingState } from "../components/ui/LoadingState";
import { api } from "../services/api";
import { useAuth } from "../context/useAuth";
import type { Event } from "../types/event";

function formatPrice(priceCents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(priceCents / 100);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
    .format(new Date(date))
    .replace(".", "")
    .toUpperCase();
}

export function HomePage() {
  const { user, logout } = useAuth();

  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      try {
        const { data } = await api.get<Event[]>("/events");
        setEvents(data);
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return events;
    }

    return events.filter((event) =>
      [event.title, event.venueName, event.venueAddress]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query)),
    );
  }, [events, search]);

  const featuredEvent = filteredEvents[0];
  const remainingEvents = filteredEvents.slice(1);

  if (loading) {
  return (
    <main className="home-page">
      <header className="home-header">
        <Link to="/" className="brand">
          ELITE<span>/TICKETS</span>
        </Link>
      </header>

      <section className="home-intro">
        <LoadingState variant="home" />
      </section>
    </main>
  );
 }

  return (
    <main className="home-page">
      <header className="home-header">
        <Link to="/" className="brand">
          ELITE
          <span>/TICKETS</span>
        </Link>

        <nav>
          {user?.role === "CLIENT" && (
            <Link to="/tickets">Meus ingressos</Link>
          )}

          {user?.role === "ORGANIZER" && (
            <Link to="/organizer">Organizador</Link>
          )}

          {user?.role === "GATEKEEPER" && (
            <Link to="/gate">Portaria</Link>
          )}

          {user ? (
            <>
              <span className="logged-user">
                {user.name}
              </span>

              <button
                type="button"
                className="logout-button"
                onClick={logout}
              >
                Sair
              </button>
            </>
          ) : (
            <Link to="/login">Entrar</Link>
          )}
        </nav>
      </header>

      <section className="home-intro">
        <div>
          <p className="eyebrow">
            PROGRAMAÇÃO / UBERLÂNDIA
          </p>

          <h1>
            Histórias para assistir.
            <br />
            Lugares para ocupar.
          </h1>
        </div>

        <label className="event-search">
          <span>BUSCAR NA PROGRAMAÇÃO</span>

          <input
            type="search"
            placeholder="Filme, evento ou local"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </label>
      </section>

      {featuredEvent ? (
        <>
          <section className="featured-event">
            <div className="featured-poster">
              {featuredEvent.imageUrl ? (
                <img
                  src={featuredEvent.imageUrl}
                  alt={`Pôster de ${featuredEvent.title}`}
                />
              ) : (
                <div className="poster-placeholder">
                  <span>SEM PÔSTER</span>
                </div>
              )}
            </div>

            <div className="featured-content">
              <p className="event-date">
                {formatDate(featuredEvent.startsAt)}
              </p>

              <h2>{featuredEvent.title}</h2>

              <p className="featured-description">
                {featuredEvent.description ||
                  "Uma sessão selecionada para a programação Elite."}
              </p>

              <div className="event-metadata">
                <div>
                  <span>LOCAL</span>
                  <strong>
                    {featuredEvent.venueName}
                  </strong>
                </div>

                <div>
                  <span>INGRESSOS</span>
                  <strong>
                    {featuredEvent.availableTickets} disponíveis
                  </strong>
                </div>

                <div>
                  <span>A PARTIR DE</span>
                  <strong>
                    {formatPrice(featuredEvent.priceCents)}
                  </strong>
                </div>
              </div>

              <Link
                to={`/events/${featuredEvent.id}`}
                className="primary-link"
              >
                VER SESSÃO
                <span>↗</span>
              </Link>
            </div>
          </section>

          <section className="now-showing">
            <div className="section-heading">
              <p>EM CARTAZ</p>

              <span>
                {filteredEvents.length} eventos
              </span>
            </div>

            <div className="event-grid">
              {remainingEvents.map((event) => (
                <Link
                  to={`/events/${event.id}`}
                  className="event-card"
                  key={event.id}
                >
                  <div className="event-card-poster">
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

                    <span className="event-price">
                      {formatPrice(event.priceCents)}
                    </span>
                  </div>

                  <div className="event-card-info">
                    <p>
                      {formatDate(event.startsAt)}
                    </p>

                    <h3>{event.title}</h3>

                    <span>{event.venueName}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </>
      ) : (
        <section className="empty-events">
          <p>NENHUM EVENTO ENCONTRADO</p>

          <h2>
            A programação não encontrou correspondências.
          </h2>
        </section>
      )}
    </main>
  );
}