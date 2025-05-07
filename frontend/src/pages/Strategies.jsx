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
      const mockStrategies = [
        {
          id: 1,
          name: 'Estrategia de retención de clientes A',
          description: 'Implementar programa de fidelización para clientes de categoría A',
          goalId: 1,
          clients: [{ id: 1, name: 'Cliente A' }, { id: 2, name: 'Cliente B' }],
          state: 'in-progress',
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          name: 'Estrategia de adquisición de nuevos clientes',
          description: 'Campaña de marketing digital para atraer nuevos clientes',
          goalId: 2,
          clients: [{ id: 3, name: 'Cliente C' }],
          state: 'planned',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      const mockGoals = [
        { id: 1, variable: 'Ingresos', productFamily: 'Producto X' },
        { id: 2, variable: 'Cantidad de Clientes', productFamily: 'Producto Y' },
        { id: 3, variable: 'Clientes Nuevos', productFamily: 'Producto Z' }
      ];
      
      const mockClients = [
        { id: 1, name: 'Cliente A' },
        { id: 2, name: 'Cliente B' },
        { id: 3, name: 'Cliente C' },
        { id: 4, name: 'Cliente D' },
        { id: 5, name: 'Cliente E' }
      ];
      
      try {
        const [strategiesData, goalsData, clientsData] = await Promise.all([
          strategyService.getStrategies(),
          goalService.getGoals(),
          clientService.getClients()
        ]);
        
        setStrategies(strategiesData.length > 0 ? strategiesData : mockStrategies);
        setGoals(goalsData.length > 0 ? goalsData : mockGoals);
        setClients(clientsData.length > 0 ? clientsData : mockClients);
      } catch (err) {
        console.log('Using mock data due to API error:', err);
        setStrategies(mockStrategies);
        setGoals(mockGoals);
        setClients(mockClients);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Error al cargar datos de estrategias. Por favor, inténtelo de nuevo más tarde.');
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
        <h1>Definición de Estrategias</h1>
        <div className="strategies-actions">
          <button className="button primary" onClick={openModal}>Crear Nueva Estrategia</button>
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading">Cargando estrategias...</div>
      ) : (
        <div className="strategies-list">
          <h2>Estrategias Actuales</h2>
          {strategies.length === 0 ? (
            <p>No se encontraron estrategias. Cree su primera estrategia para comenzar.</p>
          ) : (
            <div className="strategies-grid">
              {strategies.map(strategy => (
                <div key={strategy.id} className={`strategy-card ${strategy.state}`}>
                  <div className="strategy-header">
                    <h3>{strategy.name}</h3>
                    <span className={`strategy-state ${strategy.state}`}>
                      {strategy.state === 'planned' ? 'Planificada' : 
                       strategy.state === 'in-progress' ? 'En Progreso' : 
                       strategy.state === 'paused' ? 'Pausada' : 
                       strategy.state === 'finished' ? 'Finalizada' : 
                       strategy.state.charAt(0).toUpperCase() + strategy.state.slice(1).replace('-', ' ')}
                    </span>
                  </div>
                  <p className="strategy-description">{strategy.description}</p>
                  <div className="strategy-details">
                    <p><strong>Objetivo:</strong> {getGoalName(strategy.goalId)}</p>
                    <p><strong>Cliente(s):</strong> {getClientNames(strategy.clients?.map(c => c.id))}</p>
                    <p><strong>Creada:</strong> {new Date(strategy.createdAt).toLocaleDateString('es-AR')}</p>
                  </div>
                  <div className="strategy-actions">
                    <button className="button small" onClick={() => handleEdit(strategy)}>Editar</button>
                    <button className="button small" onClick={() => handleViewTasks(strategy.id)}>Ver Tareas</button>
                    <button className="button small danger" onClick={() => handleDelete(strategy.id)}>Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Modal de Estrategia */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{currentStrategy ? 'Editar Estrategia' : 'Crear Nueva Estrategia'}</h2>
              <button className="close-button" onClick={closeModal}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Nombre de Estrategia</label>
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
                    <option value="">Seleccione un objetivo</option>
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
                  <small>Mantenga presionado Ctrl/Cmd para seleccionar múltiples clientes</small>
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
                <button type="button" className="button secondary" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="button primary">
                  {currentStrategy ? 'Actualizar Estrategia' : 'Crear Estrategia'}
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
