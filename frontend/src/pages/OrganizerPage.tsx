import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { CatalogSearch } from "../components/organizer/CatalogSearch";
import { OrganizerEventList } from "../components/organizer/OrganizerEventList";
import {
  SessionForm,
  type SessionFormData,
} from "../components/organizer/SessionForm";
import { ErrorState } from "../components/ui/ErrorState";
import { LoadingState } from "../components/ui/LoadingState";

import { useAuth } from "../context/useAuth";
import { useOrganizerEvents } from "../hooks/organizer/useOrganizerEvents";

import type { CatalogMovie } from "../types/catalog";

export function OrganizerPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isOrganizer = user?.role === "ORGANIZER";

  const {
    events,
    isLoading,
    loadError,
    createEvent,
    isCreating,
    updateEvent,
    refetch,
  } = useOrganizerEvents(isOrganizer);

  const [selectedMovie, setSelectedMovie] = useState<CatalogMovie | null>(null);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isOrganizer) {
    return <Navigate to="/" replace />;
  }

  async function publishEvent(data: SessionFormData): Promise<boolean> {
    try {
      setFormError("");
      setSuccess("");

      const createdEvent = await createEvent(data);

      setSuccess(
        `${createdEvent.title} foi publicado na programação.`,
      );

      setSelectedMovie(null);

      return true;
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Não foi possível publicar o evento.",
      );

      return false;
    }
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <main className="organizer-page">
      <header className="organizer-header">
        <Link to="/" className="brand">
          ELITE
          <span>/TICKETS</span>
        </Link>

        <nav>
          <span className="organizer-user">{user.name}</span>
          <Link to="/">Ver programação</Link>

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            Sair
          </button>
        </nav>
      </header>

      <section className="organizer-intro">
        <div>
          <p className="eyebrow">
            PROGRAMAÇÃO / ORGANIZADOR
          </p>

          <h1>
            MONTE SUA
            <br />
            PRÓXIMA SESSÃO.
          </h1>
        </div>

        <p>
          O filme vem do catálogo TMDb. Data, local, capacidade e preço
          pertencem à sua sessão.
        </p>
      </section>

      <section className="programming-workspace">
        <CatalogSearch
          selectedMovie={selectedMovie}
          onSelectMovie={(movie) => {
            setSelectedMovie(movie);
            setFormError("");
            setSuccess("");
          }}
          onClearMovie={() => setSelectedMovie(null)}
        />

        <SessionForm
          selectedMovie={selectedMovie}
          publishing={isCreating}
          error={formError}
          success={success}
          onPublish={publishEvent}
        />
      </section>

      {loadError ? (
        <section className="organizer-events">
          <ErrorState
            message={loadError}
            onRetry={() => {
              void refetch();
            }}
          />
        </section>
      ) : isLoading ? (
        <section className="organizer-events">
          <LoadingState
            title="SUAS SESSÕES"
            message="Carregando programação..."
          />
        </section>
      ) : (
        <OrganizerEventList
          events={events}
          onEventUpdate={updateEvent}
        />
      )}
    </main>
  );
}