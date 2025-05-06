const { SecurityManager } = require('@paysurity/security');
const { TaxCalculator } = require('@paysurity/tax');
const { PayrollSystem } = require('./src/payroll');

const securityManager = new SecurityManager();
const taxCalculator = new TaxCalculator();
const payrollSystem = new PayrollSystem();

const sampleEmployees = [
  { id: 1, name: 'John Doe', salary: 50000 },
  { id: 2, name: 'Jane Smith', salary: 60000 },
  { id: 3, name: 'Bob Johnson', salary: 45000 },
  { id: 4, name: 'Alice Brown', salary: 70000 }
];

try {
  console.log('Starting Payroll Processing...');
  console.log('================================');
  
  const token = securityManager.generatePayrollToken();
  console.log('Security token generated successfully');
  
  console.log('\nCalculating payroll for', sampleEmployees.length, 'employees...');
  const payrollResults = payrollSystem.calculatePayroll(sampleEmployees, token);
  
  console.log('\nGenerating payroll summary...');
  const payrollSummary = payrollSystem.generatePayrollSummary(payrollResults);

  console.log('\nSystem Information:');
  console.log('--------------------------------');
  console.log(`Security Module Version: ${SecurityManager.VERSION}`);
  console.log(`Tax Calculator Version: ${TaxCalculator.VERSION}`);
  
  console.log('\nPayroll Results:');
  console.log('--------------------------------');
  console.log(JSON.stringify(payrollResults, null, 2));
  
  console.log('\nPayroll Summary:');
  console.log('--------------------------------');
  console.log(JSON.stringify(payrollSummary, null, 2));
} catch (error) {
  console.error('\nError processing payroll:');
  console.error('--------------------------------');
  console.error(error.message);
  process.exit(1);
}