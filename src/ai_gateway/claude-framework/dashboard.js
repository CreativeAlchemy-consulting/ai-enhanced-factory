const express = require('express');
const path = require('path');
const StructuredLogger = require('./logger');
const ConfidenceGate = require('./confidence-gate');
const MCPExecutor = require('./mcp-executor');

class LogDashboard {
  constructor(port = 3000, logPath = './logs') {
    this.port = port;
    this.app = express();
    this.logger = new StructuredLogger(logPath);
    this.confidenceGate = new ConfidenceGate(this.logger);
    this.mcpExecutor = new MCPExecutor({ logger: this.logger, confidenceGate: this.confidenceGate });
    
    this.setupRoutes();
  }

  setupRoutes() {
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, 'public')));

    // API Routes
    this.app.get('/api/logs', (req, res) => this.getLogs(req, res));
    this.app.get('/api/uncertainty-halts', (req, res) => this.getUncertaintyHalts(req, res));
    this.app.get('/api/stats', (req, res) => this.getStats(req, res));
    this.app.post('/api/search', (req, res) => this.searchLogs(req, res));
    this.app.get('/api/operation/:id', (req, res) => this.getOperation(req, res));
    
    // Main dashboard page
    this.app.get('/', (req, res) => {
      res.send(this.generateDashboardHTML());
    });
  }

  getLogs(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 100;
      const logType = req.query.type || 'application.log';
      const logs = this.logger.searchLogs('', logType).slice(-limit);
      
      res.json({
        success: true,
        data: logs,
        total: logs.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  getUncertaintyHalts(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const halts = this.logger.getUncertaintyHalts(limit);
      
      res.json({
        success: true,
        data: halts,
        total: halts.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  getStats(req, res) {
    try {
      const stats = this.mcpExecutor.getExecutionStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  searchLogs(req, res) {
    try {
      const { query, logType, startDate, endDate } = req.body;
      let logs = this.logger.searchLogs(query, logType || 'application.log');
      
      // Filter by date range if provided
      if (startDate || endDate) {
        logs = logs.filter(log => {
          const logDate = new Date(log.timestamp);
          if (startDate && logDate < new Date(startDate)) return false;
          if (endDate && logDate > new Date(endDate)) return false;
          return true;
        });
      }
      
      res.json({
        success: true,
        data: logs,
        total: logs.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  getOperation(req, res) {
    try {
      const operationId = req.params.id;
      const allLogs = this.logger.searchLogs('', 'application.log');
      const operationLogs = allLogs.filter(log => log.operation_id === operationId);
      
      res.json({
        success: true,
        data: operationLogs,
        total: operationLogs.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  generateDashboardHTML() {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Claude Framework Dashboard</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .header {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .stat-value {
            font-size: 2em;
            font-weight: bold;
            color: #333;
        }
        .stat-label {
            color: #666;
            margin-top: 5px;
        }
        .search-section {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .search-form {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
        }
        .search-input {
            flex: 1;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        .search-button {
            padding: 10px 20px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        .logs-section {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .log-entry {
            border-bottom: 1px solid #eee;
            padding: 10px 0;
        }
        .log-entry:last-child {
            border-bottom: none;
        }
        .log-timestamp {
            color: #666;
            font-size: 0.9em;
        }
        .log-level {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.8em;
            font-weight: bold;
        }
        .log-level.ERROR {
            background: #ff4757;
            color: white;
        }
        .log-level.WARN {
            background: #ffa726;
            color: white;
        }
        .log-level.INFO {
            background: #26a69a;
            color: white;
        }
        .uncertainty-halt {
            background: #ffebee;
            border-left: 4px solid #ff4757;
            padding: 10px;
            margin: 5px 0;
        }
        .refresh-button {
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 15px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            font-size: 18px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Claude Framework Dashboard</h1>
            <p>Monitor MCP operations, uncertainty halts, and system logs</p>
        </div>

        <div id="stats-section" class="stats-grid">
            <!-- Stats will be loaded here -->
        </div>

        <div class="search-section">
            <h3>Search Logs</h3>
            <div class="search-form">
                <input type="text" id="search-query" class="search-input" placeholder="Search logs...">
                <select id="log-type" class="search-input">
                    <option value="application.log">All Logs</option>
                    <option value="uncertainty-halts.log">Uncertainty Halts</option>
                    <option value="errors.log">Errors Only</option>
                </select>
                <button onclick="searchLogs()" class="search-button">Search</button>
            </div>
        </div>

        <div class="logs-section">
            <h3>Recent Logs</h3>
            <div id="logs-container">
                <!-- Logs will be loaded here -->
            </div>
        </div>
    </div>

    <button onclick="refreshData()" class="refresh-button">⟳</button>

    <script>
        async function loadStats() {
            try {
                const response = await fetch('/api/stats');
                const result = await response.json();
                
                if (result.success) {
                    const stats = result.data;
                    document.getElementById('stats-section').innerHTML = \`
                        <div class="stat-card">
                            <div class="stat-value">\${stats.total_uncertainty_halts}</div>
                            <div class="stat-label">Total Uncertainty Halts</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">\${stats.success_rate}</div>
                            <div class="stat-label">Success Rate</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">\${stats.recent_success_count}</div>
                            <div class="stat-label">Recent Successes</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">\${stats.recent_failure_count}</div>
                            <div class="stat-label">Recent Failures</div>
                        </div>
                    \`;
                }
            } catch (error) {
                console.error('Failed to load stats:', error);
            }
        }

        async function loadLogs() {
            try {
                const response = await fetch('/api/logs?limit=50');
                const result = await response.json();
                
                if (result.success) {
                    displayLogs(result.data);
                }
            } catch (error) {
                console.error('Failed to load logs:', error);
            }
        }

        async function searchLogs() {
            const query = document.getElementById('search-query').value;
            const logType = document.getElementById('log-type').value;
            
            try {
                const response = await fetch('/api/search', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query, logType })
                });
                const result = await response.json();
                
                if (result.success) {
                    displayLogs(result.data);
                }
            } catch (error) {
                console.error('Failed to search logs:', error);
            }
        }

        function displayLogs(logs) {
            const container = document.getElementById('logs-container');
            container.innerHTML = logs.reverse().map(log => \`
                <div class="log-entry \${log.status === 'UNCERTAINTY_HALT' ? 'uncertainty-halt' : ''}">
                    <div class="log-timestamp">\${new Date(log.timestamp).toLocaleString()}</div>
                    <span class="log-level \${log.level}">\${log.level}</span>
                    <div>\${log.message || log.reason || 'No message'}</div>
                    \${log.operation_id ? \`<small>Operation ID: \${log.operation_id}</small>\` : ''}
                    \${log.context ? \`<details><summary>Context</summary><pre>\${JSON.stringify(log.context, null, 2)}</pre></details>\` : ''}
                </div>
            \`).join('');
        }

        function refreshData() {
            loadStats();
            loadLogs();
        }

        // Load initial data
        refreshData();
        
        // Auto-refresh every 30 seconds
        setInterval(refreshData, 30000);
    </script>
</body>
</html>
    `;
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`Claude Framework Dashboard running on http://localhost:${this.port}`);
    });
  }
}

module.exports = LogDashboard;