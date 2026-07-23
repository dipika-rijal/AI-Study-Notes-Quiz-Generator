import React from "react";
import ActionChips from './ActionChips';

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

  return <div className="mt-4"><ActionChips options={options} onSelect={onSelect} disabled={disabled} compact /></div>;
}

export default React.memo(SuggestionChips);
