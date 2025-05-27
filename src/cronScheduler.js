const cron = require('node-cron');
const { PayrollSystem } = require('./payroll');
const { RuleSweeper } = require('./ruleSweeper');

class PayrollScheduler {
  constructor() {
    this.payrollSystem = new PayrollSystem();
    this.ruleSweeper = new RuleSweeper();
  }

  startWeeklySweep() {
    // Run every Sunday at 00:00
    cron.schedule('0 0 * * 0', async () => {
      try {
        console.log('Starting weekly payroll rule sweep...');
        
        // Get all payroll calculations
        const employeeData = [
          // This would typically come from a database
          { id: 1, name: 'Test Employee', salary: 50000, tenant_id: 'default', state: 'CA' }
        ];
        
        const payrollResults = this.payrollSystem.calculatePayroll(employeeData);
        const errors = await this.ruleSweeper.sweepRules(payrollResults);
        
        console.log(`Payroll rule sweep completed. Found ${errors.length} violations.`);
      } catch (error) {
        console.error('Error during payroll rule sweep:', error);
      }
    });
  }
}

module.exports = { PayrollScheduler };