/**
 * Design System Animation Constants
 * Consistent motion design
 */

export const animationTokens = {
  // Durations
  duration: {
    fast: '150ms',
    base: '200ms',
    normal: '300ms',
    slow: '500ms',
    slower: '700ms',
    slowest: '1000ms',
  },

  // Easing functions
  easing: {
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    // Custom easings
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    sharp: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },

  // Delays
  delay: {
    none: '0ms',
    short: '100ms',
    base: '200ms',
    long: '500ms',
    longer: '1000ms',
  },
};

// Animation presets
export const animationPresets = {
  // Fade animations
  fadeIn: {
    animation: 'fadeIn 300ms ease-out',
    keyframes: {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
  },
  fadeOut: {
    animation: 'fadeOut 300ms ease-in',
    keyframes: {
      from: { opacity: 1 },
      to: { opacity: 0 },
    },
  },

  // Slide animations
  slideUp: {
    animation: 'slideUp 300ms cubic-bezier(0.16, 1, 0.3, 1)',
    keyframes: {
      from: { opacity: 0, transform: 'translateY(20px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
    },
  },
  slideDown: {
    animation: 'slideDown 300ms cubic-bezier(0.16, 1, 0.3, 1)',
    keyframes: {
      from: { opacity: 0, transform: 'translateY(-20px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
    },
  },
  slideLeft: {
    animation: 'slideLeft 300ms cubic-bezier(0.16, 1, 0.3, 1)',
    keyframes: {
      from: { opacity: 0, transform: 'translateX(20px)' },
      to: { opacity: 1, transform: 'translateX(0)' },
    },
  },
  slideRight: {
    animation: 'slideRight 300ms cubic-bezier(0.16, 1, 0.3, 1)',
    keyframes: {
      from: { opacity: 0, transform: 'translateX(-20px)' },
      to: { opacity: 1, transform: 'translateX(0)' },
    },
  },

  // Scale animations
  scaleIn: {
    animation: 'scaleIn 200ms cubic-bezier(0.16, 1, 0.3, 1)',
    keyframes: {
      from: { opacity: 0, transform: 'scale(0.95)' },
      to: { opacity: 1, transform: 'scale(1)' },
    },
  },
  scaleOut: {
    animation: 'scaleOut 200ms cubic-bezier(0.16, 1, 0.3, 1)',
    keyframes: {
      from: { opacity: 1, transform: 'scale(1)' },
      to: { opacity: 0, transform: 'scale(0.95)' },
    },
  },

  // Button hover
  buttonHover: {
    animation: 'buttonHover 150ms ease-out',
    keyframes: {
      from: { transform: 'translateY(0)' },
      to: { transform: 'translateY(-2px)' },
    },
  },
  buttonActive: {
    animation: 'buttonActive 100ms ease-out',
    keyframes: {
      from: { transform: 'scale(1)' },
      to: { transform: 'scale(0.95)' },
    },
  },

  // Modal animations
  modalEnter: {
    animation: 'modalEnter 200ms cubic-bezier(0.16, 1, 0.3, 1)',
    keyframes: {
      from: { opacity: 0, transform: 'scale(0.9) translateY(20px)' },
      to: { opacity: 1, transform: 'scale(1) translateY(0)' },
    },
  },
  modalExit: {
    animation: 'modalExit 150ms ease-in',
    keyframes: {
      from: { opacity: 1, transform: 'scale(1) translateY(0)' },
      to: { opacity: 0, transform: 'scale(0.9) translateY(20px)' },
    },
  },

  // Loading animations
  spin: {
    animation: 'spin 1000ms linear infinite',
    keyframes: {
      from: { transform: 'rotate(0deg)' },
      to: { transform: 'rotate(360deg)' },
    },
  },
  pulse: {
    animation: 'pulse 2000ms cubic-bezier(0.4, 0, 0.6, 1) infinite',
    keyframes: {
      '0%, 100%': { opacity: 1 },
      '50%': { opacity: 0.5 },
    },
  },
  bounce: {
    animation: 'bounce 1000ms infinite',
    keyframes: {
      '0%, 100%': { transform: 'translateY(-25%)', animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)' },
      '50%': { transform: 'translateY(0)', animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)' },
    },
  },
};

// CSS custom properties for animations
export const animationCSS = {
  '--duration-fast': animationTokens.duration.fast,
  '--duration-base': animationTokens.duration.base,
  '--duration-normal': animationTokens.duration.normal,
  '--duration-slow': animationTokens.duration.slow,
  '--duration-slower': animationTokens.duration.slower,
  '--duration-slowest': animationTokens.duration.slowest,
  
  '--easing-linear': animationTokens.easing.linear,
  '--easing-ease-in': animationTokens.easing.easeIn,
  '--easing-ease-out': animationTokens.easing.easeOut,
  '--easing-ease-in-out': animationTokens.easing.easeInOut,
  '--easing-bounce': animationTokens.easing.bounce,
  '--easing-smooth': animationTokens.easing.smooth,
  '--easing-sharp': animationTokens.easing.sharp,
  
  '--delay-none': animationTokens.delay.none,
  '--delay-short': animationTokens.delay.short,
  '--delay-base': animationTokens.delay.base,
  '--delay-long': animationTokens.delay.long,
  '--delay-longer': animationTokens.delay.longer,
};

// Transition utilities
export const transitions = {
  // Common transitions
  default: 'all 300ms cubic-bezier(0.16, 1, 0.3, 1)',
  fast: 'all 150ms ease-out',
  slow: 'all 500ms ease-in-out',
  
  // Specific transitions
  colors: 'color 300ms ease, background-color 300ms ease, border-color 300ms ease',
  transform: 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1)',
  opacity: 'opacity 300ms ease',
  shadow: 'box-shadow 300ms cubic-bezier(0.16, 1, 0.3, 1)',
};
