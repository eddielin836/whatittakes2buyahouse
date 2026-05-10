/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReactNode } from 'react';

interface FieldProps {
  label: string;
  /** A short suffix like "歲" / "%" / "元" rendered inside the input on the right. */
  suffix?: string;
  hint?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** Standard label + control wrapper. Suffix overlays the control. */
export function Field({ label, suffix, hint, className = '', children }: FieldProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label className="form-label">{label}</label>
      <div className="relative">
        {children}
        {suffix && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted text-xs font-bold pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
      {hint && <div className="text-[10px] text-text-muted font-medium ml-1">{hint}</div>}
    </div>
  );
}
