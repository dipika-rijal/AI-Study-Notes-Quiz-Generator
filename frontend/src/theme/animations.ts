export const easing = {
  smooth: 'cubic-bezier(0.16, 1, 0.3, 1)',
  bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
};

export const duration = {
  fast: '150ms',
  base: '300ms',
  medium: '500ms',
  slow: '800ms',
};

// Framer Motion Variants
export const motionVariants = {
  fadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  },
  slideLeft: {
    initial: { opacity: 0, x: -40 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
  },
  slideRight: {
    initial: { opacity: 0, x: 40 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 40 },
  },
  staggerContainer: {
    animate: {
      transition: { staggerChildren: 0.08 },
    },
  },
  cardHover: {
    whileHover: { scale: 1.02, y: -8 },
  },
  buttonTap: {
    whileTap: { scale: 0.95 },
  },
};

export const generateAnimationCSS = () => `
  @keyframes glow-pulse {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 0.9; transform: scale(1.08); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(3deg); }
  }
  @keyframes shimmer {
    0% { background-position: -300% center; }
    100% { background-position: 300% center; }
  }
  @keyframes slide-up {
    from { opacity: 0; transform: translateY(60px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes scale-in {
    from { opacity: 0; transform: scale(0.8); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes breathe {
    0%, 100% { transform: scale(1); opacity: 0.5; }
    50% { transform: scale(1.15); opacity: 1; }
  }
  
  .animate-glow-pulse { animation: glow-pulse 3s ease-in-out infinite; }
  .animate-float { animation: float 6s ease-in-out infinite; }
  .animate-shimmer {
    background-size: 300% auto;
    animation: shimmer 6s linear infinite;
  }
  .animate-slide-up { animation: slide-up 0.8s ${easing.smooth} both; }
  .animate-scale-in { animation: scale-in 0.5s ${easing.bounce} both; }
  .animate-breathe { animation: breathe 4s ease-in-out infinite; }

  /* Scroll animations */
  .reveal { opacity: 0; transform: translateY(40px); transition: all 0.8s ${easing.smooth}; }
  .reveal.visible { opacity: 1; transform: translateY(0); }
  
  .reveal-left { opacity: 0; transform: translateX(-60px); transition: all 0.8s ${easing.smooth}; }
  .reveal-left.visible { opacity: 1; transform: translateX(0); }
  
  .reveal-right { opacity: 0; transform: translateX(60px); transition: all 0.8s ${easing.smooth}; }
  .reveal-right.visible { opacity: 1; transform: translateX(0); }
  
  .reveal-scale { opacity: 0; transform: scale(0.9); transition: all 0.8s ${easing.smooth}; }
  .reveal-scale.visible { opacity: 1; transform: scale(1); }
  
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
`;
