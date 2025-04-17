import React from 'react';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="dashboard-summary">
        <div className="summary-card">
          <h3>Goals</h3>
          <p>5 active goals</p>
        </div>
        <div className="summary-card">
          <h3>Sales</h3>
          <p>$10,000 this month</p>
        </div>
        <div className="summary-card">
          <h3>Clients</h3>
          <p>25 active clients</p>
        </div>
        <div className="summary-card">
          <h3>Tasks</h3>
          <p>12 pending tasks</p>
        </div>
      </div>
      <div className="dashboard-charts">
        <div className="chart">
          <h3>Sales Performance</h3>
          <div className="chart-placeholder">
            {/* Chart will be implemented here */}
            <p>Sales chart placeholder</p>
          </div>
        </div>
        <div className="chart">
          <h3>Goal Progress</h3>
          <div className="chart-placeholder">
            {/* Chart will be implemented here */}
            <p>Goal progress chart placeholder</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
