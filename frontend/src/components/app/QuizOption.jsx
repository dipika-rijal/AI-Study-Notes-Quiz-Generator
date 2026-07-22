import { motion } from 'framer-motion';

export default function QuizOption({ 
  option, 
  index, 
  isSelected, 
  isCorrect, 
  isWrong, 
  onClick, 
  disabled 
}) {
  let bgColor = 'var(--theme-bg-secondary)';
  let borderColor = 'var(--theme-glass-border)';
  let textColor = 'var(--theme-text-primary)';
  
  if (isCorrect) {
    bgColor = 'var(--color-success-bg)';
    borderColor = 'var(--color-success-border)';
    textColor = 'var(--color-success-text)';
  } else if (isWrong) {
    bgColor = 'var(--color-error-bg)';
    borderColor = 'var(--color-error-border)';
    textColor = 'var(--color-error-text)';
  } else if (isSelected) {
    bgColor = 'var(--color-info-bg)';
    borderColor = 'var(--color-info-border)';
    textColor = 'var(--color-info-text)';
  }

  const shakeAnimation = isWrong ? {
    x: [0, -10, 10, -10, 10, -5, 5, 0],
    transition: { duration: 0.5 }
  } : {};

  return (
    <motion.button
      animate={shakeAnimation}
      whileHover={!disabled && !isCorrect && !isWrong ? { y: -2, borderColor: 'var(--color-primary-500)' } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={disabled}
      style={{
        backgroundColor: bgColor,
        borderColor: borderColor,
        color: textColor
      }}
      className="w-full text-left p-4 rounded-xl border transition-colors duration-300 shadow-sm"
    >
      <div className="flex items-center gap-4">
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center font-medium text-sm transition-colors duration-300"
          style={{
            backgroundColor: (isCorrect || isWrong || isSelected) ? 'transparent' : 'var(--theme-bg-tertiary)',
            color: (isCorrect || isWrong || isSelected) ? textColor : 'var(--theme-text-secondary)',
            border: (isCorrect || isWrong || isSelected) ? `1px solid ${borderColor}` : '1px solid transparent'
          }}
        >
          {String.fromCharCode(65 + index)}
        </div>
        <span className="flex-1 font-medium text-[15px]">{option}</span>
        
        {isCorrect && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[var(--color-success-text)] text-lg">
            ✓
          </motion.div>
        )}
        {isWrong && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[var(--color-error-text)] text-lg">
            ✕
          </motion.div>
        )}
      </div>
    </motion.button>
  );
}
