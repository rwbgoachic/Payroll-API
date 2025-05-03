const { SecurityManager } = require('@paysurity/security');
const { TaxCalculator } = require('@paysurity/tax');

describe('Payroll System', () => {
  let securityManager;
  let taxCalculator;

  beforeEach(() => {
    securityManager = new SecurityManager();
    taxCalculator = new TaxCalculator();
  });

  describe('Security', () => {
    test('SecurityManager initializes correctly', () => {
      expect(securityManager).toBeDefined();
    });

    test('validates payroll access tokens', () => {
      const validToken = securityManager.generatePayrollToken();
      expect(securityManager.validateToken(validToken)).toBe(true);
    });
  });

  describe('Tax Calculations', () => {
    test('TaxCalculator initializes correctly', () => {
      expect(taxCalculator).toBeDefined();
    });

    test('calculates correct tax for standard income', () => {
      const income = 50000;
      const tax = taxCalculator.calculateIncomeTax(income);
      expect(tax).toBeGreaterThan(0);
      expect(typeof tax).toBe('number');
    });

    test('handles zero income correctly', () => {
      const tax = taxCalculator.calculateIncomeTax(0);
      expect(tax).toBe(0);
    });
  });
});