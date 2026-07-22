import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ContinueCard from './ContinueCard';
import { useScrollReveal } from '../../hooks/useAnimations';

function QuickActionCard({ icon, title, description, link, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
      className="group"
    >
      <Link
        to={link}
        className="block h-full bg-[var(--theme-bg-secondary)] border border-[var(--theme-glass-border)] rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-[var(--color-border-hover)] transition-all duration-300"
      >
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--theme-bg-tertiary)] border border-[var(--theme-glass-border)] text-xl text-[var(--theme-text-primary)] group-hover:bg-[var(--color-primary-500)] group-hover:text-white transition-colors duration-300">
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="text-[15px] font-semibold text-[var(--theme-text-primary)] tracking-tight">
              {title}
            </h3>
            <p className="mt-1 text-sm text-[var(--theme-text-secondary)] leading-snug">
              {description}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function Home({ user }) {
  const heroRef = useRef(null);
  const actionsRef = useRef(null);

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Student';

  useScrollReveal(heroRef,   { delay: 0.1, duration: 0.8, y: 20 });
  useScrollReveal(actionsRef,{ delay: 0.2, duration: 0.8, y: 20, stagger: 0.1 });

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-12">
      {/* Header */}
      <header className="pt-4 pb-2" ref={heroRef}>
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--theme-text-primary)]">
          Welcome back, {displayName}
        </h1>
        <p className="mt-2 text-[var(--theme-text-secondary)] text-lg">
          Ready to continue your study session?
        </p>
      </header>

      {/* Main Action */}
      <section>
        <ContinueCard 
          topic="Machine Learning"
          subtopic="Logistic Regression"
          completed={12}
          total={20}
          lastStudied="2 hours ago"
          link="/app/quiz"
        />
      </section>

      {/* Quick Actions */}
      <section ref={actionsRef} className="space-y-4">
        <h2 className="text-sm font-semibold tracking-wider text-[var(--theme-text-muted)] uppercase px-1">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QuickActionCard 
            icon="📝" 
            title="Create Notes"  
            description="Turn topics or documents into organized study material."       
            link="/app/notes?type=topic" 
            delay={0.1} 
          />
          <QuickActionCard 
            icon="🎯" 
            title="Generate Quiz"   
            description="Test your knowledge with AI-generated questions." 
            link="/app/quiz?type=topic"  
            delay={0.2} 
          />
          <QuickActionCard 
            icon="📚" 
            title="Review Flashcards"  
            description="Practice active recall on your saved decks."         
            link="/app/history"          
            delay={0.3} 
          />
          <QuickActionCard 
            icon="🎧" 
            title="Focus Mode"  
            description="Enter a distraction-free environment for deep work."         
            link="/app/focus"          
            delay={0.4} 
          />
        </div>
      </section>

      {/* Ambient calm background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[var(--color-primary-500)] opacity-[0.02] blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-[var(--color-secondary-500)] opacity-[0.02] blur-[100px]" />
      </div>
    </div>
  );
}