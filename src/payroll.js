class PayrollSystem {
  constructor() {
  }

  validateEmployeeData(employeeData) {
    if (!Array.isArray(employeeData)) {
      throw new Error('Employee data must be an array');
    }

    employeeData.forEach(employee => {
      if (!employee.id || !employee.name || typeof employee.salary !== 'number' || !employee.tenant_id) {
        throw new Error(`Invalid employee data for employee: ${JSON.stringify(employee)}`);
      }
      if (employee.salary < 0) {
        throw new Error(`Invalid salary amount for employee: ${employee.name}`);
      }
      if (employee.salary > 1000000) {
        throw new Error(`Salary amount exceeds maximum limit for employee: ${employee.name}`);
      }
    });
  }

  calculatePayroll(employeeData) {
    this.validateEmployeeData(employeeData);

    const currentDate = new Date();
    const payPeriod = currentDate.toISOString().slice(0, 7); // YYYY-MM format

    return employeeData.map(employee => {
      const tax = this.calculateTax(employee.salary);
      const netPay = employee.salary - tax;
      const deductions = this.calculateDeductions(employee.salary);

      return {
        id: employee.id,
        tenant_id: employee.tenant_id,
        name: employee.name,
        grossPay: employee.salary,
        tax,
        deductions,
        netPay: netPay - deductions,
        payPeriod,
        processedAt: currentDate.toISOString()
      };
    });
  }

  calculateTax(salary) {
    // Simple tax calculation (25% flat rate)
    return salary * 0.25;
  }

  calculateDeductions(salary) {
    // Calculate standard deductions (insurance, retirement, etc.)
    const insuranceRate = 0.02; // 2% for insurance
    const retirementRate = 0.05; // 5% for retirement
    
    return salary * (insuranceRate + retirementRate);
  }

  generatePayrollSummary(payrollResults) {
    const totalGrossPay = payrollResults.reduce((sum, result) => sum + result.grossPay, 0);
    const totalTax = payrollResults.reduce((sum, result) => sum + result.tax, 0);
    const totalDeductions = payrollResults.reduce((sum, result) => sum + result.deductions, 0);
    const totalNetPay = payrollResults.reduce((sum, result) => sum + result.netPay, 0);

    return {
      tenant_id: payrollResults[0]?.tenant_id,
      employeeCount: payrollResults.length,
      payPeriod: payrollResults[0]?.payPeriod || '',
      totalGrossPay,
      totalTax,
      totalDeductions,
      totalNetPay,
      averageGrossPay: totalGrossPay / payrollResults.length,
      averageNetPay: totalNetPay / payrollResults.length,
      processedAt: new Date().toISOString()
    };
  }
}

module.exports = { PayrollSystem };