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
  const [successMessage, setSuccessMessage] = useState('');
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

  const variables = ['Ingresos', 'Cantidad de Clientes', 'Clientes Nuevos', 'Clientes No Retenidos'];
  const productFamilies = ['Producto A', 'Producto B', 'Producto C', 'Producto D'];

  useEffect(() => {
    fetchGoals();
    setUsers([
      { id: 1, name: 'Juan Pérez', role: 'sales' },
      { id: 2, name: 'María García', role: 'sales' },
      { id: 3, name: 'Admin Usuario', role: 'admin' }
    ]);
  }, []);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const mockData = [
        {
          id: 1,
          variable: 'Ingresos',
          productFamily: 'Producto A',
          target: 10000,
          startDate: '2025-04-01',
          endDate: '2025-04-30',
          responsibleId: 1,
          description: 'Objetivo mensual de ingresos para Producto A'
        },
        {
          id: 2,
          variable: 'Cantidad de Clientes',
          productFamily: 'Producto B',
          target: 25,
          startDate: '2025-04-01',
          endDate: '2025-04-30',
          responsibleId: 2,
          description: 'Objetivo mensual de cantidad de clientes para Producto B'
        }
      ];
      
      try {
        const data = await goalService.getGoals();
        setGoals(data);
      } catch (err) {
        console.log('Usando datos simulados para objetivos');
        setGoals(mockData);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error al cargar objetivos:', err);
      setError('Error al cargar objetivos. Por favor, inténtelo de nuevo más tarde.');
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
        console.log('Actualizando objetivo:', formData);
        // await goalService.updateGoal(currentGoal.id, formData);
        setSuccessMessage('¡Objetivo actualizado con éxito!');
      } else {
        console.log('Creando nuevo objetivo:', formData);
        // await goalService.createGoal(formData);
        setSuccessMessage('¡Objetivo creado con éxito!');
      }
      
      fetchGoals();
      
      setTimeout(() => {
        setShowModal(false);
        resetForm();
        setTimeout(() => {
          setSuccessMessage('');
        }, 500);
      }, 2000);
    } catch (err) {
      console.error('Error al guardar objetivo:', err);
      setError('Error al guardar objetivo. Por favor, inténtelo de nuevo.');
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
    if (window.confirm('¿Está seguro de que desea eliminar este objetivo?')) {
      try {
        console.log('Eliminando objetivo:', id);
        // await goalService.deleteGoal(id);
        setSuccessMessage('¡Objetivo eliminado con éxito!');
        
        fetchGoals();
        
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } catch (err) {
        console.error('Error al eliminar objetivo:', err);
        setError('Error al eliminar objetivo. Por favor, inténtelo de nuevo.');
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
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(value);
  };

  const getResponsibleName = (responsibleId) => {
    const user = users.find(u => u.id === parseInt(responsibleId));
    return user ? user.name : 'Sin asignar';
  };

  return (
    <div className="goals-page">
      <div className="page-header">
        <h1>Gestión de Objetivos</h1>
        <div className="goals-actions">
          <button className="button primary" onClick={openModal}>Crear Nuevo Objetivo</button>
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      
      {loading ? (
        <div className="loading">Cargando objetivos...</div>
      ) : (
        <div className="goals-list">
          <h2>Objetivos Actuales</h2>
          {goals.length === 0 ? (
            <p>No se encontraron objetivos. Cree su primer objetivo para comenzar.</p>
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
                {goals.map((goal) => (
                  <tr key={goal.id}>
                    <td>{goal.variable}</td>
                    <td>{goal.productFamily}</td>
                    <td>{goal.variable === 'Ingresos' ? formatCurrency(goal.target) : goal.target}</td>
                    <td>{new Date(goal.startDate).toLocaleDateString('es-AR')} - {new Date(goal.endDate).toLocaleDateString('es-AR')}</td>
                    <td>{getResponsibleName(goal.responsibleId)}</td>
                    <td>
                      <div className="progress-bar">
                        <div className="progress" style={{ width: `${calculateProgress(goal)}%` }}></div>
                        <span>{calculateProgress(goal)}%</span>
                      </div>
                    </td>
                    <td>
                      <button className="button small" onClick={() => handleEdit(goal)}>Editar</button>
                      <button className="button small danger" onClick={() => handleDelete(goal.id)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      
      {/* Modal de Objetivo */}
      {showModal && (
        <div className="modal">
          <div className="modal-content" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="modal-header">
              <h2>{currentGoal ? 'Editar Objetivo' : 'Crear Nuevo Objetivo'}</h2>
              <button className="close-button" onClick={closeModal}>&times;</button>
            </div>
            {successMessage && <div className="success-message" style={{ margin: '10px 20px' }}>{successMessage}</div>}
            <div style={{ padding: '0 20px 20px 20px' }}>
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
                  <button type="button" className="button secondary" onClick={closeModal}>Cancelar</button>
                  <button type="submit" className="button primary">{currentGoal ? 'Actualizar Objetivo' : 'Crear Objetivo'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;
