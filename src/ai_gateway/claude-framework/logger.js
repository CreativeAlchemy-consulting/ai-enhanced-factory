const fs = require('fs');
const path = require('path');

class StructuredLogger {
  constructor(logPath = './logs', enableConsole = true) {
    this.logPath = logPath;
    this.enableConsole = enableConsole;
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logPath)) {
      fs.mkdirSync(this.logPath, { recursive: true });
    }
  }

  formatLogEntry(level, message, metadata = {}) {
    return {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
      ...metadata
    };
  }

  writeLog(entry, filename = 'application.log') {
    const logLine = JSON.stringify(entry) + '\n';
    const logFile = path.join(this.logPath, filename);
    
    fs.appendFileSync(logFile, logLine);
    
    if (this.enableConsole) {
      console.log(logLine.trim());
    }
  }

  info(message, metadata = {}) {
    const entry = this.formatLogEntry('info', message, metadata);
    this.writeLog(entry);
  }

  warn(message, metadata = {}) {
    const entry = this.formatLogEntry('warn', message, metadata);
    this.writeLog(entry);
  }

  error(message, metadata = {}) {
    const entry = this.formatLogEntry('error', message, metadata);
    this.writeLog(entry, 'errors.log');
    this.writeLog(entry); // Also write to main log
  }

  uncertaintyHalt(operationId, reason, rawResponse, context = {}, source = 'Unknown') {
    const entry = {
      timestamp: new Date().toISOString(),
      operation_id: operationId,
      status: "UNCERTAINTY_HALT",
      reason,
      raw_response: rawResponse,
      context,
      source,
      level: "ERROR"
    };
    
    this.writeLog(entry, 'uncertainty-halts.log');
    this.writeLog(entry); // Also write to main log
    
    return entry;
  }

  success(operationId, context = {}, source = 'Unknown') {
    const entry = {
      timestamp: new Date().toISOString(),
      operation_id: operationId,
      status: "SUCCESS",
      context,
      source,
      level: "INFO"
    };
    
    this.writeLog(entry);
    return entry;
  }

  searchLogs(query, logFile = 'application.log') {
    const logPath = path.join(this.logPath, logFile);
    
    if (!fs.existsSync(logPath)) {
      return [];
    }
    
    const logs = fs.readFileSync(logPath, 'utf8')
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(entry => entry !== null);
    
    if (!query) return logs;
    
    return logs.filter(entry => 
      JSON.stringify(entry).toLowerCase().includes(query.toLowerCase())
    );
  }

  getUncertaintyHalts(limit = 50) {
    return this.searchLogs('', 'uncertainty-halts.log').slice(-limit);
  }
}

module.exports = StructuredLogger;