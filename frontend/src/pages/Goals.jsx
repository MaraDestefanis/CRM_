import React, { useState, useEffect } from 'react';
import goalService from '../services/goalService';
import authService from '../services/authService';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentGoal, setCurrentGoal] = useState(null);
  const [formData, setFormData] = useState({
    variable: '',
    productFamily: '',
    target: '',
    startDate: '',
    endDate: '',
    responsibleId: '',
    description: ''
  });
  const [users, setUsers] = useState([]);
  const [monthlyTargets, setMonthlyTargets] = useState([]);

  const variables = ['Revenue', 'Client Count', 'New Clients', 'Non-Retained Clients'];
  const productFamilies = ['Product A', 'Product B', 'Product C', 'Product D'];

  useEffect(() => {
    fetchGoals();
    setUsers([
      { id: 1, name: 'John Doe', role: 'sales' },
      { id: 2, name: 'Jane Smith', role: 'sales' },
      { id: 3, name: 'Admin User', role: 'admin' }
    ]);
  }, []);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const data = await goalService.getGoals();
      setGoals(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching goals:', err);
      setError('Failed to load goals. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (currentGoal) {
        await goalService.updateGoal(currentGoal.id, formData);
      } else {
        await goalService.createGoal(formData);
      }
      
      fetchGoals();
      
      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error('Error saving goal:', err);
      setError('Failed to save goal. Please try again.');
    }
  };

  const handleEdit = (goal) => {
    setCurrentGoal(goal);
    setFormData({
      variable: goal.variable,
      productFamily: goal.productFamily,
      target: goal.target,
      startDate: goal.startDate,
      endDate: goal.endDate,
      responsibleId: goal.responsibleId,
      description: goal.description
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await goalService.deleteGoal(id);
        fetchGoals();
      } catch (err) {
        console.error('Error deleting goal:', err);
        setError('Failed to delete goal. Please try again.');
      }
    }
  };

  const openModal = () => {
    resetForm();
    setCurrentGoal(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      variable: '',
      productFamily: '',
      target: '',
      startDate: '',
      endDate: '',
      responsibleId: '',
      description: ''
    });
    setCurrentGoal(null);
  };

  const calculateProgress = (goal) => {
    return Math.floor(Math.random() * 100);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const getResponsibleName = (responsibleId) => {
    const user = users.find(u => u.id === responsibleId);
    return user ? user.name : 'Unassigned';
  };

  return (
    <div className="goals-page">
      <div className="page-header">
        <h1>Goal Management</h1>
        <div className="goals-actions">
          <button className="button primary" onClick={openModal}>Create New Goal</button>
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading">Loading goals...</div>
      ) : (
        <div className="goals-list">
          <h2>Current Goals</h2>
          {goals.length === 0 ? (
            <p>No goals found. Create your first goal to get started.</p>
          ) : (
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
                {/* For demo purposes, we'll use static data until the backend is fully connected */}
                <tr>
                  <td>Revenue</td>
                  <td>Product A</td>
                  <td>{formatCurrency(10000)}</td>
                  <td>April 2025</td>
                  <td>John Doe</td>
                  <td>
                    <div className="progress-bar">
                      <div className="progress" style={{ width: '75%' }}></div>
                      <span>75%</span>
                    </div>
                  </td>
                  <td>
                    <button className="button small" onClick={() => handleEdit({
                      id: 1,
                      variable: 'Revenue',
                      productFamily: 'Product A',
                      target: 10000,
                      startDate: '2025-04-01',
                      endDate: '2025-04-30',
                      responsibleId: 1,
                      description: 'Monthly revenue target for Product A'
                    })}>Edit</button>
                    <button className="button small danger" onClick={() => handleDelete(1)}>Delete</button>
                  </td>
                </tr>
                <tr>
                  <td>Client Count</td>
                  <td>Product B</td>
                  <td>25</td>
                  <td>April 2025</td>
                  <td>Jane Smith</td>
                  <td>
                    <div className="progress-bar">
                      <div className="progress" style={{ width: '60%' }}></div>
                      <span>60%</span>
                    </div>
                  </td>
                  <td>
                    <button className="button small" onClick={() => handleEdit({
                      id: 2,
                      variable: 'Client Count',
                      productFamily: 'Product B',
                      target: 25,
                      startDate: '2025-04-01',
                      endDate: '2025-04-30',
                      responsibleId: 2,
                      description: 'Monthly client count target for Product B'
                    })}>Edit</button>
                    <button className="button small danger" onClick={() => handleDelete(2)}>Delete</button>
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      )}
      
      {/* Goal Modal */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{currentGoal ? 'Edit Goal' : 'Create New Goal'}</h2>
              <button className="close-button" onClick={closeModal}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="variable">Variable</label>
                <select
                  id="variable"
                  name="variable"
                  value={formData.variable}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Variable</option>
                  {variables.map((variable, index) => (
                    <option key={index} value={variable}>{variable}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="productFamily">Product Family</label>
                <select
                  id="productFamily"
                  name="productFamily"
                  value={formData.productFamily}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Product Family</option>
                  {productFamilies.map((family, index) => (
                    <option key={index} value={family}>{family}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="target">Target</label>
                <input
                  type="number"
                  id="target"
                  name="target"
                  value={formData.target}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="startDate">Start Date</label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="endDate">End Date</label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="responsibleId">Responsible</label>
                <select
                  id="responsibleId"
                  name="responsibleId"
                  value={formData.responsibleId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Responsible</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                ></textarea>
              </div>
              
              <div className="form-actions">
                <button type="button" className="button secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="button primary">{currentGoal ? 'Update Goal' : 'Create Goal'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;
