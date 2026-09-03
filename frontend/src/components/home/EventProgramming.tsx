import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { editorialEase } from "../../lib/motion";
import type { Event } from "../../types/event";
import { formatScheduleDate } from "../../utils/date";
import { formatMoney } from "../../utils/money";

type EventProgrammingProps = {
  events: Event[];
  totalCount: number;
  hasFeatured: boolean;
};

export function EventProgramming({
  events,
  totalCount,
  hasFeatured,
}: EventProgrammingProps) {
  if (!hasFeatured) {
    return (
      <motion.section
        className="home-v2-empty"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: editorialEase }}
      >
        <div className="home-v2-empty-box">
          <span className="home-v2-empty-index">00 / SEM RESULTADOS</span>
          <div>
            <h2>NENHUM EVENTO ENCONTRADO.</h2>
            <p>A programação não encontrou correspondências para sua busca.</p>
          </div>
        </div>
      </motion.section>
    );
  }

  return (
    <section className="home-v2-programming">
      <div className="home-v2-section-heading">
        <p>EM CARTAZ</p>
        <span>{String(totalCount).padStart(2, "0")} EVENTOS</span>
      </div>

      {events.length > 0 ? (
        <motion.div
          className="home-v2-grid"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.09 } },
          }}
        >
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              variants={{
                hidden: { opacity: 0, y: 24 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.55, ease: editorialEase },
                },
              }}
            >
              <Link to={`/events/${event.id}`} className="home-v2-card">
                <div className="home-v2-card-poster">
                  {event.imageUrl ? (
                    <img
                      src={event.imageUrl}
                      alt={`Pôster de ${event.title}`}
                      loading="lazy"
                    />
                  ) : (
                    <div className="home-v2-placeholder">SEM PÔSTER</div>
                  )}

                  <span className="home-v2-card-index">
                    {String(index + 2).padStart(2, "0")}
                  </span>

                  <span className="home-v2-card-price">
                    {formatMoney(event.priceCents)}
                  </span>
                </div>

                <div className="home-v2-card-content">
                  <div className="home-v2-card-topline">
                    <span className="home-v2-card-date">
                      {formatScheduleDate(event.startsAt)}
                    </span>
                    <span className="home-v2-card-availability">
                      {event.availableTickets} DISP.
                    </span>
                  </div>

                  <h3>{event.title}</h3>
                  <span className="home-v2-card-venue">{event.venueName}</span>

                  <div className="home-v2-card-arrow">
                    <span>VER SESSÃO</span>
                    <span>↗</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          className="home-v2-empty"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: editorialEase }}
        >
          <div className="home-v2-empty-box">
            <span className="home-v2-empty-index">01 / PROGRAMAÇÃO</span>
            <div>
              <h2>O DESTAQUE É A PROGRAMAÇÃO DE HOJE.</h2>
              <p>Esta é a única sessão disponível neste momento.</p>
            </div>
          </div>
        </motion.div>
      )}
    </section>
  );
}
