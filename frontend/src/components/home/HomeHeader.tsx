import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { useAuth } from "../../context/useAuth";
import { editorialEase } from "../../lib/motion";

export function HomeHeader() {
  const { user, logout } = useAuth();

  return (
    <motion.header
      className="home-v2-header"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: editorialEase }}
    >
      <Link to="/" className="brand">
        ELITE<span>/TICKETS</span>
      </Link>

      <nav className="home-v2-nav">
        {user?.role === "CLIENT" && <Link to="/tickets">Meus ingressos</Link>}
        {user?.role === "ORGANIZER" && <Link to="/organizer">Organizador</Link>}
        {user?.role === "GATEKEEPER" && <Link to="/gate">Portaria</Link>}

        {user ? (
          <>
            <span className="home-v2-user">{user.name}</span>
            <button type="button" className="home-v2-logout" onClick={logout}>
              Sair
            </button>
          </>
        ) : (
          <Link to="/login">Entrar</Link>
        )}
      </nav>
    </motion.header>
  );
}
