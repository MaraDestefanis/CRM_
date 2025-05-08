import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import strategyService from '../services/strategyService';
import goalService from '../services/goalService';
import clientService from '../services/clientService';
import '../styles/Strategies.css';

const Strategies = () => {
  const navigate = useNavigate();
  const [strategies, setStrategies] = useState([]);
  const [goals, setGoals] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentStrategy, setCurrentStrategy] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    goalId: '',
    clientIds: [],
    state: 'planned'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [strategiesData, goalsData, clientsData] = await Promise.all([
        strategyService.getStrategies(),
        goalService.getGoals(),
        clientService.getClients()
      ]);
      
      setStrategies(strategiesData);
      setGoals(goalsData);
      setClients(clientsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load strategies data. Please try again later.');
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

  const handleClientSelection = (e) => {
    const options = e.target.options;
    const selectedValues = [];
    
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedValues.push(options[i].value);
      }
    }
    
    setFormData({
      ...formData,
      clientIds: selectedValues
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (currentStrategy) {
        await strategyService.updateStrategy(currentStrategy.id, formData);
      } else {
        await strategyService.createStrategy(formData);
      }
      
      fetchData();
      resetForm();
      setShowModal(false);
    } catch (err) {
      console.error('Error saving strategy:', err);
      setError('Failed to save strategy. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      goalId: '',
      clientIds: [],
      state: 'planned'
    });
    setCurrentStrategy(null);
  };

  const handleEdit = (strategy) => {
    setCurrentStrategy(strategy);
    setFormData({
      name: strategy.name,
      description: strategy.description,
      goalId: strategy.goalId,
      clientIds: strategy.clients.map(client => client.id.toString()),
      state: strategy.state
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this strategy? This will also delete all associated tasks.')) {
      try {
        await strategyService.deleteStrategy(id, true);
        fetchData();
      } catch (err) {
        console.error('Error deleting strategy:', err);
        setError('Failed to delete strategy. Please try again.');
      }
    }
  };

  const handleViewTasks = (strategyId) => {
    navigate(`/tasks?strategyId=${strategyId}`);
  };

  const getGoalName = (goalId) => {
    const goal = goals.find(g => g.id === goalId);
    return goal ? `${goal.variable} - ${goal.productFamily}` : 'Unknown Goal';
  };

  const getClientNames = (clientIds) => {
    if (!clientIds || clientIds.length === 0) return 'No clients linked';
    
    if (clientIds.length === 1) {
      const client = clients.find(c => c.id === clientIds[0]);
      return client ? client.name : 'Unknown Client';
    }
    
    return `${clientIds.length} clients linked`;
  };

  const openModal = () => {
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    resetForm();
    setShowModal(false);
  };

  return (
    <div className="strategies-page">
      <div className="page-header">
        <h1 className="page-title">Definición de Estrategias</h1>
        <div className="strategies-actions">
          <button className="button primary" onClick={openModal}>
            <i className="fas fa-plus-circle"></i> Crear Nueva Estrategia
          </button>
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading">Cargando estrategias...</div>
      ) : (
        <div className="strategies-list">
          <h2>Estrategias Actuales</h2>
          {strategies.length === 0 ? (
            <p>No se encontraron estrategias. Crea tu primera estrategia para comenzar.</p>
          ) : (
            <div className="strategies-grid">
              {strategies.map(strategy => (
                <div key={strategy.id} className={`strategy-card ${strategy.state}`}>
                  <div className="strategy-header">
                    <h3>{strategy.name}</h3>
                    <span className={`strategy-state ${strategy.state}`}>
                      {strategy.state.charAt(0).toUpperCase() + strategy.state.slice(1).replace('-', ' ')}
                    </span>
                  </div>
                  <p className="strategy-description">{strategy.description}</p>
                  <div className="strategy-details">
                    <p><strong>Goal:</strong> {getGoalName(strategy.goalId)}</p>
                    <p><strong>Client(s):</strong> {getClientNames(strategy.clients?.map(c => c.id))}</p>
                    <p><strong>Created:</strong> {new Date(strategy.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="strategy-actions">
                    <button className="button small" onClick={() => handleEdit(strategy)}>
                      <i className="fas fa-edit"></i> Editar
                    </button>
                    <button className="button small" onClick={() => handleViewTasks(strategy.id)}>
                      <i className="fas fa-tasks"></i> Ver Tareas
                    </button>
                    <button className="button small danger" onClick={() => handleDelete(strategy.id)}>
                      <i className="fas fa-trash"></i> Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Strategy Modal */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{currentStrategy ? 'Editar Estrategia' : 'Crear Nueva Estrategia'}</h2>
              <button className="close-button" onClick={closeModal}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Nombre de la Estrategia</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Descripción</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="goalId">Vincular a Objetivo</label>
                  <select
                    id="goalId"
                    name="goalId"
                    value={formData.goalId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a goal</option>
                    {goals.map(goal => (
                      <option key={goal.id} value={goal.id}>
                        {goal.variable} - {goal.productFamily}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="clientIds">Vincular a Cliente(s)</label>
                  <select
                    id="clientIds"
                    name="clientIds"
                    multiple
                    value={formData.clientIds}
                    onChange={handleClientSelection}
                    size="4"
                  >
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                  <small>Hold Ctrl/Cmd to select multiple clients</small>
                </div>
                
                <div className="form-group">
                  <label htmlFor="state">Estado</label>
                  <select
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="planned">Planificada</option>
                    <option value="in-progress">En Progreso</option>
                    <option value="paused">Pausada</option>
                    <option value="finished">Finalizada</option>
                  </select>
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" className="button secondary" onClick={closeModal}>
                  <i className="fas fa-times"></i> Cancelar
                </button>
                <button type="submit" className="button primary">
                  <i className="fas fa-save"></i> {currentStrategy ? 'Actualizar Estrategia' : 'Crear Estrategia'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Strategies;
