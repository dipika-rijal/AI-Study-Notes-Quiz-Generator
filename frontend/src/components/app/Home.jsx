import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStreak } from '../../hooks/useStreak';
import { useScrollReveal, useParallax } from '../../hooks/useAnimations';
import HeroWelcome from './HeroWelcome';

function AnimatedStatCard({ icon, label, value, color, delay = 0 }) {
  const cardRef = useRef(null);
  useParallax(cardRef, { intensity: 0.05, maxRotation: 3 });

  const colorMap = {
    purple: { bg: 'rgba(139,92,246,0.15)', text: 'var(--theme-glow-purple)' },
    cyan:   { bg: 'rgba(6,182,212,0.15)',  text: 'var(--theme-glow-cyan)' },
    orange: { bg: 'rgba(245,158,11,0.15)', text: 'var(--theme-glow-orange)' },
    pink:   { bg: 'rgba(236,72,153,0.15)', text: 'var(--theme-glow-pink)' },
  };
  const c = colorMap[color] || colorMap.purple;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.6, ease: 'easeOut' }}
      className="surface-card rounded-[20px] p-6 cursor-pointer"
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div className="flex items-center gap-4">
        <div style={{ background: c.bg, borderRadius: '12px', padding: '12px' }}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div>
          <p className="text-2xl font-black" style={{ color: 'var(--theme-text-primary)' }}>
            {value}
          </p>
          <p className="text-sm font-medium" style={{ color: 'var(--theme-text-secondary)' }}>
            {label}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function ActionCard({ icon, title, description, link, color, delay = 0 }) {
  const cardRef = useRef(null);
  useParallax(cardRef, { intensity: 0.06, maxRotation: 4 });

  const colorMap = {
    purple: { bg: 'rgba(139,92,246,0.15)', text: 'var(--theme-glow-purple)' },
    cyan:   { bg: 'rgba(6,182,212,0.15)',  text: 'var(--theme-glow-cyan)' },
    orange: { bg: 'rgba(245,158,11,0.15)', text: 'var(--theme-glow-orange)' },
    pink:   { bg: 'rgba(236,72,153,0.15)', text: 'var(--theme-glow-pink)' },
  };
  const c = colorMap[color] || colorMap.purple;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: 'easeOut' }}
      className="surface-card rounded-[20px] p-6 group cursor-pointer"
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div className="flex items-start gap-4">
        <div
          style={{
            background: c.bg,
            borderRadius: '12px',
            padding: '12px',
            transition: 'transform 0.3s ease',
          }}
          className="group-hover:scale-110"
        >
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold" style={{ color: 'var(--theme-text-primary)' }}>
            {title}
          </h3>
          <p className="mt-1 text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
            {description}
          </p>
          <Link
            to={link}
            style={{
              display: 'inline-block',
              marginTop: '14px',
              padding: '8px 18px',
              borderRadius: '10px',
              background: c.bg,
              color: c.text,
              fontSize: '13px',
              fontWeight: '700',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
            }}
          >
            Start →
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function Home({ user }) {
  const { currentStreak, loading: streakLoading } = useStreak();
  const [stats] = useState({ notesCount: 12, quizzesCount: 8 });

  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const actionsRef = useRef(null);

  useScrollReveal(heroRef,   { delay: 0.1, duration: 0.8, y: 30 });
  useScrollReveal(statsRef,  { delay: 0.15, duration: 0.7, y: 30, stagger: 0.1 });
  useScrollReveal(actionsRef,{ delay: 0.2, duration: 0.8, y: 40, stagger: 0.1 });

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div ref={heroRef}>
        <HeroWelcome
          user={user}
          streak={streakLoading ? 0 : currentStreak}
          notesCount={stats.notesCount}
          quizzesCount={stats.quizzesCount}
        />
      </div>

      {/* Stats Row */}
      <div ref={statsRef} className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <AnimatedStatCard icon="📝" label="Notes Created"      value={stats.notesCount}                      color="purple" delay={0.1} />
        <AnimatedStatCard icon="🧠" label="Quizzes Completed"  value={stats.quizzesCount}                    color="cyan"   delay={0.2} />
        <AnimatedStatCard icon="🔥" label="Day Streak"         value={streakLoading ? 0 : currentStreak}    color="orange" delay={0.3} />
      </div>

      {/* Action Cards */}
      <div ref={actionsRef} className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <ActionCard icon="📚" title="Create Notes"  description="Turn any topic into organized study notes"       link="/app/notes?type=topic" color="purple" delay={0.1} />
        <ActionCard icon="🎯" title="Create Quiz"   description="Test your knowledge with AI-generated questions" link="/app/quiz?type=topic"  color="cyan"   delay={0.2} />
        <ActionCard icon="📊" title="View History"  description="Review all your saved notes and quizzes"         link="/app/history"          color="pink"   delay={0.3} />
      </div>

      {/* Ambient background blobs */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full blur-3xl animate-pulse"
             style={{ background: 'rgba(139,92,246,0.06)' }} />
        <div className="absolute bottom-1/3 right-1/4 h-80 w-80 rounded-full blur-3xl animate-pulse"
             style={{ background: 'rgba(6,182,212,0.05)', animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 h-96 w-96 rounded-full blur-3xl animate-pulse"
             style={{ background: 'rgba(236,72,153,0.04)', animationDelay: '4s' }} />
      </div>
    </div>
  );
}