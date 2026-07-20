import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParticles } from '../../hooks/useAnimations';

function ParticleBackground() {
  const canvasRef = useRef(null);
  useParticles(canvasRef, {
    count: 80,
    speed: 0.4,
    size: 2,
    connectDistance: 120,
    opacity: 0.5,
    pulse: true,
  });
  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full pointer-events-none" />;
}

function MorphingNumber({ value, label }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const startTime = performance.now();
    const startValue = 0;
    const endValue = value;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(startValue + (endValue - startValue) * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const timeout = setTimeout(() => {
      requestAnimationFrame(animate);
    }, 500);

    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <div className="text-center">
      <span className="text-4xl font-black" style={{ color: 'var(--theme-text-primary)' }}>{display}</span>
      <p className="mt-1 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--theme-text-secondary)' }}>{label}</p>
    </div>
  );
}

export default function HeroWelcome({ user, streak = 0, notesCount = 0, quizzesCount = 0 }) {
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Student';
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const nameWords = displayName.split(' ');

  return (
    <div className="relative overflow-hidden rounded-[32px] min-h-[280px] glass p-8 md:p-10" style={{ background: 'var(--theme-bg-secondary)', border: '1px solid var(--theme-glass-border)' }}>
      <ParticleBackground />

      <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-purple-600/20 blur-3xl animate-pulse" />
      <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-cyan-600/20 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="relative z-10">
        <AnimatePresence>
          {isVisible && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <p className="text-sm font-semibold" style={{ color: 'var(--theme-text-secondary)' }}>
                ✦ StudyGen AI • {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>

              <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl lg:text-6xl">
                <span style={{ color: 'var(--theme-text-secondary)' }}>Good </span>
                <span style={{ color: 'var(--theme-text-primary)' }}>Morning</span>
                <span style={{ color: 'var(--theme-text-secondary)' }}>, </span>
                {nameWords.map((word, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.08, duration: 0.6 }}
                    className="inline-block text-transparent bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 bg-clip-text shimmer-text"
                  >
                    {word}{' '}
                  </motion.span>
                ))}
              </h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="mt-3 max-w-lg text-sm font-medium"
                style={{ color: 'var(--theme-text-secondary)' }}
              >
                Your learning universe is ready. What will you explore today?
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-8 flex flex-wrap gap-10 border-t border-white/5 pt-8"
        >
          <MorphingNumber value={streak} label="Day Streak" />
          <MorphingNumber value={notesCount} label="Notes Created" />
          <MorphingNumber value={quizzesCount} label="Quizzes Completed" />
        </motion.div>
      </div>
    </div>
  );
}
