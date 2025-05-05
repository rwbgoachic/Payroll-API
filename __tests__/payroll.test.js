const { SecurityManager } = require('@paysurity/security');
const { TaxCalculator } = require('@paysurity/tax');
const { PayrollSystem } = require('../src/payroll');

describe('Payroll System', () => {
  let securityManager;
  let taxCalculator;
  let payrollSystem;

  beforeEach(() => {
    securityManager = new SecurityManager();
    taxCalculator = new TaxCalculator();
    payrollSystem = new PayrollSystem();
  });

  describe('Security', () => {
    test('SecurityManager initializes correctly', () => {
      expect(securityManager).toBeDefined();
    });

    test('validates payroll access tokens', () => {
      const validToken = securityManager.generatePayrollToken();
      expect(securityManager.validateToken(validToken)).toBe(true);
    });

    test('rejects invalid tokens', () => {
      expect(() => {
        payrollSystem.calculatePayroll([], 'invalid-token');
      }).toThrow('Invalid security token');
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

  describe('Payroll Calculations', () => {
    test('calculates payroll correctly', () => {
      const token = securityManager.generatePayrollToken();
      const employees = [
        { id: 1, name: 'Test User', salary: 50000 }
      ];
      
      const results = payrollSystem.calculatePayroll(employees, token);
      
      expect(results).toHaveLength(1);
      expect(results[0]).toHaveProperty('grossPay');
      expect(results[0]).toHaveProperty('tax');
      expect(results[0]).toHaveProperty('netPay');
      expect(results[0].netPay).toBe(results[0].grossPay - results[0].tax);
    });
  });
});