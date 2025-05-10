const { PayrollSystem } = require('../src/payroll');

describe('Payroll System', () => {
  let payrollSystem;

  beforeEach(() => {
    payrollSystem = new PayrollSystem();
  });

  describe('Input Validation', () => {
    test('validates employee data structure', () => {
      expect(() => {
        payrollSystem.calculatePayroll('not-an-array');
      }).toThrow('Employee data must be an array');
    });

    test('validates employee properties', () => {
      const invalidEmployee = [{ id: 1, tenant_id: 'tenant1' }]; // Missing name and salary
      expect(() => {
        payrollSystem.calculatePayroll(invalidEmployee);
      }).toThrow('Invalid employee data');
    });

    test('validates tenant_id is present', () => {
      const employeeWithoutTenant = [
        { id: 1, name: 'Test', salary: 50000 }
      ];
      expect(() => {
        payrollSystem.calculatePayroll(employeeWithoutTenant);
      }).toThrow('Invalid employee data');
    });

    test('validates salary amounts', () => {
      const employeeWithNegativeSalary = [
        { id: 1, name: 'Test', salary: -1000, tenant_id: 'tenant1' }
      ];
      expect(() => {
        payrollSystem.calculatePayroll(employeeWithNegativeSalary);
      }).toThrow('Invalid salary amount');
    });

    test('validates maximum salary limit', () => {
      const employeeWithExcessiveSalary = [
        { id: 1, name: 'Test', salary: 2000000, tenant_id: 'tenant1' }
      ];
      expect(() => {
        payrollSystem.calculatePayroll(employeeWithExcessiveSalary);
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
    test('calculates correct tax for standard income', () => {
      const income = 50000;
      const tax = payrollSystem.calculateTax(income);
      expect(tax).toBe(income * 0.25);
    });

    test('handles zero income correctly', () => {
      const tax = payrollSystem.calculateTax(0);
      expect(tax).toBe(0);
    });
  });

  describe('Payroll Calculations', () => {
    test('calculates payroll correctly', () => {
      const employees = [
        { id: 1, name: 'Test User', salary: 50000, tenant_id: 'tenant1' }
      ];
      
      const results = payrollSystem.calculatePayroll(employees);
      
      expect(results).toHaveLength(1);
      expect(results[0]).toHaveProperty('tenant_id');
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
          tax: 12500,
          deductions: 3500,
          netPay: 34000,
          payPeriod: '2024-01',
          tenant_id: 'tenant1'
        },
        {
          grossPay: 60000,
          tax: 15000,
          deductions: 4200,
          netPay: 40800,
          payPeriod: '2024-01',
          tenant_id: 'tenant1'
        }
      ];

      const summary = payrollSystem.generatePayrollSummary(payrollResults);

      expect(summary.tenant_id).toBe('tenant1');
      expect(summary.employeeCount).toBe(2);
      expect(summary.totalGrossPay).toBe(110000);
      expect(summary.totalTax).toBe(27500);
      expect(summary.totalDeductions).toBe(7700);
      expect(summary.totalNetPay).toBe(74800);
      expect(summary.averageGrossPay).toBe(55000);
      expect(summary.averageNetPay).toBe(37400);
      expect(summary.payPeriod).toBe('2024-01');
      expect(summary.processedAt).toBeDefined();
    });
  });
});