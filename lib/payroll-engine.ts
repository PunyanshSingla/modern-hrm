/**
 * Indian Payroll Engine Logic
 * Handles PF, ESI, PT, and TDS calculations based on statutory rules.
 */

export interface StatutoryLimits {
  PF_WAGE_CEILING: number;
  PF_EMPLOYEE_RATE: number;
  PF_EMPLOYER_RATE: number;
  ESI_WAGE_CEILING: number;
  ESI_EMPLOYEE_RATE: number;
  ESI_EMPLOYER_RATE: number;
}

export const CURRENT_LIMITS: StatutoryLimits = {
  PF_WAGE_CEILING: 15000,
  PF_EMPLOYEE_RATE: 0.12,
  PF_EMPLOYER_RATE: 0.12,
  ESI_WAGE_CEILING: 21000,
  ESI_EMPLOYEE_RATE: 0.0075,
  ESI_EMPLOYER_RATE: 0.0325,
};

/**
 * Calculates Employee PF Contribution
 * Rule: 12% of (Basic + DA). Usually capped at 15k basic unless voluntary.
 */
export function calculatePF(basicAmount: number, useCeiling: boolean = true) {
  const wage = useCeiling ? Math.min(basicAmount, CURRENT_LIMITS.PF_WAGE_CEILING) : basicAmount;
  return Math.round(wage * CURRENT_LIMITS.PF_EMPLOYEE_RATE);
}

/**
 * Calculates Employer PF Contribution
 * Rule: 12% of (Basic + DA). 8.33% goes to EPS, 3.67% to EPF.
 */
export function calculateEmployerPF(basicAmount: number, useCeiling: boolean = true) {
  const wage = useCeiling ? Math.min(basicAmount, CURRENT_LIMITS.PF_WAGE_CEILING) : basicAmount;
  return Math.round(wage * CURRENT_LIMITS.PF_EMPLOYER_RATE);
}

/**
 * Calculates ESI Contribution
 * Rule: Applicable if Gross <= 21,000.
 * Employee: 0.75% of Gross, Employer: 3.25% of Gross.
 */
export function calculateESI(grossAmount: number) {
  if (grossAmount > CURRENT_LIMITS.ESI_WAGE_CEILING) {
    return { employee: 0, employer: 0 };
  }
  return {
    employee: Math.ceil(grossAmount * CURRENT_LIMITS.ESI_EMPLOYEE_RATE),
    employer: Math.ceil(grossAmount * CURRENT_LIMITS.ESI_EMPLOYER_RATE)
  };
}

/**
 * Calculates Professional Tax (PT)
 * Slabs vary by state. This is a generic implementation (Maharashtra-like).
 */
export function calculatePT(grossAmount: number, month: number) {
  if (grossAmount <= 7500) return 0;
  if (grossAmount <= 10000) return 175;
  
  // Maharashtra: 200/month, 300 in February
  return month === 1 ? 300 : 200; 
}

/**
 * Pro-rata calculation for mid-month joins/exits or LOP
 */
export function calculateProRata(monthlyAmount: number, totalDays: number, paidDays: number) {
  if (totalDays === 0) return 0;
  return Math.round((monthlyAmount / totalDays) * paidDays);
}

/**
 * Income Tax (TDS) Projection (FY 2024-25 New Regime)
 * Slabs: 
 * 0-3L: NIL
 * 3-7L: 5%
 * 7-10L: 10%
 * 10-12L: 15%
 * 12-15L: 20%
 * 15L+: 30%
 * Standard Deduction: 75,000 (included in exemptions)
 */
export function projectTax(annualIncome: number, exemptions: number = 75000, regime: 'Old' | 'New' = 'New') {
  const taxableIncome = Math.max(0, annualIncome - exemptions);
  
  if (regime === 'New') {
    if (taxableIncome <= 300000) return 0;
    
    // Rebate under 87A: No tax if taxable income <= 7,00,000
    if (annualIncome <= 700000) return 0;

    let tax = 0;
    if (taxableIncome > 1500000) tax += (taxableIncome - 1500000) * 0.30;
    if (taxableIncome > 1200000) tax += (Math.min(taxableIncome, 1500000) - 1200000) * 0.20;
    if (taxableIncome > 1000000) tax += (Math.min(taxableIncome, 1200000) - 1000000) * 0.15;
    if (taxableIncome > 700000) tax += (Math.min(taxableIncome, 1000000) - 700000) * 0.10;
    if (taxableIncome > 300000) tax += (Math.min(taxableIncome, 700000) - 300000) * 0.05;

    // Add 4% Cess
    return Math.round(tax * 1.04);
  }
  
  // Basic Old Regime fallback
  return Math.round(taxableIncome * 0.20); 
}
