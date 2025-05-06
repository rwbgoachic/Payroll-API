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

  describe('Input Validation', () => {
    const validToken = 'valid-token';
    
    beforeEach(() => {
      jest.spyOn(securityManager, 'validateToken').mockReturnValue(true);
    });

    test('validates employee data structure', () => {
      expect(() => {
        payrollSystem.calculatePayroll('not-an-array', validToken);
      }).toThrow('Employee data must be an array');
    });

    test('validates employee properties', () => {
      const invalidEmployee = [{ id: 1 }]; // Missing name and salary
      expect(() => {
        payrollSystem.calculatePayroll(invalidEmployee, validToken);
      }).toThrow('Invalid employee data');
    });

    test('validates salary amounts', () => {
      const employeeWithNegativeSalary = [
        { id: 1, name: 'Test', salary: -1000 }
      ];
      expect(() => {
        payrollSystem.calculatePayroll(employeeWithNegativeSalary, validToken);
      }).toThrow('Invalid salary amount');
    });

    test('validates maximum salary limit', () => {
      const employeeWithExcessiveSalary = [
        { id: 1, name: 'Test', salary: 2000000 }
      ];
      expect(() => {
        payrollSystem.calculatePayroll(employeeWithExcessiveSalary, validToken);
      }).toThrow('Salary amount exceeds maximum limit');
    });
  });

  describe('Deductions', () => {
    test('calculates correct deductions', () => {
      const salary = 50000;
      const expectedDeductions = salary * 0.07; // 2% insurance + 5% retirement
      const deductions = payrollSystem.calculateDeductions(salary);
      expect(deductions).toBe(expectedDeductions);
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
      expect(results[0]).toHaveProperty('deductions');
      expect(results[0]).toHaveProperty('netPay');
      expect(results[0]).toHaveProperty('payPeriod');
      expect(results[0]).toHaveProperty('processedAt');
      expect(results[0].netPay).toBe(results[0].grossPay - results[0].tax - results[0].deductions);
    });

    test('generates correct payroll summary', () => {
      const payrollResults = [
        { 
          grossPay: 50000,
          tax: 10000,
          deductions: 3500,
          netPay: 36500,
          payPeriod: '2024-01'
        },
        {
          grossPay: 60000,
          tax: 12000,
          deductions: 4200,
          netPay: 43800,
          payPeriod: '2024-01'
        }
      ];

      const summary = payrollSystem.generatePayrollSummary(payrollResults);

      expect(summary.employeeCount).toBe(2);
      expect(summary.totalGrossPay).toBe(110000);
      expect(summary.totalTax).toBe(22000);
      expect(summary.totalDeductions).toBe(7700);
      expect(summary.totalNetPay).toBe(80300);
      expect(summary.averageGrossPay).toBe(55000);
      expect(summary.averageNetPay).toBe(40150);
      expect(summary.payPeriod).toBe('2024-01');
      expect(summary.processedAt).toBeDefined();
    });
  });
});