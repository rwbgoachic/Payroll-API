const fs = require('fs-extra');
const path = require('path');

class EfileService {
  constructor() {
    this.supportedStatesPath = path.join(__dirname, 'supportedEfileStates.json');
    this.missingStatesPath = path.join(__dirname, 'missingEfileStates.json');
  }

  async getSupportedStates() {
    return fs.readJson(this.supportedStatesPath);
  }

  async getMissingStates() {
    return fs.readJson(this.missingStatesPath);
  }

  async submitEfile(state, formData) {
    const supported = await this.getSupportedStates();
    if (!supported.states.find(s => s.code === state)) {
      throw new Error(`E-filing not supported for state: ${state}`);
    }

    // Stub implementation - would integrate with actual e-filing service
    return {
      success: true,
      confirmationId: `EFILE-${state}-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = { EfileService };