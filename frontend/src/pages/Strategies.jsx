import React, { useState } from 'react';

const Strategies = () => {
  const [strategies, setStrategies] = useState([
    {
      id: 1,
      name: 'Increase Product A Sales',
      description: 'Focus on increasing Product A sales through targeted marketing and client outreach.',
      goalLink: 'Revenue - Product A',
      clientLink: 'Multiple',
      state: 'in-progress',
      createdAt: '2025-03-15'
    },
    {
      id: 2,
      name: 'Client Retention Campaign',
      description: 'Implement a client retention campaign for at-risk clients identified in analysis.',
      goalLink: 'Client Retention',
      clientLink: 'At-risk clients',
      state: 'planned',
      createdAt: '2025-04-01'
    }
  ]);

  const [newStrategy, setNewStrategy] = useState({
    name: '',
    description: '',
    goalLink: '',
    clientLink: '',
    state: 'planned'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStrategy({
      ...newStrategy,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStrategies([
      ...strategies,
      {
        id: strategies.length + 1,
        ...newStrategy,
        createdAt: new Date().toISOString().split('T')[0]
      }
    ]);
    setNewStrategy({
      name: '',
      description: '',
      goalLink: '',
      clientLink: '',
      state: 'planned'
    });
  };

  return (
    <div className="strategies-page">
      <h1>Strategy Definition</h1>
      
      <div className="strategy-form-container">
        <h2>Create New Strategy</h2>
        <form className="strategy-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Strategy Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={newStrategy.name}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={newStrategy.description}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="goalLink">Link to Goal</label>
              <select
                id="goalLink"
                name="goalLink"
                value={newStrategy.goalLink}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a goal</option>
                <option value="Revenue - Product A">Revenue - Product A</option>
                <option value="Client Retention">Client Retention</option>
                <option value="New Clients">New Clients</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="clientLink">Link to Client(s)</label>
              <select
                id="clientLink"
                name="clientLink"
                value={newStrategy.clientLink}
                onChange={handleInputChange}
              >
                <option value="">Select client(s)</option>
                <option value="Multiple">Multiple Clients</option>
                <option value="At-risk clients">At-risk Clients</option>
                <option value="Client A">Client A</option>
                <option value="Client B">Client B</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="state">State</label>
              <select
                id="state"
                name="state"
                value={newStrategy.state}
                onChange={handleInputChange}
                required
              >
                <option value="planned">Planned</option>
                <option value="in-progress">In Progress</option>
                <option value="paused">Paused</option>
                <option value="finished">Finished</option>
              </select>
            </div>
          </div>
          
          <button type="submit" className="button primary">Create Strategy</button>
        </form>
      </div>
      
      <div className="strategies-list">
        <h2>Current Strategies</h2>
        <div className="strategies-grid">
          {strategies.map(strategy => (
            <div key={strategy.id} className={`strategy-card ${strategy.state}`}>
              <div className="strategy-header">
                <h3>{strategy.name}</h3>
                <span className="strategy-state">{strategy.state}</span>
              </div>
              <p className="strategy-description">{strategy.description}</p>
              <div className="strategy-details">
                <p><strong>Goal:</strong> {strategy.goalLink}</p>
                <p><strong>Client(s):</strong> {strategy.clientLink}</p>
                <p><strong>Created:</strong> {strategy.createdAt}</p>
              </div>
              <div className="strategy-actions">
                <button className="button small">Edit</button>
                <button className="button small">View Tasks</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Strategies;
