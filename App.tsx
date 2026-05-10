/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useMemo, useState } from 'react';
import { BorrowerInfo, PropertyInfo, LoanScheme } from './types';
import {
  SCHEME_DEFAULT_RATES,
  CITY_BY_NAME,
  GRACE_DEFAULT_LTV,
  GRACE_DEFAULT_LTV_NEST_NEST,
} from './constants';
import {
  calculateLoanTerm,
  performMainCalculation,
  performGracePeriodCalculation,
} from './utils';
import { Header } from './sections/Header';
import { BorrowerSection } from './sections/BorrowerSection';
import { PropertySection } from './sections/PropertySection';
import { GracePeriodSection } from './sections/GracePeriodSection';
import { ResultTable } from './sections/ResultTable';
import { GraceGrid } from './sections/GraceGrid';
import { FooterDisclaimer } from './sections/FooterDisclaimer';

const APP_VERSION = (import.meta.env?.VITE_APP_VERSION as string | undefined) ?? 'dev';

export default function App() {
  // ───────────────────────────── State ─────────────────────────────
  const [borrower, setBorrower] = useState<BorrowerInfo>({
    age: 30,
    scheme: LoanScheme.NEW_YOUTH,
    annualRate: SCHEME_DEFAULT_RATES[LoanScheme.NEW_YOUTH],
    otherLoanMonthly: 0,
    residenceCity: '台北市',
    hasGuarantor: false,
    guarantor: {
      otherLoanMonthly: 0,
      residenceCity: '台北市',
    },
  });

  const [property, setProperty] = useState<PropertyInfo>({
    city: '台北市',
    district: '中正區',
    isPreSale: true,
    houseAge: 0,
    purchasePrice: 10000000,
    needsGracePeriod: false,
    gracePeriodLTV: GRACE_DEFAULT_LTV,
  });

  // ───────────────────────────── Side-effects ─────────────────────────────
  // When scheme changes, sync the rate to its default and clamp LTV to a legal value.
  useEffect(() => {
    setBorrower((prev) => ({
      ...prev,
      annualRate: SCHEME_DEFAULT_RATES[prev.scheme],
    }));
    setProperty((prev) => {
      const isNestNest = borrower.scheme === LoanScheme.NEST_NEST;
      if (!isNestNest && prev.gracePeriodLTV === GRACE_DEFAULT_LTV_NEST_NEST) {
        return { ...prev, gracePeriodLTV: GRACE_DEFAULT_LTV };
      }
      return prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [borrower.scheme]);

  // ───────────────────────────── Derived ─────────────────────────────
  const results = useMemo(
    () => performMainCalculation(borrower, property),
    [borrower, property],
  );
  const loanTerm = useMemo(
    () => calculateLoanTerm(borrower, property),
    [borrower, property],
  );
  const gracePeriodResults = useMemo(
    () =>
      property.needsGracePeriod ? performGracePeriodCalculation(borrower, property) : null,
    [borrower, property],
  );

  // ───────────────────────────── Handlers ─────────────────────────────
  function handleBorrowerChange<K extends keyof BorrowerInfo>(
    field: K,
    value: BorrowerInfo[K],
  ) {
    setBorrower((prev) => ({ ...prev, [field]: value }));
  }

  function handleGuarantorChange<K extends keyof BorrowerInfo['guarantor']>(
    field: K,
    value: BorrowerInfo['guarantor'][K],
  ) {
    setBorrower((prev) => ({
      ...prev,
      guarantor: { ...prev.guarantor, [field]: value },
    }));
  }

  function handlePropertyChange<K extends keyof PropertyInfo>(
    field: K,
    value: PropertyInfo[K],
  ) {
    setProperty((prev) => ({ ...prev, [field]: value }));
  }

  /** Switching city auto-resets district to that city's first one (fixes stale-district bug). */
  function handleCityChange(cityName: string) {
    const city = CITY_BY_NAME.get(cityName);
    setProperty((prev) => ({
      ...prev,
      city: cityName,
      district: city ? city.districts[0] : prev.district,
    }));
  }

  // ───────────────────────────── Render ─────────────────────────────
  return (
    <div className="min-h-screen bg-bg-earth text-text-earth font-sans selection:bg-primary selection:text-white p-4 md:p-8 relative">
      <Header />

      <main className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        <div className="lg:col-span-5 space-y-4">
          <BorrowerSection
            borrower={borrower}
            onChange={handleBorrowerChange}
            onGuarantorChange={handleGuarantorChange}
          />
          <PropertySection
            property={property}
            onChange={handlePropertyChange}
            onCityChange={handleCityChange}
          />
          <GracePeriodSection
            property={property}
            scheme={borrower.scheme}
            onChange={handlePropertyChange}
          />
        </div>

        <div className="lg:col-span-7 space-y-4">
          <ResultTable borrower={borrower} loanTerm={loanTerm} results={results} />
          <GraceGrid
            borrower={borrower}
            property={property}
            results={gracePeriodResults}
          />
          <FooterDisclaimer />
        </div>
      </main>

      <div className="absolute bottom-4 right-4 text-[10px] text-stone-400 font-mono pointer-events-none select-none opacity-40 z-50">
        v.{APP_VERSION}
      </div>
    </div>
  );
}
