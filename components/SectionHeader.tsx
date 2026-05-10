/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReactNode } from 'react';

interface SectionHeaderProps {
  number: string;
  title: string;
  subtitle?: ReactNode;
}

/** Numbered circle + serif title. Used by every input section. */
export function SectionHeader({ number, title, subtitle }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-4 md:mb-6">
      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
        {number}
      </div>
      <h2 className="font-bold serif text-lg md:text-xl text-primary text-nowrap">{title}</h2>
      {subtitle && (
        <span className="text-[10px] md:text-xs text-text-muted font-bold ml-1 italic">
          {subtitle}
        </span>
      )}
    </div>
  );
}
