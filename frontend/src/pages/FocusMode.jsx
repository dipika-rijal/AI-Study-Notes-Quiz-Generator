import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CircularTimer from '../components/ui/CircularTimer';

export default function FocusMode() {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
  const [selectedSound, setSelectedSound] = useState('none');

  const sounds = [
    { id: 'none', label: 'None', icon: '🔇' },
    { id: 'rain', label: 'Rain', icon: '🌧️' },
    { id: 'forest', label: 'Forest', icon: '🌲' },
    { id: 'noise', label: 'White Noise', icon: '〰️' },
  ];

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(25 * 60);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((25 * 60 - timeLeft) / (25 * 60)) * 100;

  return (
    <div className="relative min-h-[80vh] flex flex-col items-center justify-center p-6 overflow-hidden rounded-3xl border border-[var(--theme-glass-border)] bg-[var(--theme-bg-secondary)] shadow-sm">
      {/* Ambient Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.02, 0.04, 0.02],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-[var(--color-primary-500)] blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.01, 0.03, 0.01],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute -bottom-[20%] -right-[10%] w-[80%] h-[80%] rounded-full bg-[var(--color-secondary-500)] blur-[140px]"
        />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center space-y-12 w-full"
        >
          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-xl font-medium tracking-tight text-[var(--theme-text-primary)]">Deep Work</h2>
            <p className="text-sm text-[var(--theme-text-secondary)]">Stay focused and calm.</p>
          </div>

          {/* Timer */}
          <div className="py-8">
            <CircularTimer 
              progress={progress} 
              timeLeft={formatTime(timeLeft)} 
              label={isActive ? 'Focusing...' : 'Ready'} 
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={toggleTimer}
              className={`px-8 py-3 rounded-full text-sm font-medium transition-all duration-300 shadow-sm ${
                isActive 
                  ? 'bg-[var(--theme-bg-tertiary)] text-[var(--theme-text-primary)] border border-[var(--theme-glass-border)]' 
                  : 'bg-[var(--color-primary-500)] text-white hover:bg-[var(--color-primary-600)]'
              }`}
            >
              {isActive ? 'Pause' : 'Start Focus'}
            </button>
            <button
              onClick={resetTimer}
              className="px-6 py-3 rounded-full bg-[var(--theme-bg-tertiary)] border border-[var(--theme-glass-border)] text-sm font-medium text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] transition-colors"
            >
              Reset
            </button>
          </div>

          {/* Ambient Sound Selector */}
          <div className="pt-8 border-t border-[var(--theme-glass-border)] w-full">
            <p className="text-xs font-semibold tracking-wider uppercase text-[var(--theme-text-muted)] mb-4 text-center">
              Ambient Environment
            </p>
            <div className="flex justify-center gap-2">
              {sounds.map(sound => (
                <button
                  key={sound.id}
                  onClick={() => setSelectedSound(sound.id)}
                  className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all duration-300 ${
                    selectedSound === sound.id
                      ? 'bg-[var(--theme-bg-tertiary)] border border-[var(--color-primary-500)] text-[var(--color-primary-500)] shadow-sm'
                      : 'bg-transparent border border-transparent text-[var(--theme-text-secondary)] hover:bg-[var(--theme-bg-tertiary)]'
                  }`}
                  title={sound.label}
                >
                  <span className="text-xl">{sound.icon}</span>
                  <span className="text-[10px] font-medium hidden sm:block">{sound.label}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
