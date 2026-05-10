/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { PropertyInfo } from '../types';
import { TAIWAN_CITIES, CITY_BY_NAME } from '../constants';
import { formatCurrency } from '../utils';
import { SectionHeader } from '../components/SectionHeader';
import { Field } from '../components/Field';
import { NumberField } from '../components/NumberField';
import { Segmented } from '../components/Segmented';

interface PropertySectionProps {
  property: PropertyInfo;
  onChange: <K extends keyof PropertyInfo>(field: K, value: PropertyInfo[K]) => void;
  /** Called when city changes — sent separately so the parent can also reset the district. */
  onCityChange: (city: string) => void;
}

export function PropertySection({ property, onChange, onCityChange }: PropertySectionProps) {
  const currentCity = CITY_BY_NAME.get(property.city);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="input-card p-4 md:p-6"
    >
      <SectionHeader number="02" title="購房細節" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="縣市">
          <select
            value={property.city}
            onChange={(e) => onCityChange(e.target.value)}
            className="input-field font-medium appearance-none"
          >
            {TAIWAN_CITIES.map((city) => (
              <option key={city.name} value={city.name}>
                {city.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="行政區">
          <select
            value={property.district}
            onChange={(e) => onChange('district', e.target.value)}
            className="input-field font-medium appearance-none"
          >
            {currentCity?.districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </Field>

        <div className="md:col-span-2">
          <Segmented<boolean>
            value={property.isPreSale}
            onChange={(v) => onChange('isPreSale', v)}
            options={[
              { value: true, label: '預售屋' },
              { value: false, label: '成屋 / 中古' },
            ]}
          />
        </div>

        <NumberField
          label="購屋總價 (萬)"
          suffix="萬"
          value={property.purchasePrice}
          display={(v) => v / 10000}
          parse={(v) => v * 10000}
          inputClassName="input-field pr-12 font-bold text-lg serif"
          onChange={(v) => onChange('purchasePrice', v)}
          hint={`等於 ${formatCurrency(property.purchasePrice ?? 0)}`}
        />

        {!property.isPreSale && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <NumberField
              label="房屋屋齡"
              suffix="年"
              value={property.houseAge}
              onChange={(v) => onChange('houseAge', v)}
            />
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}
