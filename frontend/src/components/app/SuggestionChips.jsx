import React from "react";

/**
 * Interactive suggestion chips to display as selections under AI messages.
 * 
 * @param {object} props
 * @param {Array<object>} props.options - Array of chip options: [{ value, label, icon }]
 * @param {function} props.onSelect - Callback invoked when a chip is clicked.
 * @param {boolean} [props.disabled] - Disables clicking.
 */
function SuggestionChips({ options = [], onSelect, disabled = false }) {
  if (!options || options.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2.5 mt-4 mb-2 max-w-full">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => !disabled && onSelect(option.value)}
          disabled={disabled}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-black transition border
            ${
              disabled
                ? "bg-purple-50/50 border-purple-100 text-purple-300 cursor-not-allowed"
                : "bg-white border-purple-100 text-[#6757ff] hover:bg-[#eeeaff] hover:border-[#6757ff] active:scale-95 hover:-translate-y-0.5 shadow-sm shadow-purple-50 hover:shadow-purple-100 cursor-pointer"
            }`}
        >
          {option.icon && <span className="text-sm leading-none">{option.icon}</span>}
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );
}

export default React.memo(SuggestionChips);
