# CRM_
CRM personalizado
Full System Specification Summary
Commercial Management System – Multi-module, goal-oriented, 3-tier web application with ERP integration and dynamic dashboards.

1. 🎯 Purpose
Import ERP sales/customer data via email attachments (CSV, Excel).

Set monthly goals per product family and variable (e.g., revenue, client count).

Analyze sales vs. goals with variable-specific dashboards and customizable tables.

Create commercial strategies from insights.

Plan and track actions (tasks, recurring activities, client visits).

Measure results (KPIs, alerts, dashboards, reports).

2. 🏗️ System Architecture
1. Frontend (Web App)
Responsive UI (React/Angular/Vue).

Modules: Goals, Analysis, Strategies, Tasks, Control.

Export (PDF, CSV, XLSX) and Share (Email, WhatsApp).

2. Backend (API/Logic)
REST API with JWT auth and role validation (admin, supervisor, sales).

Parses ERP emails → updates sales/customers.

Business logic: KPIs (I1–I4), auto-categorization, condition settings.

3. Database (Relational)
PostgreSQL (users, customers, goals, sales, strategies, tasks, comments).

Optional: spatial data for client locations.

3. 🧩 Modules Overview
3.1 🎯 Goal Management
Define monthly goals by variable and product family.

Assign goals per user/responsible.

Use “Repeat Values” to auto-fill months.

3.2 📊 Sales Analysis
Dashboards change by selected variable:

Revenue: total, % vs goal, bar/line charts, alerts.

Client Count: current vs target, evolution.

New Clients: detected vs goal, % of total.

Non-Retained Clients: breakdown by category, retention trends.

Table view:

Dynamic columns (I1–I4, ABC class, Category, Reason).

Condition Config: thresholds for automatic categorization.

Custom sorting & filters (up to 3).

Editable categories and reasons per client.

3.3 🧠 Strategy Definition
Create actions from analysis insights.

Strategies link to goals and/or clients.

States: planned, in progress, paused, finished.

Saving a strategy auto-generates the first task.

3.4 ✅ Task Planning & Tracking
Kanban or calendar view.

Tasks include priority, dates, location (map/coordinates), recurrence.

Comments & status updates.

Recurring tasks auto-generate next instance.

3.5 📈 Control & Results
Global KPIs (goal completion %, retention, new clients, total sales).

Track per-goal progress and compare targets vs actuals.

Evaluate strategy impact (ROI, task completion).

Alerts:

Underperforming goals

Overdue tasks

Strategies without tasks

4. 🔄 Full Workflow
ERP Data Intake → Email monitored by backend → Updates DB.

Goal Creation → Variables + families + monthly targets.

Sales Analysis → View dashboards → Configure KPIs → Categorize clients.

Strategy Creation → Based on analysis → Linked to goals/clients.

Task Planning → Auto/manual creation → Manage with Kanban/calendar.

Control & Monitoring → Review dashboards → Adjust goals or strategies → Generate reports.

5. 🧬 Data Structure (Key Tables)
(Simplified list – for complete structure use ERD)

users: roles, login, metadata

clients: business data, optional location

goals: by variable/family/period + status

monthly_targets: per goal/responsible/month

sales: amount, items, date, client

strategies: goal/client link, description, status

tasks: assigned work, recurrence, state, coordinates

comments: on tasks, clients, or strategies

non_buyers: optional – track lost clients

6. ⚙️ Special Features & Rules
📨 ERP Parsing: Backend watches mailbox for sales/client uploads.

🧑‍💼 Permissions:

Admin/Supervisors: full control.

Sales: limited to own clients/tasks/comments.

📈 Indices (I1–I4):

Any variable (e.g., month-over-month, avg 3-months, YoY, etc.).

🔢 Dynamic Columns:

User picks which columns to view in analysis.

🧠 Categories per Variable:

Ex: “Non-Retained” → No Retained / With Issues / Retained.

Editable inline in table (add/delete/update).

🧹 Advanced Filters: 3 combinable filters, 2-level sorting.

🔁 Task Recurrence:

System auto-creates next instance based on config.

7. ✅ Conclusion
This system offers:

End-to-end workflow: From ERP → Goals → Analysis → Action → Results.

Full data visibility per variable.

Modular, scalable architecture.

Dynamic dashboards/tables by variable.

Flexible business rule configuration.

🎯 Outcome: A powerful, intelligent tool for improving sales effectiveness, customer retention, and strategy execution.
