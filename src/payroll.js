const { SecurityManager } = require('@paysurity/security');
const { TaxCalculator } = require('@paysurity/tax');

class PayrollSystem {
  constructor() {
    this.securityManager = new SecurityManager();
    this.taxCalculator = new TaxCalculator();
  }

  calculatePayroll(employeeData, token) {
    if (!this.securityManager.validateToken(token)) {
      throw new Error('Invalid security token');
    }

    return employeeData.map(employee => ({
      id: employee.id,
      name: employee.name,
      grossPay: employee.salary,
      tax: this.taxCalculator.calculateIncomeTax(employee.salary),
      netPay: employee.salary - this.taxCalculator.calculateIncomeTax(employee.salary)
    }));
  }
}

module.exports = { PayrollSystem };