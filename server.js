const express = require('express');
const bodyParser = require('body-parser');
const { PayrollSystem } = require('./src/payroll');
const { PayrollScheduler } = require('./src/cronScheduler');
const { EfileService } = require('./filing/efileService');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const port = 3000;
const payrollSystem = new PayrollSystem();
const payrollScheduler = new PayrollScheduler();
const efileService = new EfileService();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Existing payroll calculation endpoint
app.post('/api/payroll/calculate', (req, res) => {
  try {
    const employeeData = [{
      id: 1,
      name: 'Employee',
      salary: req.body.salary,
      tenant_id: 'default',
      state: req.body.state || 'CA'
    }];

    const result = payrollSystem.calculatePayroll(employeeData);
    res.json(result[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// New endpoints for state support information
app.get('/api/payroll/states/supported', async (req, res) => {
  try {
    const data = await fs.readJson(path.join(__dirname, 'state', 'supportedStates.json'));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch supported states' });
  }
});

app.get('/api/payroll/states/missing', async (req, res) => {
  try {
    const data = await fs.readJson(path.join(__dirname, 'state', 'missingStates.json'));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch missing states' });
  }
});

// New endpoints for e-filing support information
app.get('/api/payroll/filing/supported', async (req, res) => {
  try {
    const data = await efileService.getSupportedStates();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch supported e-filing states' });
  }
});

app.get('/api/payroll/filing/missing', async (req, res) => {
  try {
    const data = await efileService.getMissingStates();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch missing e-filing states' });
  }
});

// Start the payroll rule sweep scheduler
payrollScheduler.startWeeklySweep();

app.listen(port, () => {
  console.log(`Payroll API server running on port ${port}`);
});