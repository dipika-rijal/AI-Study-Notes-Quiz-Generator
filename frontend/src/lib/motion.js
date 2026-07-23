export const motionEase = [0.22, 1, 0.36, 1];

export const pageMotion = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -5 },
  transition: { duration: 0.2, ease: motionEase },
};

export const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.055, delayChildren: 0.03 } },
};

export const revealItem = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.26, ease: motionEase } },
};

export const cardHover = { y: -2, transition: { duration: 0.16, ease: motionEase } };
export const buttonTap = { scale: 0.98 };
