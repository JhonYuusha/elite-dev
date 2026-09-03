import { motion } from "motion/react";
import { editorialEase } from "../../lib/motion";

type HomeHeroProps = {
  search: string;
  onSearchChange: (value: string) => void;
};

export function HomeHero({ search, onSearchChange }: HomeHeroProps) {
  return (
    <section className="home-v2-intro">
      <div className="home-v2-intro-copy">
        <motion.p
          className="home-v2-kicker"
          initial={{ opacity: 0, x: -14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.08, duration: 0.5, ease: editorialEase }}
        >
          PROGRAMAÇÃO / UBERLÂNDIA
        </motion.p>

        <div className="home-v2-title-mask">
          <motion.h1
            className="home-v2-title"
            initial={{ y: "105%" }}
            animate={{ y: 0 }}
            transition={{ delay: 0.12, duration: 0.85, ease: editorialEase }}
          >
            <span>HISTÓRIAS PARA</span>
            <span>ASSISTIR.</span>
            <span>LUGARES PARA</span>
            <span>OCUPAR.</span>
          </motion.h1>
        </div>
      </div>

      <motion.label
        className="home-v2-search"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.55, ease: editorialEase }}
      >
        <span>BUSCAR NA PROGRAMAÇÃO</span>

        <div className="home-v2-search-field">
          <input
            type="search"
            placeholder="Filme, evento ou local"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
          <span className="home-v2-search-mark" aria-hidden="true">/</span>
        </div>
      </motion.label>
    </section>
  );
}
