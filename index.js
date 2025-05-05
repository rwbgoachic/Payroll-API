const { SecurityManager } = require('@paysurity/security');
const { TaxCalculator } = require('@paysurity/tax');
const { PayrollSystem } = require('./src/payroll');

const securityManager = new SecurityManager();
const taxCalculator = new TaxCalculator();
const payrollSystem = new PayrollSystem();

// Example usage
const sampleEmployees = [
  { id: 1, name: 'John Doe', salary: 50000 },
  { id: 2, name: 'Jane Smith', salary: 60000 }
];

const token = securityManager.generatePayrollToken();
const payrollResults = payrollSystem.calculatePayroll(sampleEmployees, token);

console.log('Payroll System Initialized');
console.log(`Security Module Version: ${SecurityManager.VERSION}`);
console.log(`Tax Calculator Version: ${TaxCalculator.VERSION}`);
console.log('\nPayroll Results:', payrollResults);