import { BookOpen, FileText, Lightbulb, Sparkles } from 'lucide-react';

const iconByAction = {
  'intent:topic': BookOpen,
  'intent:upload': FileText,
  'intent:pasteText': Sparkles,
  'intent:explain': Lightbulb,
};

export default function ActionChips({ options = [], onSelect, disabled = false, compact = false }) {
  return (
    <div className={`flex flex-wrap gap-2 ${compact ? '' : 'justify-center'}`}>
      {options.map((option) => {
        const Icon = iconByAction[option.value] || Sparkles;
        return (
          <button
            key={option.value}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(option.value)}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--theme-glass-border)] bg-[var(--theme-bg-secondary)] px-3.5 py-2 text-xs font-semibold text-[var(--theme-text-secondary)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--color-primary-500)] hover:bg-[var(--theme-bg-tertiary)] hover:text-[var(--theme-text-primary)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon size={14} className="text-[var(--color-primary-500)]" />
            {option.label.replace(/^[^\p{L}\p{N}]+/u, '')}
          </button>
        );
      })}
    </div>
  );
}
