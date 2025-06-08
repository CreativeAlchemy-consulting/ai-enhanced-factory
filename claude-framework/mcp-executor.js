const StructuredLogger = require('./logger');
const ConfidenceGate = require('./confidence-gate');

class MCPExecutor {
  constructor(config = {}) {
    this.logger = config.logger || new StructuredLogger();
    this.confidenceGate = config.confidenceGate || new ConfidenceGate(this.logger);
    this.maxRetries = config.maxRetries || 3;
    this.retryDelay = config.retryDelay || 1000;
  }

  async callLLM(prompt, context = {}) {
    // Simulate LLM call - replace with actual implementation
    // This would integrate with Claude Code or Claude Desktop MCP
    throw new Error('callLLM must be implemented with actual LLM integration');
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async executeMCPTask(prompt, context = {}) {
    const operationId = this.confidenceGate.generateOperationId();
    const taskContext = {
      command_attempted: context.command || "MCP Operation",
      prompt: prompt.substring(0, 200) + (prompt.length > 200 ? '...' : ''),
      source: context.source || "Claude_Code",
      ...context
    };

    this.logger.info(`Starting MCP task execution`, {
      operation_id: operationId,
      context: taskContext
    });

    let lastError = null;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        // Call the LLM
        const rawResponse = await this.callLLM(prompt, {
          ...context,
          attempt,
          operation_id: operationId
        });

        // Evaluate response through confidence gate
        const evaluation = await this.confidenceGate.evaluateResponse(
          rawResponse,
          taskContext,
          context.expectedSchema,
          operationId
        );

        if (evaluation.status === "UNCERTAINTY_HALT") {
          this.logger.warn(`MCP task halted due to uncertainty`, {
            operation_id: operationId,
            attempt,
            evaluation
          });
          
          // If this is not the final attempt and uncertainty is detected,
          // we could optionally retry with a modified prompt
          if (attempt < this.maxRetries && context.retryOnUncertainty) {
            await this.sleep(this.retryDelay * attempt);
            continue;
          }
          
          return evaluation;
        }

        // Success
        this.logger.info(`MCP task completed successfully`, {
          operation_id: operationId,
          attempt
        });
        
        return evaluation;

      } catch (error) {
        lastError = error;
        this.logger.error(`MCP task execution failed`, {
          operation_id: operationId,
          attempt,
          error: error.message,
          stack: error.stack
        });

        if (attempt < this.maxRetries) {
          await this.sleep(this.retryDelay * attempt);
          continue;
        }
      }
    }

    // All retries exhausted
    const logEntry = this.logger.uncertaintyHalt(
      operationId,
      `Task failed after ${this.maxRetries} attempts: ${lastError?.message || 'Unknown error'}`,
      lastError?.toString() || 'No response available',
      {
        ...taskContext,
        error_code: 'ERR_MAX_RETRIES_EXCEEDED',
        attempts: this.maxRetries,
        last_error: lastError?.message
      },
      taskContext.source
    );

    return {
      status: "UNCERTAINTY_HALT",
      reason: `Task failed after ${this.maxRetries} attempts`,
      operation_id: operationId,
      error_code: 'ERR_MAX_RETRIES_EXCEEDED'
    };
  }

  async executeFileSystemOperation(operation, params = {}) {
    const context = {
      command: operation,
      source: "Claude_Code_FileSystem",
      expectJson: false,
      ...params.context
    };

    const prompt = this.buildFileSystemPrompt(operation, params);
    return await this.executeMCPTask(prompt, context);
  }

  buildFileSystemPrompt(operation, params) {
    switch (operation) {
      case 'create_file':
        return `Create a file at path "${params.path}" with the following content:\n${params.content}`;
      
      case 'read_file':
        return `Read the contents of the file at path "${params.path}"`;
      
      case 'modify_file':
        return `Modify the file at path "${params.path}". ${params.modification_description}`;
      
      case 'delete_file':
        return `Delete the file at path "${params.path}"`;
      
      case 'list_directory':
        return `List the contents of the directory at path "${params.path}"`;
      
      default:
        return `Execute filesystem operation: ${operation} with parameters: ${JSON.stringify(params)}`;
    }
  }

  async executeWithValidation(prompt, validationSchema, context = {}) {
    return await this.executeMCPTask(prompt, {
      ...context,
      expectedSchema: validationSchema,
      expectJson: true
    });
  }

  getExecutionStats() {
    const stats = this.confidenceGate.getStats();
    const recentLogs = this.logger.searchLogs('', 'application.log').slice(-100);
    
    const successCount = recentLogs.filter(log => 
      log.status === 'SUCCESS' && log.operation_id
    ).length;
    
    const failureCount = recentLogs.filter(log => 
      log.status === 'UNCERTAINTY_HALT' && log.operation_id
    ).length;

    return {
      ...stats,
      recent_success_count: successCount,
      recent_failure_count: failureCount,
      success_rate: successCount + failureCount > 0 ? 
        (successCount / (successCount + failureCount) * 100).toFixed(2) + '%' : 'N/A'
    };
  }

  async handleUncertaintyHalt(haltResponse, options = {}) {
    const { autoRetry = false, modifyPrompt = null } = options;
    
    if (!autoRetry) {
      return haltResponse;
    }

    if (modifyPrompt && typeof modifyPrompt === 'function') {
      // Allow custom prompt modification for retry
      const modifiedPrompt = modifyPrompt(haltResponse.raw_response);
      return await this.executeMCPTask(modifiedPrompt, {
        source: 'Claude_Code_Retry',
        original_operation_id: haltResponse.operation_id
      });
    }

    return haltResponse;
  }
}

module.exports = MCPExecutor;