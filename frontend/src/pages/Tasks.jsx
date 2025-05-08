import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import taskService from '../services/taskService';
import strategyService from '../services/strategyService';
import commentService from '../services/commentService';
import authService from '../services/authService';
import '../styles/Tasks.css';

const Tasks = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('kanban');
  const [tasks, setTasks] = useState([]);
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    status: 'todo',
    assignedTo: '',
    strategyId: '',
    location: { lat: '', lng: '' },
    recurrence: 'none'
  });
  const [users, setUsers] = useState([]);
  const [filteredStrategyId, setFilteredStrategyId] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const strategyId = params.get('strategyId');
    if (strategyId) {
      setFilteredStrategyId(strategyId);
    }
    
    fetchData();
    
    setUsers([
      { id: 1, name: 'John Doe', role: 'sales' },
      { id: 2, name: 'Jane Smith', role: 'sales' },
      { id: 3, name: 'Admin User', role: 'admin' }
    ]);
  }, [location]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tasksData, strategiesData] = await Promise.all([
        taskService.getTasks(),
        strategyService.getStrategies()
      ]);
      
      setTasks(tasksData);
      setStrategies(strategiesData);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load tasks data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (taskId) => {
    try {
      const commentsData = await commentService.getComments('task', taskId);
      setComments(commentsData);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments. Please try again later.');
    }
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'kanban' ? 'calendar' : 'kanban');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'lat' || name === 'lng') {
      setFormData({
        ...formData,
        location: {
          ...formData.location,
          [name]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (currentTask) {
        await taskService.updateTask(currentTask.id, formData);
      } else {
        await taskService.createTask(formData);
      }
      
      fetchData();
      resetForm();
      setShowModal(false);
    } catch (err) {
      console.error('Error saving task:', err);
      setError('Failed to save task. Please try again.');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const taskToUpdate = tasks.find(t => t.id === taskId);
      if (!taskToUpdate) return;
      
      await taskService.updateTask(taskId, { ...taskToUpdate, status: newStatus });
      fetchData();
    } catch (err) {
      console.error('Error updating task status:', err);
      setError('Failed to update task status. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskService.deleteTask(id);
        fetchData();
      } catch (err) {
        console.error('Error deleting task:', err);
        setError('Failed to delete task. Please try again.');
      }
    }
  };

  const handleEdit = (task) => {
    setCurrentTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate,
      status: task.status,
      assignedTo: task.assignedTo,
      strategyId: task.strategyId,
      location: task.location || { lat: '', lng: '' },
      recurrence: task.recurrence
    });
    setShowModal(true);
  };

  const handleViewComments = async (taskId) => {
    await fetchComments(taskId);
    setCurrentTask(tasks.find(t => t.id === taskId));
    setShowCommentModal(true);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!commentText.trim()) return;
    
    try {
      await commentService.createComment({
        content: commentText,
        referenceType: 'task',
        referenceId: currentTask.id
      });
      
      setCommentText('');
      fetchComments(currentTask.id);
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      status: 'todo',
      assignedTo: '',
      strategyId: '',
      location: { lat: '', lng: '' },
      recurrence: 'none'
    });
    setCurrentTask(null);
  };

  const openModal = () => {
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    resetForm();
    setShowModal(false);
  };

  const closeCommentModal = () => {
    setShowCommentModal(false);
    setCurrentTask(null);
    setComments([]);
    setCommentText('');
  };

  const getStrategyName = (strategyId) => {
    const strategy = strategies.find(s => s.id === strategyId);
    return strategy ? strategy.name : 'No Strategy';
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unassigned';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const filteredTasks = filteredStrategyId 
    ? tasks.filter(task => task.strategyId === filteredStrategyId)
    : tasks;

  return (
    <div className="tasks-page">
      <div className="page-header">
        <h1 className="page-title">Planificación y Seguimiento de Tareas</h1>
        {filteredStrategyId && (
          <div className="filter-info">
            <p>Filtrado por Estrategia: {getStrategyName(filteredStrategyId)}</p>
            <button className="button small" onClick={() => {
              setFilteredStrategyId(null);
              navigate('/tasks');
            }}>
              <i className="fas fa-times-circle"></i> Quitar Filtro
            </button>
          </div>
        )}
        <div className="tasks-actions">
          <button className="button primary" onClick={openModal}>
            <i className="fas fa-plus-circle"></i> Crear Nueva Tarea
          </button>
          <button className="button" onClick={toggleViewMode}>
            <i className="fas fa-exchange-alt"></i> Cambiar a Vista {viewMode === 'kanban' ? 'Calendario' : 'Kanban'}
          </button>
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading">Cargando tareas...</div>
      ) : (
        <>
          {viewMode === 'kanban' ? (
            <div className="kanban-board">
              <div className="kanban-column">
                <h2>Por Hacer</h2>
                {filteredTasks
                  .filter(task => task.status === 'todo')
                  .map(task => (
                    <div key={task.id} className={`task-card priority-${task.priority}`}>
                      <div className="task-header">
                        <h3>{task.title}</h3>
                        <span className="task-priority">
                          {task.priority === 'high' ? 'Alta' : 
                           task.priority === 'medium' ? 'Media' : 'Baja'}
                        </span>
                      </div>
                      <p className="task-description">{task.description}</p>
                      <div className="task-details">
                        <p><strong>Vencimiento:</strong> {formatDate(task.dueDate)}</p>
                        <p><strong>Asignado a:</strong> {getUserName(task.assignedTo)}</p>
                        <p><strong>Estrategia:</strong> {getStrategyName(task.strategyId)}</p>
                        {task.recurrence !== 'none' && (
                          <p><strong>Recurrencia:</strong> {task.recurrence === 'daily' ? 'Diaria' : 
                                                          task.recurrence === 'weekly' ? 'Semanal' : 
                                                          task.recurrence === 'monthly' ? 'Mensual' : 
                                                          task.recurrence === 'yearly' ? 'Anual' : 
                                                          task.recurrence}</p>
                        )}
                      </div>
                      <div className="task-actions">
                        <button className="button small" onClick={() => handleEdit(task)}>
                          <i className="fas fa-edit"></i> Editar
                        </button>
                        <button className="button small" onClick={() => handleStatusChange(task.id, 'in-progress')}>
                          <i className="fas fa-arrow-right"></i> Mover a En Progreso
                        </button>
                        <button className="button small" onClick={() => handleViewComments(task.id)}>
                          <i className="fas fa-comments"></i> Comentarios
                        </button>
                        <button className="button small danger" onClick={() => handleDelete(task.id)}>
                          <i className="fas fa-trash"></i> Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
              
              <div className="kanban-column">
                <h2>En Progreso</h2>
                {filteredTasks
                  .filter(task => task.status === 'in-progress')
                  .map(task => (
                    <div key={task.id} className={`task-card priority-${task.priority}`}>
                      <div className="task-header">
                        <h3>{task.title}</h3>
                        <span className="task-priority">
                          {task.priority === 'high' ? 'Alta' : 
                           task.priority === 'medium' ? 'Media' : 'Baja'}
                        </span>
                      </div>
                      <p className="task-description">{task.description}</p>
                      <div className="task-details">
                        <p><strong>Vencimiento:</strong> {formatDate(task.dueDate)}</p>
                        <p><strong>Asignado a:</strong> {getUserName(task.assignedTo)}</p>
                        <p><strong>Estrategia:</strong> {getStrategyName(task.strategyId)}</p>
                        {task.recurrence !== 'none' && (
                          <p><strong>Recurrencia:</strong> {task.recurrence === 'daily' ? 'Diaria' : 
                                                          task.recurrence === 'weekly' ? 'Semanal' : 
                                                          task.recurrence === 'monthly' ? 'Mensual' : 
                                                          task.recurrence === 'yearly' ? 'Anual' : 
                                                          task.recurrence}</p>
                        )}
                      </div>
                      <div className="task-actions">
                        <button className="button small" onClick={() => handleEdit(task)}>
                          <i className="fas fa-edit"></i> Editar
                        </button>
                        <button className="button small" onClick={() => handleStatusChange(task.id, 'done')}>
                          <i className="fas fa-check-circle"></i> Mover a Completadas
                        </button>
                        <button className="button small" onClick={() => handleViewComments(task.id)}>
                          <i className="fas fa-comments"></i> Comentarios
                        </button>
                        <button className="button small danger" onClick={() => handleDelete(task.id)}>
                          <i className="fas fa-trash"></i> Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
              
              <div className="kanban-column">
                <h2>Completadas</h2>
                {filteredTasks
                  .filter(task => task.status === 'done')
                  .map(task => (
                    <div key={task.id} className={`task-card priority-${task.priority}`}>
                      <div className="task-header">
                        <h3>{task.title}</h3>
                        <span className="task-priority">
                          {task.priority === 'high' ? 'Alta' : 
                           task.priority === 'medium' ? 'Media' : 'Baja'}
                        </span>
                      </div>
                      <p className="task-description">{task.description}</p>
                      <div className="task-details">
                        <p><strong>Vencimiento:</strong> {formatDate(task.dueDate)}</p>
                        <p><strong>Asignado a:</strong> {getUserName(task.assignedTo)}</p>
                        <p><strong>Estrategia:</strong> {getStrategyName(task.strategyId)}</p>
                        {task.recurrence !== 'none' && (
                          <p><strong>Recurrencia:</strong> {task.recurrence === 'daily' ? 'Diaria' : 
                                                          task.recurrence === 'weekly' ? 'Semanal' : 
                                                          task.recurrence === 'monthly' ? 'Mensual' : 
                                                          task.recurrence === 'yearly' ? 'Anual' : 
                                                          task.recurrence}</p>
                        )}
                        {task.recurrence !== 'none' && (
                          <p><strong>Próxima Ocurrencia:</strong> {formatDate(task.nextOccurrence)}</p>
                        )}
                      </div>
                      <div className="task-actions">
                        <button className="button small" onClick={() => handleEdit(task)}>
                          <i className="fas fa-edit"></i> Editar
                        </button>
                        <button className="button small" onClick={() => handleViewComments(task.id)}>
                          <i className="fas fa-comments"></i> Comentarios
                        </button>
                        <button className="button small danger" onClick={() => handleDelete(task.id)}>
                          <i className="fas fa-trash"></i> Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <div className="calendar-view">
              <h2>Vista de Calendario</h2>
              <p>Implementación de calendario en desarrollo</p>
              <div className="calendar-placeholder">
                {/* En una implementación real, usaríamos una biblioteca de calendario como FullCalendar */}
                <p>Las tareas se mostrarían en un calendario basado en sus fechas de vencimiento</p>
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Task Modal */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{currentTask ? 'Editar Tarea' : 'Crear Nueva Tarea'}</h2>
              <button className="close-button" onClick={closeModal}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="title">Título de la Tarea</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
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
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="priority">Prioridad</label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="dueDate">Fecha de Vencimiento</label>
                  <input
                    type="date"
                    id="dueDate"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="status">Estado</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="todo">Por Hacer</option>
                    <option value="in-progress">En Progreso</option>
                    <option value="done">Completada</option>
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="assignedTo">Asignado a</label>
                  <select
                    id="assignedTo"
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccionar Usuario</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="strategyId">Estrategia Relacionada</label>
                  <select
                    id="strategyId"
                    name="strategyId"
                    value={formData.strategyId}
                    onChange={handleInputChange}
                  >
                    <option value="">Sin Estrategia</option>
                    {strategies.map(strategy => (
                      <option key={strategy.id} value={strategy.id}>{strategy.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="recurrence">Recurrencia</label>
                  <select
                    id="recurrence"
                    name="recurrence"
                    value={formData.recurrence}
                    onChange={handleInputChange}
                  >
                    <option value="none">Ninguna</option>
                    <option value="daily">Diaria</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensual</option>
                    <option value="quarterly">Trimestral</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>Ubicación (Opcional)</label>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="lat">Latitud</label>
                    <input
                      type="text"
                      id="lat"
                      name="lat"
                      value={formData.location.lat}
                      onChange={handleInputChange}
                      placeholder="e.g. 40.7128"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lng">Longitud</label>
                    <input
                      type="text"
                      id="lng"
                      name="lng"
                      value={formData.location.lng}
                      onChange={handleInputChange}
                      placeholder="ej. -74.0060"
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" className="button secondary" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="button primary">
                  {currentTask ? 'Actualizar Tarea' : 'Crear Tarea'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Comments Modal */}
      {showCommentModal && currentTask && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Comentarios para: {currentTask.title}</h2>
              <button className="close-button" onClick={closeCommentModal}>&times;</button>
            </div>
            <div className="comments-container">
              {comments.length === 0 ? (
                <p>No hay comentarios aún.</p>
              ) : (
                <div className="comments-list">
                  {comments.map(comment => (
                    <div key={comment.id} className="comment">
                      <div className="comment-header">
                        <span className="comment-author">{comment.user.name}</span>
                        <span className="comment-date">{new Date(comment.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="comment-content">{comment.content}</p>
                    </div>
                  ))}
                </div>
              )}
              <form onSubmit={handleAddComment} className="comment-form">
                <div className="form-group">
                  <label htmlFor="commentText">Agregar Comentario</label>
                  <textarea
                    id="commentText"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    rows="3"
                    required
                  />
                </div>
                <button type="submit" className="button primary">Agregar Comentario</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
