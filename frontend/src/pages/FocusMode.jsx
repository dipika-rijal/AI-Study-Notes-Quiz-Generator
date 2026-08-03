import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import CircularTimer from '../components/ui/CircularTimer';
import {
  CloudRain, Waves, Flame,
  Music, Sparkles, Heart, AudioWaveform,
  Wind, Moon, Leaf, Coffee
} from 'lucide-react';
import {
  getActiveAmbientSound,
  playAmbientSound,
  stopAmbientSound as stopSharedAmbientSound,
} from '../lib/ambientAudio';

export default function FocusMode() {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
  const [selectedSound, setSelectedSound] = useState(getActiveAmbientSound);
  const [isSoundPlaying, setIsSoundPlaying] = useState(() => getActiveAmbientSound() !== 'none');
  const completionPlayedRef = useRef(false);

  const playEffect = (file) => {
    const audio = new Audio(`/sounds/${file}`);
    audio.volume = 0.55;
    audio.play().catch(() => {});
  };

  const soundCategories = [
    {
      label: 'Nature',
      sounds: [
        { id: 'rain', label: 'Rain', icon: CloudRain, file: 'rain.mp3' },
        { id: 'waves', label: 'Ocean Waves', icon: Waves, file: 'waves.mp3' },
        { id: 'fire', label: 'Fireplace', icon: Flame, file: 'fire.mp3' },
      ],
    },
    {
      label: 'Music',
      sounds: [
        { id: 'ambient-piano', label: 'Ambient Piano', icon: Music, file: 'ambient-piano.mp3' },
        { id: 'uplifting-piano', label: 'Uplifting Piano', icon: Sparkles, file: 'uplifting-piano.mp3' },
        { id: 'emotional', label: 'Emotional', icon: Heart, file: 'emotional.mp3' },
        { id: 'playful-beats', label: 'Playful Beats', icon: AudioWaveform, file: 'playful-beats.mp3' },
      ],
    },
    {
      label: 'Ambiance',
      sounds: [
        { id: 'peaceful', label: 'Peaceful', icon: Wind, file: 'peaceful.mp3' },
        { id: 'smooth', label: 'Smooth', icon: Moon, file: 'smooth.mp3' },
        { id: 'calm-energy', label: 'Calm Energy', icon: Leaf, file: 'calm-energy.mp3' },
        { id: 'deep-calm', label: 'Deep Calm', icon: Coffee, file: 'deep-calm.mp3' },
      ],
    },
  ];

  const stopAmbientSound = () => {
    stopSharedAmbientSound();
    setIsSoundPlaying(false);
    setSelectedSound('none');
  };

  const selectAmbientSound = async (sound) => {
    if (!sound.file) {
      stopAmbientSound();
      return;
    }

    setSelectedSound(sound.id);
    setIsSoundPlaying(await playAmbientSound(sound));
  };

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (!completionPlayedRef.current) {
        completionPlayedRef.current = true;
        playEffect('complete.mp3');
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => {
    if (!isActive && timeLeft > 0) playEffect('notification.mp3');
    setIsActive(!isActive);
  };
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(25 * 60);
    completionPlayedRef.current = false;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((25 * 60 - timeLeft) / (25 * 60)) * 100;

  return (
    <div className="relative w-full lg:h-[600px] flex flex-col items-center justify-center p-8 lg:p-12 overflow-hidden rounded-3xl border border-[var(--theme-glass-border)] bg-[var(--theme-bg-secondary)] shadow-sm">
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

      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16 h-full">
        
        {/* LEFT COLUMN: Timer & Controls */}
        <div
          className="text-center space-y-8 w-full lg:w-[45%] flex flex-col items-center justify-center h-full flex-shrink-0"
        >
          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-xl font-medium tracking-tight text-[var(--theme-text-primary)]">Deep Work</h2>
            <p className="text-sm text-[var(--theme-text-secondary)]">Stay focused and calm.</p>
          </div>

          {/* Timer */}
          <div className="py-2">
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
              className="px-8 py-3 rounded-full text-sm font-medium transition-all duration-300 shadow-sm bg-[var(--color-primary-500)] text-white hover:bg-[var(--color-primary-600)]"
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
        </div>

        {/* RIGHT COLUMN: Ambient Sound Selector */}
        <div
          className="w-full lg:w-[55%] lg:border-l border-[var(--theme-glass-border)] lg:pl-10 h-full flex flex-col overflow-hidden py-4"
        >
          <div className="w-full flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <p className="text-sm font-semibold tracking-wider uppercase text-[var(--theme-text-muted)]">
                Ambient Environment
              </p>
              {selectedSound !== 'none' && (
                <button
                  type="button"
                  onClick={stopAmbientSound}
                  className="rounded-full bg-[var(--color-error-bg)] px-3 py-1 text-xs font-semibold text-[var(--color-error-text)] transition hover:bg-[var(--theme-bg-tertiary)] hover:text-red-500 flex items-center gap-1.5 border border-[var(--color-error-border)]"
                >
                  <span>Stop</span> <span className="hidden sm:inline">Sound</span>
                </button>
              )}
            </div>

            <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar text-left">
              {soundCategories.map((category) => (
                <div key={category.label}>
                  <p className="text-xs font-medium text-[var(--theme-text-secondary)] mb-2.5 pl-1">
                    {category.label}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {category.sounds.map((sound) => {
                      const Icon = sound.icon;
                      return (
                        <button
                          key={sound.id}
                          onClick={() => selectAmbientSound(sound)}
                          className={`p-3 rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-300 border ${
                            selectedSound === sound.id
                              ? 'bg-[var(--theme-bg-tertiary)] border-[var(--color-primary-500)] shadow-sm text-[var(--color-primary-500)]'
                              : 'bg-transparent border-[var(--theme-glass-border)] hover:bg-[var(--theme-surface-hover)] hover:border-[var(--color-border-hover)] text-[var(--theme-text-secondary)]'
                          }`}
                          title={sound.label}
                        >
                          <Icon size={24} strokeWidth={1.5} className="mb-0.5" />
                          <span className="text-[10px] font-semibold text-center leading-tight truncate w-full px-1">
                            {sound.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {selectedSound !== 'none' && (
              <div className="mt-4 flex items-center justify-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--theme-bg-tertiary)] border border-[var(--theme-glass-border)] text-xs font-medium text-[var(--theme-text-secondary)]">
                  <span className="relative flex h-2 w-2">
                    {isSoundPlaying && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-primary-500)] opacity-75"></span>
                    )}
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-primary-500)]"></span>
                  </span>
                  {isSoundPlaying ? 'Playing in background' : 'Sound paused'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
