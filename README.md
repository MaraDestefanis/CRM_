# CRM System

A comprehensive Commercial Management System with multi-module, goal-oriented, 3-tier web application architecture, ERP integration, and dynamic dashboards.

## System Architecture

### 1. Frontend (Web App)
- Responsive UI built with React
- Modules: Goals, Analysis, Strategies, Tasks, Control
- Export capabilities (PDF, CSV, XLSX) and sharing options (Email, WhatsApp)

### 2. Backend (API/Logic)
- REST API with JWT authentication and role validation
- Parses ERP emails to update sales and customer data
- Business logic for KPIs, auto-categorization, and condition settings

### 3. Database (Relational)
- PostgreSQL for storing users, customers, goals, sales, strategies, tasks, and comments
- Optional spatial data for client locations

## Modules

1. **Goal Management**
   - Define monthly goals by variable and product family
   - Assign goals per user/responsible
   - "Repeat Values" feature for auto-filling months

2. **Sales Analysis**
   - Dynamic dashboards based on selected variable
   - Customizable table views with dynamic columns
   - Condition configuration for automatic categorization

3. **Strategy Definition**
   - Create actions from analysis insights
   - Link strategies to goals and/or clients
   - State tracking (planned, in progress, paused, finished)

4. **Task Planning & Tracking**
   - Kanban or calendar view
   - Task details including priority, dates, location, and recurrence
   - Comments and status updates

5. **Control & Results**
   - Global KPIs and goal progress tracking
   - Strategy impact evaluation
   - Alerts for underperforming goals, overdue tasks, etc.

## Getting Started

### Prerequisites
- Node.js and npm
- PostgreSQL database

### Installation
1. Clone the repository
2. Install frontend dependencies:
   ```
   cd frontend
   npm install
   ```
3. Install backend dependencies:
   ```
   cd backend
   npm install
   ```
4. Set up the database:
   ```
   cd database
   # Run database setup scripts
   ```

### Running the Application
1. Start the backend server:
   ```
   cd backend
   npm run dev
   ```
2. Start the frontend development server:
   ```
   cd frontend
   npm start
   ```

## License
This project is proprietary and confidential.
