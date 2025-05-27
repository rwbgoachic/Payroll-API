const cron = require('node-cron');
const axios = require('axios');
const { parseRules } = require('./parser');
const { logError } = require('./errorLogger');
const fs = require('fs-extra');
const path = require('path');

class RuleSweeper {
  constructor() {
    this.stateUrls = {
      IRS: 'https://www.irs.gov/tax-rates',
      // Add URLs for all 50 states here
      CA: 'https://www.dir.ca.gov/dlse/faq_paydays.htm',
      NY: 'https://www.tax.ny.gov/pit/file/tax_tables.htm',
      // ... other states
    };
  }

  async scrapeRules(url) {
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch rules from ${url}: ${error.message}`);
    }
  }

  async sweepAllRules() {
    const results = {
      successful: [],
      failed: []
    };

    for (const [state, url] of Object.entries(this.stateUrls)) {
      try {
        const html = await this.scrapeRules(url);
        const rules = await parseRules(html, state);
        
        results.successful.push({
          state,
          timestamp: new Date().toISOString(),
          rules
        });
      } catch (error) {
        const errorDetails = {
          state,
          timestamp: new Date().toISOString(),
          error: error.message
        };
        
        results.failed.push(errorDetails);
        await logError('rule_sweep', errorDetails);
        
        // Notify admin system
        await this.notifyAdmin(errorDetails);
      }
    }

    await this.updateRules(results);
  }

  async updateRules(results) {
    const rulesPath = path.join(process.cwd(), 'tax', 'rules.json');
    const historyPath = path.join(process.cwd(), 'tax', 'ruleHistory.log');

    // Update rules.json with successful updates
    if (results.successful.length > 0) {
      const currentRules = await fs.readJson(rulesPath, { throws: false }) || {};
      
      for (const result of results.successful) {
        currentRules[result.state] = {
          ...result.rules,
          lastUpdated: result.timestamp
        };
      }
      
      await fs.writeJson(rulesPath, currentRules, { spaces: 2 });
    }

    // Log all results to history
    const historyEntry = JSON.stringify({
      timestamp: new Date().toISOString(),
      successful: results.successful.map(r => r.state),
      failed: results.failed.map(r => r.state)
    }) + '\n';

    await fs.appendFile(historyPath, historyEntry);
  }

  async notifyAdmin(errorDetails) {
    try {
      await axios.post('http://internal-admin-api/rule-sweep-error', errorDetails);
    } catch (error) {
      await logError('admin_notification', {
        timestamp: new Date().toISOString(),
        error: error.message,
        details: errorDetails
      });
    }
  }

  startWeeklySweep() {
    // Run every Sunday at 00:00
    cron.schedule('0 0 * * 0', async () => {
      console.log('Starting weekly tax rule sweep...');
      await this.sweepAllRules();
    });
  }
}

module.exports = { RuleSweeper };