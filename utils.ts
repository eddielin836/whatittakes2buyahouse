/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  BorrowerInfo,
  PropertyInfo,
  CalculationResult,
  GracePeriodResult,
  LoanScheme,
} from './types';
import {
  SCHEME_DEFAULT_RATES,
  SCHEME_DEFAULT_YEARS,
  CITY_BY_NAME,
  DEFAULT_LIVING_EXPENSE,
  MAX_AGE_AT_LOAN_END,
  MAX_HOUSE_AGE_PLUS_TERM,
  OLD_HOUSE_TERM_PENALTY_YEARS,
  DTI_RATIOS,
  GRACE_PERIOD_RATIOS,
  GRACE_LONG_THRESHOLD_YEARS,
  GRACE_DEFAULT_LTV,
  GRACE_DEFAULT_LTV_NEST_NEST,
  LTV_LADDER_DEFAULT,
  LTV_LADDER_NEST_NEST,
} from './constants';

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────
function livingExpenseFor(cityName: string): number {
  return CITY_BY_NAME.get(cityName)?.livingExpense ?? DEFAULT_LIVING_EXPENSE;
}

/** Total household living expense + other monthly debts (借款人 + 保證人). */
function getHouseholdOutflow(borrower: BorrowerInfo, property: PropertyInfo) {
  let livingExpense = livingExpenseFor(property.city);
  let otherMonthlyRepayments = borrower.otherLoanMonthly ?? 0;

  if (borrower.hasGuarantor) {
    livingExpense += livingExpenseFor(borrower.guarantor.residenceCity);
    otherMonthlyRepayments += borrower.guarantor.otherLoanMonthly ?? 0;
  }

  return { livingExpense, otherMonthlyRepayments };
}

/** Required DTI multiplier for a given LTV (主表). */
function getRequiredRatio(ltv: number): number {
  if (ltv >= 0.8) return DTI_RATIOS.LTV_80_PLUS;
  if (ltv >= 0.75) return DTI_RATIOS.LTV_75;
  if (ltv >= 0.7) return DTI_RATIOS.LTV_70;
  if (ltv >= 0.65) return DTI_RATIOS.LTV_65;
  return DTI_RATIOS.LTV_60;
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculate Monthly Payment using PMT formula.
 */
export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  years: number,
): number {
  if (principal <= 0 || years <= 0) return 0;
  const monthlyRate = annualRate / 100 / 12;
  const numberOfPayments = years * 12;

  if (monthlyRate === 0) return principal / numberOfPayments;

  return (
    (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
  );
}

/**
 * Calculate Loan Term based on age + house-age constraints.
 */
export function calculateLoanTerm(borrower: BorrowerInfo, property: PropertyInfo): number {
  // a. 預設年限：依方案
  let years = SCHEME_DEFAULT_YEARS[borrower.scheme];

  // b. 年限 + 年齡 ≤ MAX_AGE_AT_LOAN_END
  const age = borrower.age ?? 0;
  if (age + years > MAX_AGE_AT_LOAN_END) {
    years = Math.max(0, MAX_AGE_AT_LOAN_END - age);
  }

  // c. 屋齡 + 年限 > MAX_HOUSE_AGE_PLUS_TERM (非預售屋)，酌減 OLD_HOUSE_TERM_PENALTY_YEARS
  if (!property.isPreSale && (property.houseAge ?? 0) > 0) {
    if ((property.houseAge ?? 0) + years > MAX_HOUSE_AGE_PLUS_TERM) {
      years = Math.max(0, years - OLD_HOUSE_TERM_PENALTY_YEARS);
    }
  }

  return years;
}

/** Default LTV for the grace-period card based on scheme. */
export function defaultGraceLTV(scheme: LoanScheme): number {
  return scheme === LoanScheme.NEST_NEST
    ? GRACE_DEFAULT_LTV_NEST_NEST
    : GRACE_DEFAULT_LTV;
}

/** LTV ladder used by main result table (and grace-period selector). */
export function ltvLadderFor(scheme: LoanScheme): readonly number[] {
  return scheme === LoanScheme.NEST_NEST ? LTV_LADDER_NEST_NEST : LTV_LADDER_DEFAULT;
}

/** Effective annual rate (custom override, falling back to scheme default). */
export function effectiveAnnualRate(borrower: BorrowerInfo): number {
  return borrower.annualRate ?? SCHEME_DEFAULT_RATES[borrower.scheme];
}

/**
 * Main calculation: produces one row per LTV in descending order.
 */
export function performMainCalculation(
  borrower: BorrowerInfo,
  property: PropertyInfo,
): CalculationResult[] {
  const years = calculateLoanTerm(borrower, property);
  const rate = effectiveAnnualRate(borrower);
  const purchasePrice = property.purchasePrice ?? 0;

  const { livingExpense, otherMonthlyRepayments } = getHouseholdOutflow(borrower, property);
  const ladder = ltvLadderFor(borrower.scheme);

  const results: CalculationResult[] = ladder.map((ltv) => {
    const loanAmount = purchasePrice * ltv;
    const monthlyRepayment = calculateMonthlyPayment(loanAmount, rate, years);
    const totalMonthlyOutflow = monthlyRepayment + otherMonthlyRepayments + livingExpense;
    const requiredAnnualIncome = getRequiredRatio(ltv) * totalMonthlyOutflow * 12;

    return {
      ltv: ltv * 100,
      loanAmount,
      monthlyRepayment,
      requiredAnnualIncome,
    };
  });

  return results.sort((a, b) => b.ltv - a.ltv);
}

/**
 * Grace period: required income for 1–5 years of interest-only.
 * Re-uses the same household-outflow helper as the main calc.
 */
export function performGracePeriodCalculation(
  borrower: BorrowerInfo,
  property: PropertyInfo,
): GracePeriodResult[] {
  const loanTerm = calculateLoanTerm(borrower, property);
  const rate = effectiveAnnualRate(borrower);
  const ltv = property.gracePeriodLTV ?? defaultGraceLTV(borrower.scheme);
  const loanAmount = (property.purchasePrice ?? 0) * ltv;

  const { livingExpense, otherMonthlyRepayments } = getHouseholdOutflow(borrower, property);

  return [1, 2, 3, 4, 5].map((graceYears) => {
    const remainingYears = loanTerm - graceYears;
    const monthlyRepayAfterGrace = calculateMonthlyPayment(loanAmount, rate, remainingYears);
    const ratio =
      graceYears < GRACE_LONG_THRESHOLD_YEARS
        ? GRACE_PERIOD_RATIOS.SHORT
        : GRACE_PERIOD_RATIOS.LONG;
    const totalMonthlyOutflow =
      monthlyRepayAfterGrace + otherMonthlyRepayments + livingExpense;

    return {
      label: `${graceYears} 年`,
      ratio,
      loanAmount,
      monthlyRepayAfterGrace,
      requiredAnnualIncome: ratio * totalMonthlyOutflow * 12,
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Formatters
// ─────────────────────────────────────────────────────────────────────────────
const TWD_FORMATTER = new Intl.NumberFormat('zh-TW', {
  style: 'currency',
  currency: 'TWD',
  maximumFractionDigits: 0,
});

export function formatCurrency(value: number): string {
  return TWD_FORMATTER.format(value);
}

export function formatIncome(value: number): string {
  if (value >= 10000) return `${(value / 10000).toFixed(0)}萬↑`;
  return value.toString();
}

export function formatIncomeRounded(value: number): string {
  return formatIncome(Math.round(value / 10000) * 10000);
}
