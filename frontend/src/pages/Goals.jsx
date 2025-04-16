import React from 'react';

const Goals = () => {
  return (
    <div className="goals-page">
      <h1>Goal Management</h1>
      <div className="goals-actions">
        <button className="button primary">Create New Goal</button>
      </div>
      <div className="goals-list">
        <h2>Current Goals</h2>
        <table className="goals-table">
          <thead>
            <tr>
              <th>Variable</th>
              <th>Product Family</th>
              <th>Target</th>
              <th>Period</th>
              <th>Responsible</th>
              <th>Progress</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Revenue</td>
              <td>Product A</td>
              <td>$10,000</td>
              <td>April 2025</td>
              <td>John Doe</td>
              <td>75%</td>
              <td>
                <button className="button small">Edit</button>
                <button className="button small danger">Delete</button>
              </td>
            </tr>
            <tr>
              <td>Client Count</td>
              <td>Product B</td>
              <td>25</td>
              <td>April 2025</td>
              <td>Jane Smith</td>
              <td>60%</td>
              <td>
                <button className="button small">Edit</button>
                <button className="button small danger">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Goals;
