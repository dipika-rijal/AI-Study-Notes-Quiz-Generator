import { FileImage, FileText, StickyNote } from 'lucide-react';

const items = [
  { id: 'file', label: 'Upload Files', description: 'Summarize a document', icon: FileText },
  { id: 'image', label: 'Upload Image', description: 'Add a study image', icon: FileImage },
];

export default function AttachmentMenu({ onSelect, disabled }) {
  return (
    <div className="absolute bottom-[calc(100%+10px)] left-0 z-20 w-60 rounded-2xl border border-[var(--theme-glass-border)] bg-[var(--theme-bg-secondary)] p-2 shadow-xl">
      {items.map(({ id, label, description, icon: Icon }) => (
        <button
          key={id}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(id)}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-[var(--theme-bg-tertiary)] disabled:opacity-50"
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--theme-bg-tertiary)] text-[var(--color-primary-500)]"><Icon size={16} /></span>
          <span><span className="block text-sm font-semibold text-[var(--theme-text-primary)]">{label}</span><span className="block text-[11px] text-[var(--theme-text-muted)]">{description}</span></span>
        </button>
      ))}
    </div>
  );
}
