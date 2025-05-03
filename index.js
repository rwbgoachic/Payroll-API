const { SecurityManager } = require('@paysurity/security');
const { TaxCalculator } = require('@paysurity/tax');

const securityManager = new SecurityManager();
const taxCalculator = new TaxCalculator();

console.log('Payroll System Initialized');
console.log(`Security Module Version: ${SecurityManager.VERSION}`);
console.log(`Tax Calculator Version: ${TaxCalculator.VERSION}`);