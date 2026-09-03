export const editorialEase = [0.22, 1, 0.36, 1] as const;

export const stateCardMotion = {
  initial: {
    opacity: 0,
    y: 18,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: editorialEase,
    },
  },
};

export const stateContentMotion = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.12,
      duration: 0.45,
      ease: editorialEase,
    },
  },
};
