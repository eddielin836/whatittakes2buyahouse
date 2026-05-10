/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReactNode } from 'react';

interface SegmentedOption<T> {
  value: T;
  label: ReactNode;
}

interface SegmentedProps<T> {
  options: ReadonlyArray<SegmentedOption<T>>;
  value: T;
  onChange: (next: T) => void;
  size?: 'md' | 'sm';
  scrollable?: boolean;
}

/**
 * Segmented control used for: 預售屋/成屋 toggle, 寬限期 LTV ladder.
 */
export function Segmented<T extends string | number | boolean>({
  options,
  value,
  onChange,
  size = 'md',
  scrollable = false,
}: SegmentedProps<T>) {
  const sizeClasses =
    size === 'sm'
      ? 'py-2 px-3 text-xs'
      : 'py-3 px-4 text-sm';

  return (
    <div
      className={`flex gap-${size === 'sm' ? '2' : '4'} p-1 bg-stone-100 rounded-xl ${
        scrollable ? 'overflow-x-auto' : ''
      }`}
    >
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={selected}
            className={`flex-1 ${sizeClasses} rounded-lg font-bold transition-all whitespace-nowrap ${
              selected
                ? 'bg-white shadow-sm text-stone-800'
                : 'text-stone-400 hover:text-stone-500'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
