/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { PropertyInfo, LoanScheme } from '../types';
import { ltvLadderFor } from '../utils';
import { SectionHeader } from '../components/SectionHeader';
import { Field } from '../components/Field';
import { ToggleRow } from '../components/Toggle';
import { Segmented } from '../components/Segmented';

interface GracePeriodSectionProps {
  property: PropertyInfo;
  scheme: LoanScheme;
  onChange: <K extends keyof PropertyInfo>(field: K, value: PropertyInfo[K]) => void;
}

export function GracePeriodSection({
  property,
  scheme,
  onChange,
}: GracePeriodSectionProps) {
  // Reverse so the highest LTV appears first (matches original behaviour).
  const ladder = [...ltvLadderFor(scheme)].reverse();

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="input-card p-4 md:p-6"
    >
      <div className="mb-4">
        <SectionHeader number="03" title="寬限期試算" />
      </div>

      <div className="space-y-4">
        <ToggleRow
          label="需要寬限期"
          checked={property.needsGracePeriod}
          onChange={(v) => onChange('needsGracePeriod', v)}
        />

        {property.needsGracePeriod && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-4 pt-4 border-t border-border-earth overflow-hidden"
          >
            <Field label="寬限期試算貸款成數">
              <Segmented<number>
                size="sm"
                scrollable
                value={property.gracePeriodLTV ?? ladder[0]}
                onChange={(v) => onChange('gracePeriodLTV', v)}
                options={ladder.map((val) => ({
                  value: val,
                  label: `${(val * 100).toFixed(0)}%`,
                }))}
              />
            </Field>
            <p className="text-[10px] text-text-muted italic leading-relaxed">
              ※ 勾選後下方將顯示各寬限期所需之年薪門檻。
            </p>
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}
