/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { Users } from 'lucide-react';
import { BorrowerInfo, LoanScheme } from '../types';
import {
  SCHEME_LABELS,
  SCHEME_DEFAULT_RATES,
  TAIWAN_CITIES,
  schemeAllowsCustomRate,
} from '../constants';
import { SectionHeader } from '../components/SectionHeader';
import { NumberField } from '../components/NumberField';
import { Field } from '../components/Field';
import { ToggleRow } from '../components/Toggle';

interface BorrowerSectionProps {
  borrower: BorrowerInfo;
  onChange: <K extends keyof BorrowerInfo>(field: K, value: BorrowerInfo[K]) => void;
  onGuarantorChange: <K extends keyof BorrowerInfo['guarantor']>(
    field: K,
    value: BorrowerInfo['guarantor'][K],
  ) => void;
}

export function BorrowerSection({
  borrower,
  onChange,
  onGuarantorChange,
}: BorrowerSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="input-card p-4 md:p-6"
    >
      <SectionHeader
        number="01"
        title="借款人與保證人"
        subtitle="※ 首購及自住使用"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NumberField
          label="借款人年齡"
          suffix="歲"
          value={borrower.age}
          onChange={(v) => onChange('age', v)}
        />

        <Field label="房貸方案選擇">
          <select
            value={borrower.scheme}
            onChange={(e) => onChange('scheme', e.target.value as LoanScheme)}
            className="input-field font-medium appearance-none"
          >
            {Object.entries(SCHEME_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>

        {schemeAllowsCustomRate(borrower.scheme) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="overflow-hidden"
          >
            <NumberField
              label="自定義貸款利率 (%)"
              suffix="%"
              step="0.001"
              value={borrower.annualRate}
              placeholder={SCHEME_DEFAULT_RATES[borrower.scheme].toString()}
              onChange={(v) => onChange('annualRate', v)}
            />
          </motion.div>
        )}

        <NumberField
          label="其他貸款月還款金額 (信貸、車貸等)"
          suffix="元"
          className="md:col-span-2"
          value={borrower.otherLoanMonthly}
          onChange={(v) => onChange('otherLoanMonthly', v)}
        />

        <div className="md:col-span-2">
          <ToggleRow
            bordered
            label="提供一般保證人"
            checked={borrower.hasGuarantor}
            onChange={(v) => onChange('hasGuarantor', v)}
          />
        </div>
      </div>

      <AnimatePresence>
        {borrower.hasGuarantor && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mt-4 bg-stone-50/50 rounded-xl p-4 border border-border-earth/50 space-y-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-text-muted" />
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
                保證人資料
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="居住地">
                <select
                  value={borrower.guarantor.residenceCity}
                  onChange={(e) => onGuarantorChange('residenceCity', e.target.value)}
                  className="input-field font-medium text-sm"
                >
                  {TAIWAN_CITIES.map((city) => (
                    <option key={`guarantor-${city.name}`} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </Field>

              <NumberField
                label="其他貸款月還款金額 (信貸、車貸等)"
                suffix="元"
                className="md:col-span-2"
                value={borrower.guarantor.otherLoanMonthly}
                onChange={(v) => onGuarantorChange('otherLoanMonthly', v)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
