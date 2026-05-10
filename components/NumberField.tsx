/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReactNode } from 'react';
import { Field } from './Field';

interface NumberFieldProps {
  label: string;
  suffix?: string;
  hint?: ReactNode;
  /** undefined renders as empty; this lets the user type 0 freely. */
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  step?: number | string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  /** Apply an extra value transform (e.g. divide by 10000 for 萬) on display. */
  display?: (value: number) => number;
  /** Inverse of display when reading user input. */
  parse?: (value: number) => number;
}

/**
 * Numeric input with proper undefined handling — typing nothing means "unset",
 * not "0". The previous `value === 0 ? '' : value` pattern made it impossible
 * for users to ever type the digit 0.
 */
export function NumberField({
  label,
  suffix,
  hint,
  value,
  onChange,
  step,
  placeholder,
  className,
  inputClassName = 'input-field pr-12 font-medium',
  display,
  parse,
}: NumberFieldProps) {
  const shown =
    value === undefined || Number.isNaN(value)
      ? ''
      : display
        ? display(value)
        : value;

  const handleChange = (raw: string) => {
    if (raw === '') {
      onChange(undefined);
      return;
    }
    const parsed = parseFloat(raw);
    if (Number.isNaN(parsed)) return;
    onChange(parse ? parse(parsed) : parsed);
  };

  return (
    <Field label={label} suffix={suffix} hint={hint} className={className}>
      <input
        type="number"
        step={step}
        value={shown}
        placeholder={placeholder}
        onChange={(e) => handleChange(e.target.value)}
        className={inputClassName}
      />
    </Field>
  );
}
