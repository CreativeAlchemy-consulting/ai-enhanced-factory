# Quick Start Guide

## 🚀 **Getting Started with AI-Enhanced Development & Deployment Factory**

This guide will help you set up and run the AI-Enhanced Development & Deployment Factory in under 15 minutes.

## ✅ **Prerequisites**

Before starting, ensure you have:

- **Node.js 16+** installed
- **Docker** running
- **Ansible** installed
- **Claude Desktop** application
- **Git** for version control

## 📦 **Installation**

### **1. Clone the Repository**
```bash
git clone https://github.com/CreativeAlchemy-consulting/ai-enhanced-factory.git
cd ai-enhanced-factory
```

### **2. Install Dependencies**
```bash
# Install Claude Framework dependencies
cd claude-framework
npm install
cd ..

# Verify Ansible installation
ansible --version
```

### **3. Configure Environment**
```bash
# Copy environment template
cp .env.example .env

# Edit configuration with your API keys
nano .env
```

**Required Environment Variables:**
```bash
# Notion API Configuration
NOTION_API_KEY=your_notion_api_key_here
MASTER_TASKS_DB_ID=your_master_tasks_db_id
PIPELINE_PROJECTS_DB_ID=your_pipeline_projects_db_id
CLIENTS_DB_ID=your_clients_db_id

# Framework Configuration
CLAUDE_FRAMEWORK_PORT=3000
LOG_LEVEL=info
ENABLE_DASHBOARD=true
```

## 🔧 **Configuration**

### **1. MCP Server Setup**

Copy the MCP configuration to Claude Desktop:

**Windows:**
```bash
cp mcp-config/claude_desktop_config.json "%APPDATA%/Claude/claude_desktop_config.json"
```

**macOS:**
```bash
cp mcp-config/claude_desktop_config.json "~/Library/Application Support/Claude/claude_desktop_config.json"
```

**Linux:**
```bash
cp mcp-config/claude_desktop_config.json "~/.config/claude-desktop/claude_desktop_config.json"
```

### **2. Verify MCP Configuration**

The configuration should include:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx.cmd",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "your_paths_here"]
    },
    "notion": {
      "command": "npx.cmd", 
      "args": ["-y", "@notionhq/notion-mcp-server"],
      "env": {
        "NOTION_API_KEY": "your_api_key"
      }
    }
  }
}
```

## 🚀 **Running the System**

### **1. Start Claude Framework**
```bash
cd claude-framework
npm start
```

This will:
- ✅ Initialize structured logging
- ✅ Start confidence gate monitoring
- ✅ Launch real-time dashboard on `http://localhost:3000`

### **2. Verify Infrastructure**
```bash
cd verification
python ndb-verification-framework.py
```

Expected output:
```
✅ NDB-IP1.1: Ansible Infrastructure Structure - PASSED
✅ NDB-IP1.2: Database Schema Definitions - PASSED
✅ NDB-IP1.3: Property Validation Logic - PASSED
✅ NDB-IP1.4: Idempotent Operations - PASSED
✅ NDB-IP1.5: Error Handling Coverage - PASSED
✅ NDB-IP1.6: Workspace Parameterization - PASSED
✅ NDB-IP1.7: Deployment Tracking - PASSED
✅ NDB-IP1.8: Client Portal Integration - PASSED

🎉 ALL VERIFICATION TESTS PASSED!
```

### **3. Deploy Notion Infrastructure**
```bash
cd infrastructure
ansible-playbook playbooks/deploy-notion-infrastructure.yml
```

This will:
- ✅ Validate database schemas
- ✅ Create/update Notion databases
- ✅ Configure relationships and rollups
- ✅ Generate deployment report

## 📊 **Accessing the Dashboard**

Open your browser and navigate to: `http://localhost:3000`

The dashboard provides:
- **Real-time Log Stream**: Live system activity
- **Uncertainty Tracking**: Confidence gate statistics  
- **Performance Metrics**: Success rates and response times
- **Search and Filter**: Advanced log querying

## 🧪 **Testing the System**

### **1. Test MCP Integration**

Open Claude Desktop and try these commands:

```
# Test filesystem access
List the files in my consulting directory

# Test Notion integration  
Show me the current tasks in my Master Tasks database

# Test Docker integration
Check the status of running containers
```

### **2. Test Claude Framework**

```bash
# Test uncertainty detection
curl -X POST http://localhost:3000/api/test \
  -d '{"prompt": "I am not sure how to proceed"}'

# Expected response:
{
  "status": "UNCERTAINTY_HALT",
  "reason": "Detected uncertainty keyword: 'not sure'",
  "operation_id": "mcp-1699123456-abc123"
}
```

### **3. Test Infrastructure Deployment**

```bash
# Test database connection
ansible-playbook playbooks/test-database-connections.yml

# Update a database property
ansible-playbook playbooks/update-database-properties.yml \
  --extra-vars "database_name=master_tasks"
```

## 🔍 **Monitoring and Troubleshooting**

### **Check System Health**
```bash
# View recent logs
tail -f claude-framework/logs/application.log

# Check uncertainty halts
cat claude-framework/logs/uncertainty-halts.log

# View deployment reports
ls infrastructure/deployment_reports/
```

### **Common Issues**

#### **MCP Servers Not Detected**
1. Verify Node.js version (`node --version`)
2. Check Claude Desktop configuration path
3. Restart Claude Desktop application

#### **Notion API Errors**
1. Verify API key is correct
2. Check database IDs are valid
3. Ensure proper permissions on Notion integration

#### **Dashboard Not Loading**
1. Check port 3000 is available
2. Verify npm dependencies installed
3. Check framework logs for errors

## 📈 **Next Steps**

Once your system is running:

1. **Explore the Dashboard**: Familiarize yourself with monitoring capabilities
2. **Run Verification Tests**: Ensure all components pass validation
3. **Test Deployments**: Try updating database schemas
4. **Review Documentation**: Check `/docs` for detailed guides
5. **Join Development**: Follow contributing guidelines for enhancements

## 💡 **Pro Tips**

- **Use Environment Variables**: Never hardcode API keys
- **Monitor Uncertainty Halts**: Review confidence gate triggers regularly
- **Test Before Deploy**: Always run verification framework first
- **Keep Logs Clean**: Regular log rotation prevents disk issues
- **Document Changes**: Update session logs for team awareness

## 🆘 **Getting Help**

- **Documentation**: See `/docs` directory
- **Architecture**: Review system architecture diagram
- **Issues**: Check GitHub Issues for known problems
- **Verification**: Run NDB framework for systematic diagnosis

---

**🎉 Congratulations!** You now have a fully operational AI-Enhanced Development & Deployment Factory.

The system is production-ready and includes comprehensive monitoring, safety mechanisms, and automated infrastructure management.

**Next**: Explore advanced features in the `/examples` directory and review the architecture documentation for deeper understanding.