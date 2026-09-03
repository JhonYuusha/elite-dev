import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { editorialEase } from "../../lib/motion";
import type { Event } from "../../types/event";
import { formatScheduleDate } from "../../utils/date";
import { formatMoney } from "../../utils/money";

type FeaturedEventProps = {
  event: Event;
};

export function FeaturedEvent({ event }: FeaturedEventProps) {
  return (
    <section className="home-v2-featured-wrap">
      <p className="home-v2-featured-kicker">
        DESTAQUE • PROGRAMAÇÃO DE HOJE
      </p>

      <motion.article
        className="home-v2-featured"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7, ease: editorialEase }}
      >
        <motion.div
          className="home-v2-featured-poster"
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          transition={{ delay: 0.18, duration: 0.9, ease: editorialEase }}
        >
          {event.imageUrl ? (
            <img src={event.imageUrl} alt={`Pôster de ${event.title}`} />
          ) : (
            <div className="home-v2-placeholder">SEM PÔSTER</div>
          )}

          <span className="home-v2-poster-number">01 / DESTAQUE</span>
        </motion.div>

        <div className="home-v2-featured-content">
          <div className="home-v2-featured-head">
            <p className="home-v2-date">{formatScheduleDate(event.startsAt)}</p>
            <span className="home-v2-featured-label">SELEÇÃO / EM CARTAZ</span>
          </div>

          <motion.h2
            className="home-v2-featured-title"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.65, ease: editorialEase }}
          >
            {event.title}
          </motion.h2>

          <motion.p
            className="home-v2-description"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.54, duration: 0.6 }}
          >
            {event.description || "Uma sessão selecionada para a programação Elite."}
          </motion.p>

          <div className="home-v2-metadata">
            <div className="home-v2-meta">
              <span>LOCAL</span>
              <strong>{event.venueName}</strong>
            </div>

            <div className="home-v2-meta">
              <span>INGRESSOS</span>
              <strong>{event.availableTickets} disponíveis</strong>
            </div>

            <div className="home-v2-meta">
              <span>A PARTIR DE</span>
              <strong>{formatMoney(event.priceCents)}</strong>
            </div>
          </div>

          <Link to={`/events/${event.id}`} className="home-v2-featured-action">
            <span>VER SESSÃO</span>
            <span>↗</span>
          </Link>
        </div>
      </motion.article>
    </section>
  );
}
