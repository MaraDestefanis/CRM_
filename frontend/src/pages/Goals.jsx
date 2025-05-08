import React, { useState, useEffect } from 'react';
import goalService from '../services/goalService';
import authService from '../services/authService';
import '../styles/Goals.css';

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
        <h1 className="page-title">Gestión de Objetivos</h1>
        <div className="goals-actions">
          <button className="button primary" onClick={openModal}>
            <i className="fas fa-plus-circle"></i> Crear Nuevo Objetivo
          </button>
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading">Cargando objetivos...</div>
      ) : (
        <div className="goals-list">
          <h2>Objetivos Actuales</h2>
          {goals.length === 0 ? (
            <p>No se encontraron objetivos. Crea tu primer objetivo para comenzar.</p>
          ) : (
            <table className="goals-table">
              <thead>
                <tr>
                  <th>Variable</th>
                  <th>Familia de Productos</th>
                  <th>Meta</th>
                  <th>Período</th>
                  <th>Responsable</th>
                  <th>Progreso</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {/* For demo purposes, we'll use static data until the backend is fully connected */}
                <tr>
                  <td>Ingresos</td>
                  <td>Producto A</td>
                  <td>{formatCurrency(10000)}</td>
                  <td>Abril 2025</td>
                  <td>Juan Pérez</td>
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
                      description: 'Meta mensual de ingresos para Producto A'
                    })}>
                      <i className="fas fa-edit"></i> Editar
                    </button>
                    <button className="button small danger" onClick={() => handleDelete(1)}>
                      <i className="fas fa-trash"></i> Eliminar
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>Cantidad de Clientes</td>
                  <td>Producto B</td>
                  <td>25</td>
                  <td>Abril 2025</td>
                  <td>María López</td>
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
                      description: 'Meta mensual de clientes para Producto B'
                    })}>
                      <i className="fas fa-edit"></i> Editar
                    </button>
                    <button className="button small danger" onClick={() => handleDelete(2)}>
                      <i className="fas fa-trash"></i> Eliminar
                    </button>
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
              <h2>{currentGoal ? 'Editar Objetivo' : 'Crear Nuevo Objetivo'}</h2>
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
                  <option value="">Seleccionar Variable</option>
                  {variables.map((variable, index) => (
                    <option key={index} value={variable}>{variable}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="productFamily">Familia de Productos</label>
                <select
                  id="productFamily"
                  name="productFamily"
                  value={formData.productFamily}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Seleccionar Familia de Productos</option>
                  {productFamilies.map((family, index) => (
                    <option key={index} value={family}>{family}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="target">Meta</label>
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
                  <label htmlFor="startDate">Fecha de Inicio</label>
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
                  <label htmlFor="endDate">Fecha de Fin</label>
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
                <label htmlFor="responsibleId">Responsable</label>
                <select
                  id="responsibleId"
                  name="responsibleId"
                  value={formData.responsibleId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Seleccionar Responsable</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Descripción</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                ></textarea>
              </div>
              
              <div className="form-actions">
                <button type="button" className="button secondary" onClick={closeModal}>
                  <i className="fas fa-times"></i> Cancelar
                </button>
                <button type="submit" className="button primary">
                  <i className="fas fa-save"></i> {currentGoal ? 'Actualizar Objetivo' : 'Crear Objetivo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;
