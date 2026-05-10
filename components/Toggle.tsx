/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface ToggleProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
  ariaLabel?: string;
}

/**
 * Switch-style toggle. Uses role="switch" + aria-checked for screen readers.
 */
export function Toggle({ checked, onChange, ariaLabel, label }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel ?? label}
      onClick={() => onChange(!checked)}
      className={`w-12 h-6 rounded-full relative p-1 transition-colors duration-200 ${
        checked ? 'bg-primary' : 'bg-stone-300'
      }`}
    >
      <div
        className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
          checked ? 'translate-x-6' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

interface ToggleRowProps extends ToggleProps {
  label: string;
  bordered?: boolean;
}

/** Common row pattern: a label on the left, a toggle on the right. */
export function ToggleRow({ label, bordered, ...toggle }: ToggleRowProps) {
  return (
    <div
      className={`flex items-center justify-between ${
        bordered ? 'pt-4 border-t border-border-earth' : ''
      }`}
    >
      <span className="text-sm font-bold text-stone-700">{label}</span>
      <Toggle {...toggle} ariaLabel={label} />
    </div>
  );
}
