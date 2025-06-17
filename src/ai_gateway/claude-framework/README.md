# Claude Framework

Enhanced Architecture Framework for Claude with Improved Logging and Confidence Gate Integration

## Overview

This framework provides a comprehensive solution for managing Claude Code/Claude Desktop MCP operations with enhanced safety through uncertainty detection, structured logging, and real-time monitoring.

## Key Features

### 1. Confidence Gate Integration
- **Uncertainty Detection**: Automatically detects uncertainty keywords in LLM responses
- **Schema Validation**: Validates responses against expected schemas
- **Safety Halt**: Stops potentially dangerous operations when uncertainty is detected
- **Standardized Response**: Returns structured response objects with status indicators

### 2. Enhanced Logging
- **Structured Format**: JSON-based log entries with consistent schema
- **Multiple Log Types**: Separate logs for errors, uncertainty halts, and general operations
- **Operation Tracking**: Unique operation IDs for tracing related log entries
- **Contextual Information**: Rich metadata for debugging and analysis

### 3. MCP Task Execution
- **Retry Logic**: Configurable retry attempts with exponential backoff
- **File System Operations**: Built-in support for common file operations
- **Error Handling**: Comprehensive error capture and logging
- **Performance Monitoring**: Success rate tracking and statistics

### 4. Real-time Dashboard
- **Log Visualization**: Web-based interface for viewing logs
- **Search and Filter**: Advanced log searching capabilities
- **Statistics Overview**: Real-time metrics and performance indicators
- **Uncertainty Tracking**: Dedicated view for uncertainty halts

### 5. Schema Validation System
- **Flexible Validation**: Support for complex data structures
- **Custom Rules**: Extensible validation with custom functions
- **Common Schemas**: Pre-defined schemas for common operations
- **Error Details**: Detailed validation error reporting

## Installation

\`\`\`bash
cd claude-framework
npm install
\`\`\`

## Quick Start

### Basic Usage

\`\`\`javascript
const ClaudeFramework = require('./index');

// Initialize framework
const framework = new ClaudeFramework({
  enableDashboard: true,
  dashboardPort: 3000
});

// Execute a task
const result = await framework.execute("Create a new file with sample content");

if (result.status === "SUCCESS") {
  console.log("Task completed successfully:", result.data);
} else {
  console.log("Task halted due to uncertainty:", result.reason);
}
\`\`\`

### File Operations

\`\`\`javascript
// Create a file
await framework.createFile('/path/to/file.txt', 'Hello World');

// Read a file
const content = await framework.readFile('/path/to/file.txt');

// Modify a file
await framework.modifyFile('/path/to/file.txt', 'Add a new line at the end');
\`\`\`

### Schema Validation

\`\`\`javascript
const schema = {
  properties: {
    name: { type: 'string', required: true },
    age: { type: 'number', min: 0, max: 150 }
  }
};

const result = await framework.executeWithValidation(
  "Generate user data",
  schema
);
\`\`\`

## Configuration

\`\`\`javascript
const framework = new ClaudeFramework({
  logPath: './logs',           // Log directory
  dashboardPort: 3000,         // Dashboard port
  maxRetries: 3,              // Max retry attempts
  retryDelay: 1000,           // Retry delay (ms)
  enableDashboard: true       // Enable web dashboard
});
\`\`\`

## Dashboard

Start the standalone dashboard:

\`\`\`bash
npm run dashboard
\`\`\`

Or include it in your application:

\`\`\`javascript
const framework = new ClaudeFramework({ enableDashboard: true });
\`\`\`

Visit \`http://localhost:3000\` to view:
- Real-time log streaming
- Uncertainty halt tracking
- Performance statistics
- Advanced search and filtering

## Log Structure

### Standard Log Entry
\`\`\`json
{
  "timestamp": "2025-06-07T15:52:00Z",
  "level": "INFO",
  "message": "Task completed successfully",
  "operation_id": "mcp-1683451920123-abc123",
  "context": {
    "command_attempted": "create_file",
    "source": "Claude_Code"
  }
}
\`\`\`

### Uncertainty Halt Entry
\`\`\`json
{
  "timestamp": "2025-06-07T15:52:00Z",
  "operation_id": "mcp-1683451920123-abc123",
  "status": "UNCERTAINTY_HALT",
  "reason": "Detected uncertainty keyword: 'i'm not sure'",
  "raw_response": "I'm not sure how to continue.",
  "context": {
    "command_attempted": "create_file",
    "error_code": "ERR_KEYWORD_UNCERTAINTY"
  },
  "source": "Claude_Code"
}
\`\`\`

## Error Codes

- \`ERR_KEYWORD_UNCERTAINTY\`: Uncertainty keyword detected
- \`ERR_JSON_PARSE\`: Invalid JSON response
- \`ERR_SCHEMA_VALIDATION\`: Schema validation failed
- \`ERR_EMPTY_RESPONSE\`: Empty or null response
- \`ERR_MAX_RETRIES_EXCEEDED\`: Maximum retry attempts reached

## API Reference

### ClaudeFramework

#### Methods

- \`execute(prompt, options)\`: Execute MCP task
- \`executeWithValidation(prompt, schema, options)\`: Execute with schema validation
- \`createFile(path, content)\`: Create file operation
- \`readFile(path)\`: Read file operation
- \`modifyFile(path, description)\`: Modify file operation
- \`deleteFile(path)\`: Delete file operation
- \`getStats()\`: Get execution statistics
- \`searchLogs(query, logFile)\`: Search log entries
- \`healthCheck()\`: System health status

### ConfidenceGate

#### Methods

- \`evaluateResponse(response, context, schema)\`: Evaluate LLM response
- \`detectUncertainty(response)\`: Check for uncertainty keywords
- \`addUncertaintyKeyword(keyword)\`: Add custom uncertainty keyword
- \`getStats()\`: Get uncertainty statistics

### StructuredLogger

#### Methods

- \`info(message, metadata)\`: Log info message
- \`warn(message, metadata)\`: Log warning message
- \`error(message, metadata)\`: Log error message
- \`uncertaintyHalt(operationId, reason, response, context)\`: Log uncertainty halt
- \`searchLogs(query, logFile)\`: Search log entries

## Integration with Claude Code

To integrate with actual Claude Code operations, implement the \`callLLM\` method in \`MCPExecutor\`:

\`\`\`javascript
async callLLM(prompt, context) {
  // Implement actual Claude Code API call
  // Return the raw response from Claude
}
\`\`\`

## Monitoring and Alerts

The framework supports integration with monitoring systems:

1. **Log-based Monitoring**: Parse structured logs for alerts
2. **Dashboard API**: Query endpoints for metrics
3. **Health Checks**: Use \`healthCheck()\` for system monitoring
4. **Custom Alerting**: Extend logger for external alert systems

## Security Considerations

- **Sensitive Data**: Logs may contain sensitive information - ensure proper access controls
- **Operation Validation**: Always validate operations before execution
- **Emergency Stop**: Use \`emergencyStop()\` for immediate halt of all operations
- **Access Control**: Restrict dashboard access in production environments

## License

MIT License - see LICENSE file for details.