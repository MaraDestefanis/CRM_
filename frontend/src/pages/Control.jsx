import React, { useState } from 'react';

const Control = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const handlePeriodChange = (e) => {
    setSelectedPeriod(e.target.value);
  };

  return (
    <div className="control-page">
      <h1>Control &amp; Results</h1>
      
      <div className="period-selector">
        <label htmlFor="period">Time Period:</label>
        <select 
          id="period" 
          value={selectedPeriod} 
          onChange={handlePeriodChange}
        >
          <option value="month">Current Month</option>
          <option value="quarter">Current Quarter</option>
          <option value="year">Current Year</option>
          <option value="custom">Custom Range</option>
        </select>
      </div>
      
      <div className="global-kpis">
        <h2>Global KPIs</h2>
        <div className="kpi-cards">
          <div className="kpi-card">
            <h3>Goal Completion</h3>
            <p className="kpi-value">78%</p>
            <p className="kpi-trend positive">+5% from last period</p>
          </div>
          <div className="kpi-card">
            <h3>Client Retention</h3>
            <p className="kpi-value">92%</p>
            <p className="kpi-trend positive">+2% from last period</p>
          </div>
          <div className="kpi-card">
            <h3>New Clients</h3>
            <p className="kpi-value">12</p>
            <p className="kpi-trend positive">+3 from last period</p>
          </div>
          <div className="kpi-card">
            <h3>Total Sales</h3>
            <p className="kpi-value">$45,000</p>
            <p className="kpi-trend positive">+15% from last period</p>
          </div>
        </div>
      </div>
      
      <div className="goal-progress">
        <h2>Goal Progress</h2>
        <table className="goal-progress-table">
          <thead>
            <tr>
              <th>Goal</th>
              <th>Variable</th>
              <th>Target</th>
              <th>Current</th>
              <th>Progress</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Revenue - Product A</td>
              <td>Revenue</td>
              <td>$25,000</td>
              <td>$21,500</td>
              <td>
                <div className="progress-bar">
                  <div className="progress" style={{ width: '86%' }}></div>
                </div>
                <span>86%</span>
              </td>
              <td><span className="status on-track">On Track</span></td>
            </tr>
            <tr>
              <td>Client Retention</td>
              <td>Retention Rate</td>
              <td>95%</td>
              <td>92%</td>
              <td>
                <div className="progress-bar">
                  <div className="progress" style={{ width: '97%' }}></div>
                </div>
                <span>97%</span>
              </td>
              <td><span className="status on-track">On Track</span></td>
            </tr>
            <tr>
              <td>New Clients - Product B</td>
              <td>New Clients</td>
              <td>20</td>
              <td>12</td>
              <td>
                <div className="progress-bar">
                  <div className="progress warning" style={{ width: '60%' }}></div>
                </div>
                <span>60%</span>
              </td>
              <td><span className="status at-risk">At Risk</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="strategy-impact">
        <h2>Strategy Impact</h2>
        <table className="strategy-impact-table">
          <thead>
            <tr>
              <th>Strategy</th>
              <th>Linked Goal</th>
              <th>Task Completion</th>
              <th>Impact (ROI)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Increase Product A Sales</td>
              <td>Revenue - Product A</td>
              <td>75%</td>
              <td>+12%</td>
              <td><span className="status positive">Positive</span></td>
            </tr>
            <tr>
              <td>Client Retention Campaign</td>
              <td>Client Retention</td>
              <td>60%</td>
              <td>+5%</td>
              <td><span className="status positive">Positive</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="alerts-section">
        <h2>Alerts</h2>
        <div className="alerts-list">
          <div className="alert warning">
            <h3>Underperforming Goal</h3>
            <p>New Clients - Product B is at 60% of target with 15 days remaining.</p>
            <button className="button small">View Details</button>
          </div>
          <div className="alert danger">
            <h3>Overdue Tasks</h3>
            <p>3 tasks are overdue for the Client Retention Campaign.</p>
            <button className="button small">View Tasks</button>
          </div>
          <div className="alert info">
            <h3>Strategy Without Tasks</h3>
            <p>New Market Expansion strategy has no associated tasks.</p>
            <button className="button small">Add Tasks</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Control;
