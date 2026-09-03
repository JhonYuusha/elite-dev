import { motion } from "motion/react";

import {
  stateCardMotion,
  stateContentMotion,
} from "../../lib/motion";

type EmptyStateProps = {
  title: string;
  message: string;
};

export function EmptyState({
  title,
  message,
}: EmptyStateProps) {
  return (
    <motion.div
      className="state-card state-card-empty"
      {...stateCardMotion}
    >
      <div className="state-index" aria-hidden="true">
        00
      </div>

      <motion.div
        className="state-content"
        {...stateContentMotion}
      >
        <div className="state-heading">
          <span className="state-card-kicker">
            PROGRAMAÇÃO / VAZIA
          </span>

          <span className="state-status-code">
            SEM REGISTROS
          </span>
        </div>

        <strong className="state-title">{title}</strong>

        <p>{message}</p>

        <div className="state-rule" />

        <div className="state-footer">
          <span>ELITE / TICKETS</span>
          <span>00 ITENS</span>
        </div>
      </motion.div>
    </motion.div>
  );
}