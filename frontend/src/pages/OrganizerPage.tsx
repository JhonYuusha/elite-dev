import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { motion } from "motion/react";

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
import { editorialEase } from "../lib/motion";

import type { CatalogMovie } from "../types/catalog";

import "../styles/organizer-v2.css";

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

  if (!user) return <Navigate to="/login" replace />;
  if (!isOrganizer) return <Navigate to="/" replace />;

  async function publishEvent(data: SessionFormData): Promise<boolean> {
    try {
      setFormError("");
      setSuccess("");

      const createdEvent = await createEvent(data);

      setSuccess(`${createdEvent.title} foi publicado na programação.`);
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
      <motion.header
        className="organizer-header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: editorialEase }}
      >
        <Link to="/" className="brand">
          ELITE<span>/TICKETS</span>
        </Link>

        <nav>
          <span className="organizer-user">{user.name}</span>
          <Link to="/">Ver programação</Link>
          <button type="button" className="logout-button" onClick={handleLogout}>
            Sair
          </button>
        </nav>
      </motion.header>

      <section className="organizer-intro">
        <div>
          <motion.p
            className="eyebrow"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08, duration: 0.5, ease: editorialEase }}
          >
            PROGRAMAÇÃO / OPERAÇÃO
          </motion.p>

          <div className="organizer-title-mask">
            <motion.h1
              initial={{ y: "105%" }}
              animate={{ y: 0 }}
              transition={{ delay: 0.12, duration: 0.8, ease: editorialEase }}
            >
              GERENCIE AS
              <br />
              PRÓXIMAS SESSÕES.
            </motion.h1>
          </div>
        </div>

        <motion.div
          className="organizer-intro-aside"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.55, ease: editorialEase }}
        >
          <span>FLUXO / 01—02</span>
          <p>
            Escolha um título do catálogo e defina quando, onde e como ele
            entra em cartaz.
          </p>
        </motion.div>
      </section>

      <motion.section
        className="programming-workspace"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22, duration: 0.65, ease: editorialEase }}
      >
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
      </motion.section>

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
          <LoadingState variant="programming" />
        </section>
      ) : (
        <OrganizerEventList events={events} onEventUpdate={updateEvent} />
      )}
    </main>
  );
}