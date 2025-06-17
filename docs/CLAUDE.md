# Claude Code Instructions & Framework

## Confidence Gateway System

This Claude instance is equipped with a confidence gateway system located at `/mnt/c/Users/fmoli/claude-framework/confidence-gate.js`. This system automatically:

- Detects uncertainty keywords in responses
- Validates JSON responses and schema compliance  
- Implements structured logging for all operations
- Provides operation tracking with unique IDs
- Halts execution when confidence thresholds are not met

### Confidence Gate Integration
The confidence gateway evaluates all responses for:
- Uncertainty indicators ("I'm not sure", "need more information", etc.)
- JSON validation when structured data is expected
- Schema compliance verification
- Error detection and categorization

## Three-Tier QA Testing Protocol

When implementing solutions, follow the Three-Tier QA Protocol from `/mnt/e/Documents Alienware/Consulting/Creative-Alchemy-Consulting/03_Knowledge-Assets/Methodologies/QA-Testing-Protocols/TEMPLATE_Three-Tier_QA_Protocol_v1.md`:

### Tier 1: White-Box Testing
- Internal system logic validation
- Code/process review
- Data flow testing
- Security validation
- Performance benchmarks

### Tier 2: Grey-Box Testing  
- System integration testing
- User acceptance testing preparation
- Performance under load
- Security integration

### Tier 3: Black-Box Testing
- End-user experience validation
- Business process testing
- Acceptance criteria validation
- Stakeholder sign-off

## Task Management SOPs

### SOP for AI Task Creation in the Master Tasks Database

When an AI agent's plan requires creating a new task, it must follow these steps precisely:

#### 1. Create New Page (Task)
- Use the Notion API to create a new page in the "Master Tasks Database"
- Set the Task name property based on the requirements

#### 2. Set Initial Versioning Properties
- **Current Version**: Set to `1.0`
- **Change Reason**: Set to `Initial task creation by [Agent Name]`
- **Change Log**: Set to `v1.0 ([Current Date]): Initial task creation by [Agent Name]`

#### 3. Set Initial Core Properties
- **Status**: Set to `To Do`
- **Visibility**: Set to `Internal Only` (unless otherwise specified)
- **Project / Client**: Link to the relevant project/client relations
- **Parent Task / Blocked by**: Link any known parent or dependency relations

#### 4. Populate Page Body with Standard Boilerplate (CRITICAL STEP)
The agent must use the API to append the following blocks to the body of the newly created Notion page. This ensures that every AI-created task has the same structure for tracking and quality assurance.

##### Boilerplate Content to Add:

📝 **Task Description**

- [The AI should insert a clear, concise description of what needs to be done based on its analysis.]

✅ **Acceptance Criteria**

- Criterion 1: [The AI should define what 'Done' looks like for this task.]
- Criterion 2: ...

⚙️ **QA Testing Steps**

(This section must be filled out before the task can be moved to 'Complete'.)
- White-box Testing: [Describe how to test the internal code/logic. e.g., "Unit tests for my_function must pass."]
- Grey-box Testing: [Describe how to test the integrations/API calls. e.g., "Verify the call to the Notion API correctly updates the page property."]
- Black-box Testing: [Describe how to test the final user-facing outcome. e.g., "Confirm that after running the workflow, the client's record in Notion shows 'Status: Active'."]

📎 **Relevant Files & Links**

- [The AI can link to any relevant source documents, code files, or other Notion pages it used for context.]

🗒️ **Notes**

- [The AI can add any additional notes, context, or assumptions made during task creation.]

#### 5. Populate Known Details
Based on its understanding of the request, the AI should make a best effort to fill in the Task Description and Acceptance Criteria sections of the boilerplate it just created. The QA Testing Steps will often require human input later, but the AI can create the placeholder structure.

#### Implementation Context
- **"New Versioned Task" Template**: For humans. When you click "New," you get pre-filled properties and boilerplate in the page body.
- **This SOP**: For AI agents. Instructs them to programmatically replicate the result of using the manual template, ensuring every task, regardless of origin, has the same structure, properties, and essential sections for QA tracking.

#### Required API Configuration
- **Notion API Key**: Use environment variable `NOTION_API_KEY`
- **Master Tasks DB ID**: `144d74ca5c5e815ca77fffdcff0e01d7`
- **Database Properties**: Ensure all versioning and core properties are properly set during creation

## Operational Guidelines

### File Organization
- Active projects: `/mnt/e/Documents Alienware/Consulting/Creative-Alchemy-Consulting/01_Active-Projects/`
- Knowledge assets: `/mnt/e/Documents Alienware/Consulting/Creative-Alchemy-Consulting/03_Knowledge-Assets/`
- Operations tools: `/mnt/e/Documents Alienware/Consulting/Creative-Alchemy-Consulting/04_Operations/`

### Quality Standards
- All implementations must pass the Three-Tier QA Protocol
- Confidence gateway must validate all responses
- Task creation must follow the standardized SOP
- Documentation must be maintained in the established structure

### Framework Integration
This instruction set integrates with:
- Confidence Gateway system (`/mnt/c/Users/fmoli/claude-framework/`)
- Notion API configuration (environment variables set)
- Three-Tier QA Protocol templates
- Structured logging and operation tracking