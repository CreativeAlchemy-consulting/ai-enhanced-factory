const StructuredLogger = require('./logger');
const ConfidenceGate = require('./confidence-gate');
const MCPExecutor = require('./mcp-executor');
const { SchemaValidator, CommonSchemas } = require('./schema-validator');
const LogDashboard = require('./dashboard');

class ClaudeFramework {
  constructor(config = {}) {
    this.config = {
      logPath: config.logPath || './logs',
      dashboardPort: config.dashboardPort || 3000,
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 1000,
      enableDashboard: config.enableDashboard || false,
      ...config
    };

    this.logger = new StructuredLogger(this.config.logPath);
    this.confidenceGate = new ConfidenceGate(this.logger);
    this.mcpExecutor = new MCPExecutor({
      logger: this.logger,
      confidenceGate: this.confidenceGate,
      maxRetries: this.config.maxRetries,
      retryDelay: this.config.retryDelay
    });
    this.schemaValidator = new SchemaValidator();
    
    if (this.config.enableDashboard) {
      this.dashboard = new LogDashboard(this.config.dashboardPort, this.config.logPath);
    }

    this.init();
  }

  init() {
    this.logger.info('Claude Framework initialized', {
      config: this.config,
      timestamp: new Date().toISOString()
    });

    if (this.dashboard) {
      this.dashboard.start();
      this.logger.info(`Dashboard started on port ${this.config.dashboardPort}`);
    }
  }

  // Main execution method for MCP tasks
  async execute(prompt, options = {}) {
    const context = {
      source: 'Claude_Framework',
      ...options.context
    };

    return await this.mcpExecutor.executeMCPTask(prompt, {
      ...options,
      context
    });
  }

  // Execute with schema validation
  async executeWithValidation(prompt, schema, options = {}) {
    return await this.mcpExecutor.executeWithValidation(prompt, schema, options);
  }

  // File system operations
  async createFile(path, content, context = {}) {
    return await this.mcpExecutor.executeFileSystemOperation('create_file', {
      path,
      content,
      context: { ...context, operation: 'create_file' }
    });
  }

  async readFile(path, context = {}) {
    return await this.mcpExecutor.executeFileSystemOperation('read_file', {
      path,
      context: { ...context, operation: 'read_file' }
    });
  }

  async modifyFile(path, modificationDescription, context = {}) {
    return await this.mcpExecutor.executeFileSystemOperation('modify_file', {
      path,
      modification_description: modificationDescription,
      context: { ...context, operation: 'modify_file' }
    });
  }

  async deleteFile(path, context = {}) {
    return await this.mcpExecutor.executeFileSystemOperation('delete_file', {
      path,
      context: { ...context, operation: 'delete_file' }
    });
  }

  async listDirectory(path, context = {}) {
    return await this.mcpExecutor.executeFileSystemOperation('list_directory', {
      path,
      context: { ...context, operation: 'list_directory' }
    });
  }

  // Utility methods
  addUncertaintyKeyword(keyword) {
    this.confidenceGate.addUncertaintyKeyword(keyword);
    this.logger.info(`Added uncertainty keyword: ${keyword}`);
  }

  removeUncertaintyKeyword(keyword) {
    this.confidenceGate.removeUncertaintyKeyword(keyword);
    this.logger.info(`Removed uncertainty keyword: ${keyword}`);
  }

  getStats() {
    return this.mcpExecutor.getExecutionStats();
  }

  getUncertaintyHalts(limit = 50) {
    return this.logger.getUncertaintyHalts(limit);
  }

  searchLogs(query, logFile) {
    return this.logger.searchLogs(query, logFile);
  }

  // Validate data against schema
  validateData(data, schema) {
    return this.schemaValidator.isValid(data, schema);
  }

  // Get common schemas
  getCommonSchemas() {
    return CommonSchemas;
  }

  // Handle uncertainty halt with custom logic
  async handleUncertaintyHalt(haltResponse, retryOptions = {}) {
    return await this.mcpExecutor.handleUncertaintyHalt(haltResponse, retryOptions);
  }

  // Emergency stop - halts all operations
  emergencyStop(reason = 'Manual emergency stop') {
    this.logger.error('EMERGENCY STOP ACTIVATED', {
      reason,
      timestamp: new Date().toISOString(),
      status: 'EMERGENCY_HALT'
    });
    
    // In a real implementation, this would stop all pending operations
    console.error(`🚨 EMERGENCY STOP: ${reason}`);
  }

  // Health check
  async healthCheck() {
    try {
      const stats = this.getStats();
      const recentLogs = this.searchLogs('', 'application.log').slice(-10);
      
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        stats,
        recent_activity: recentLogs.length,
        components: {
          logger: 'operational',
          confidence_gate: 'operational',
          mcp_executor: 'operational',
          dashboard: this.dashboard ? 'operational' : 'disabled'
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }
}

// Export for use as a module
module.exports = ClaudeFramework;

// If run directly, start with example configuration
if (require.main === module) {
  const framework = new ClaudeFramework({
    enableDashboard: true,
    dashboardPort: 3000
  });

  console.log('Claude Framework started');
  console.log('Dashboard available at: http://localhost:3000');
  
  // Example usage
  setTimeout(async () => {
    try {
      // Example: Test uncertainty detection
      const result = await framework.execute("I'm not sure how to proceed with this task", {
        context: { test: true }
      });
      console.log('Test result:', result);
    } catch (error) {
      console.error('Test failed:', error);
    }
  }, 2000);
}