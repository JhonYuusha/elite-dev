import { motion } from "motion/react";

import { editorialEase } from "../../lib/motion";

type LoadingVariant =
  | "default"
  | "home"
  | "programming"
  | "event"
  | "checkout"
  | "tickets"
  | "sharedTicket"
  | "gate";

type LoadingStateProps = {
  variant?: LoadingVariant;
  title?: string;
  message?: string;
};

const loadingContent: Record<
  LoadingVariant,
  {
    index: string;
    eyebrow: string;
    title: string;
    message: string;
    footer: string;
  }
> = {
  default: {
    index: "00",
    eyebrow: "ELITE / SISTEMA",
    title: "PREPARANDO\nINFORMAÇÕES.",
    message: "Sincronizando dados",
    footer: "CARREGANDO",
  },

  home: {
    index: "01",
    eyebrow: "PROGRAMAÇÃO / EM CARTAZ",
    title: "PREPARANDO\nA PROGRAMAÇÃO.",
    message: "Consultando sessões disponíveis",
    footer: "EM CARTAZ",
  },

  programming: {
    index: "02",
    eyebrow: "PROGRAMAÇÃO / ORGANIZADOR",
    title: "PREPARANDO\nSUAS SESSÕES.",
    message: "Sincronizando programação",
    footer: "ORGANIZADOR",
  },

  event: {
    index: "03",
    eyebrow: "SESSÃO / DETALHES",
    title: "PREPARANDO\nA SESSÃO.",
    message: "Consultando disponibilidade",
    footer: "SESSÃO",
  },

  checkout: {
    index: "04",
    eyebrow: "RESERVA / PAGAMENTO",
    title: "RECUPERANDO\nSUA RESERVA.",
    message: "Preparando checkout",
    footer: "PAGAMENTO",
  },

  tickets: {
    index: "05",
    eyebrow: "CARTEIRA / CLIENTE",
    title: "LOCALIZANDO\nSEUS INGRESSOS.",
    message: "Consultando sua carteira",
    footer: "INGRESSOS",
  },

  sharedTicket: {
    index: "06",
    eyebrow: "ADMISSÃO / COMPARTILHADA",
    title: "VALIDANDO\nO INGRESSO.",
    message: "Consultando dados compartilhados",
    footer: "ADMISSÃO",
  },

  gate: {
    index: "07",
    eyebrow: "PORTARIA / ACESSO",
    title: "INICIANDO\nA PORTARIA.",
    message: "Preparando validação",
    footer: "CONTROLE DE ACESSO",
  },
};

export function LoadingState({
  variant = "default",
  title,
  message,
}: LoadingStateProps) {
  const content = loadingContent[variant];

  const displayTitle = title ?? content.title;
  const displayMessage = message ?? content.message;

  return (
    <motion.section
      className={`cinema-loader cinema-loader-${variant}`}
      initial={{
        opacity: 0,
        y: 8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        y: -12,
      }}
      transition={{
        duration: 0.4,
        ease: editorialEase,
      }}
      role="status"
      aria-live="polite"
      aria-label={displayMessage}
    >
      <div className="cinema-loader-top">
        <motion.span
          initial={{
            opacity: 0,
            x: -12,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            delay: 0.1,
            duration: 0.5,
            ease: editorialEase,
          }}
        >
          {content.eyebrow}
        </motion.span>

        <span>
          {content.index} / 07
        </span>
      </div>

      <div className="cinema-loader-main">
        <div className="cinema-loader-title-mask">
          <motion.h2
            initial={{
              y: "110%",
            }}
            animate={{
              y: 0,
            }}
            transition={{
              delay: 0.08,
              duration: 0.7,
              ease: editorialEase,
            }}
          >
            {displayTitle
              .split("\n")
              .map((line, index) => (
                <span key={`${line}-${index}`}>
                  {line}
                </span>
              ))}
          </motion.h2>
        </div>

        <motion.div
          className="cinema-loader-meta"
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 0.3,
            duration: 0.45,
          }}
        >
          <span className="cinema-loader-live">
            <i />
            {displayMessage}
          </span>

          <span>ELITE / TICKETS</span>
        </motion.div>
      </div>

      <div className="cinema-loader-track">
        <motion.span
          initial={{
            x: "-100%",
          }}
          animate={{
            x: "350%",
          }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            ease: [0.76, 0, 0.24, 1],
          }}
        />
      </div>

      <div className="cinema-loader-bottom">
        <span>{content.footer}</span>
        <span>AGUARDE</span>
      </div>
    </motion.section>
  );
}