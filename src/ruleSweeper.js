const fs = require('fs-extra');
const path = require('path');

class RuleSweeper {
  constructor() {
    this.rulesDir = path.join(process.cwd(), 'rules');
    this.logsDir = path.join(process.cwd(), 'logs', 'sweeps');
  }

  async loadRules() {
    const rules = {};
    const files = await fs.readdir(this.rulesDir);
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = await fs.readFile(path.join(this.rulesDir, file), 'utf8');
        const ruleset = JSON.parse(content);
        rules[file.replace('.json', '')] = ruleset;
      }
    }
    
    return rules;
  }

  async logError(error) {
    const timestamp = new Date().toISOString();
    const logDate = timestamp.split('T')[0];
    const logFile = path.join(this.logsDir, `sweep-${logDate}.log`);
    
    const logEntry = {
      timestamp,
      ...error,
    };

    await fs.ensureDir(this.logsDir);
    await fs.appendFile(logFile, JSON.stringify(logEntry) + '\n');
  }

  validatePayrollRule(employee, rule) {
    const errors = [];

    // Check salary limits
    if (rule.minSalary && employee.salary < rule.minSalary) {
      errors.push({
        employeeId: employee.id,
        tenantId: employee.tenant_id,
        rule: 'minSalary',
        actual: employee.salary,
        expected: rule.minSalary,
        message: 'Salary below minimum requirement'
      });
    }

    // Check tax calculations
    const expectedTax = employee.salary * rule.taxRate;
    if (Math.abs(employee.tax - expectedTax) > 0.01) {
      errors.push({
        employeeId: employee.id,
        tenantId: employee.tenant_id,
        rule: 'taxCalculation',
        actual: employee.tax,
        expected: expectedTax,
        message: 'Tax calculation mismatch'
      });
    }

    // Check deduction limits
    const maxDeductionRate = rule.maxDeductionRate || 0.3;
    const deductionRate = employee.deductions / employee.salary;
    if (deductionRate > maxDeductionRate) {
      errors.push({
        employeeId: employee.id,
        tenantId: employee.tenant_id,
        rule: 'maxDeduction',
        actual: deductionRate,
        expected: maxDeductionRate,
        message: 'Deductions exceed maximum allowed rate'
      });
    }

    return errors;
  }

  async sweepRules(payrollData) {
    const rules = await this.loadRules();
    const errors = [];

    for (const employee of payrollData) {
      // Apply IRS rules
      if (rules.irs) {
        const irsErrors = this.validatePayrollRule(employee, rules.irs);
        errors.push(...irsErrors);
      }

      // Apply state-specific rules
      const stateRules = rules[employee.state?.toLowerCase()];
      if (stateRules) {
        const stateErrors = this.validatePayrollRule(employee, stateRules);
        errors.push(...stateErrors);
      }
    }

    // Log all errors found
    for (const error of errors) {
      await this.logError(error);
    }

    return errors;
  }
}

module.exports = { RuleSweeper };