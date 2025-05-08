import React, { useState, useEffect } from 'react';
import clientService from '../services/clientService';
import saleService from '../services/saleService';
import goalService from '../services/goalService';
import '../styles/Analysis.css';

const Analysis = () => {
  const [selectedVariable, setSelectedVariable] = useState('revenue');
  const [clients, setClients] = useState([]);
  const [sales, setSales] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleColumns, setVisibleColumns] = useState(['client', 'i1', 'i2', 'i3', 'i4', 'abcClass', 'category', 'reason']);
  const [filters, setFilters] = useState([]);
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const categories = {
    revenue: ['High Value', 'Medium Value', 'Low Value'],
    clientCount: ['Active', 'Inactive', 'Potential'],
    newClients: ['First Purchase', 'Referred', 'Marketing Campaign'],
    nonRetainedClients: ['No Retained', 'With Issues', 'Retained']
  };

  const reasons = {
    'High Value': ['Frequent Buyer', 'Large Orders', 'Premium Products'],
    'Medium Value': ['Regular Orders', 'Mixed Products', 'Seasonal Buyer'],
    'Low Value': ['Infrequent Buyer', 'Small Orders', 'Basic Products'],
    'No Retained': ['Price Issues', 'Quality Issues', 'Service Issues', 'Competitor Offer'],
    'With Issues': ['Late Delivery', 'Product Availability', 'Payment Issues'],
    'Retained': ['Satisfied', 'Loyal Customer', 'Contract Renewal']
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [clientsData, salesData, goalsData] = await Promise.all([
        clientService.getClients(),
        saleService.getSales(),
        goalService.getGoals()
      ]);
      
      setClients(clientsData);
      setSales(salesData);
      setGoals(goalsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load analysis data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleVariableChange = (e) => {
    setSelectedVariable(e.target.value);
  };

  const handleColumnToggle = (column) => {
    if (visibleColumns.includes(column)) {
      setVisibleColumns(visibleColumns.filter(col => col !== column));
    } else {
      setVisibleColumns([...visibleColumns, column]);
    }
  };

  const handleAddFilter = (filter) => {
    setFilters([...filters, filter]);
    setShowFilterModal(false);
  };

  const handleRemoveFilter = (index) => {
    const newFilters = [...filters];
    newFilters.splice(index, 1);
    setFilters(newFilters);
  };

  const handleEditCategory = (client) => {
    setEditingClient(client);
    setShowCategoryModal(true);
  };

  const handleSaveCategory = async (categoryData) => {
    try {
      await clientService.updateClientCategory(editingClient.id, categoryData);
      fetchData(); // Refresh data
      setShowCategoryModal(false);
      setEditingClient(null);
    } catch (err) {
      console.error('Error updating category:', err);
      setError('Failed to update client category. Please try again.');
    }
  };

  const exportData = () => {
    const headers = ['Client'];
    visibleColumns.forEach(col => {
      if (col !== 'client') {
        headers.push(col.charAt(0).toUpperCase() + col.slice(1));
      }
    });
    
    let csvContent = headers.join(',') + '\n';
    
    clients.forEach(client => {
      const row = [client.name];
      visibleColumns.forEach(col => {
        if (col !== 'client') {
          row.push(client[col] || '');
        }
      });
      csvContent += row.join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedVariable}_analysis.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const calculateKPIs = () => {
    switch (selectedVariable) {
      case 'revenue':
        return {
          total: sales.reduce((sum, sale) => sum + sale.amount, 0),
          vsGoal: calculateGoalPercentage('Revenue'),
          growth: calculateGrowth('Revenue')
        };
      case 'clientCount':
        return {
          total: clients.filter(client => client.active).length,
          vsGoal: calculateGoalPercentage('Client Count'),
          growth: calculateGrowth('Client Count')
        };
      case 'newClients':
        return {
          total: clients.filter(client => {
            const createdDate = new Date(client.createdAt);
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            return createdDate > oneMonthAgo;
          }).length,
          vsGoal: calculateGoalPercentage('New Clients'),
          growth: calculateGrowth('New Clients')
        };
      case 'nonRetainedClients':
        return {
          total: clients.filter(client => !client.active).length,
          vsGoal: calculateGoalPercentage('Non-Retained Clients'),
          growth: calculateGrowth('Non-Retained Clients')
        };
      default:
        return { total: 0, vsGoal: 0, growth: 0 };
    }
  };

  const calculateGoalPercentage = (variable) => {
    const relevantGoal = goals.find(goal => goal.variable === variable);
    if (!relevantGoal) return 0;
    
    let actual = 0;
    switch (variable) {
      case 'Revenue':
        actual = sales.reduce((sum, sale) => sum + sale.amount, 0);
        break;
      case 'Client Count':
        actual = clients.filter(client => client.active).length;
        break;
      case 'New Clients':
        actual = clients.filter(client => {
          const createdDate = new Date(client.createdAt);
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
          return createdDate > oneMonthAgo;
        }).length;
        break;
      case 'Non-Retained Clients':
        actual = clients.filter(client => !client.active).length;
        break;
      default:
        actual = 0;
    }
    
    return Math.round((actual / relevantGoal.target) * 100);
  };

  const calculateGrowth = (variable) => {
    return Math.floor(Math.random() * 30) - 10;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatPercentage = (value) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value}%`;
  };

  const kpis = calculateKPIs();

  return (
    <div className="analysis-page">
      <div className="page-header">
        <h1 className="page-title">Análisis de Ventas</h1>
        <div className="variable-selector">
          <label htmlFor="variable">Seleccionar Variable:</label>
          <select 
            id="variable" 
            value={selectedVariable} 
            onChange={handleVariableChange}
          >
            <option value="revenue">Ingresos</option>
            <option value="clientCount">Cantidad de Clientes</option>
            <option value="newClients">Nuevos Clientes</option>
            <option value="nonRetainedClients">Clientes No Retenidos</option>
          </select>
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading">Cargando datos de análisis...</div>
      ) : (
        <>
          <div className="dashboard-section">
            <h2>Panel de Control</h2>
            <div className="kpi-cards">
              {selectedVariable === 'revenue' && (
                <>
                  <div className="kpi-card">
                    <h3>Ingresos Totales</h3>
                    <p className="kpi-value">{formatCurrency(kpis.total)}</p>
                  </div>
                  <div className="kpi-card">
                    <h3>% vs Objetivo</h3>
                    <p className="kpi-value">{kpis.vsGoal}%</p>
                  </div>
                  <div className="kpi-card">
                    <h3>Crecimiento Mensual</h3>
                    <p className={`kpi-value ${kpis.growth >= 0 ? 'positive' : 'negative'}`}>
                      {formatPercentage(kpis.growth)}
                    </p>
                  </div>
                </>
              )}
              
              {selectedVariable === 'clientCount' && (
                <>
                  <div className="kpi-card">
                    <h3>Clientes Actuales</h3>
                    <p className="kpi-value">{kpis.total}</p>
                  </div>
                  <div className="kpi-card">
                    <h3>Objetivo</h3>
                    <p className="kpi-value">{goals.find(g => g.variable === 'Client Count')?.target || 'N/A'}</p>
                  </div>
                  <div className="kpi-card">
                    <h3>Completado</h3>
                    <p className="kpi-value">{kpis.vsGoal}%</p>
                  </div>
                </>
              )}
              
              {selectedVariable === 'newClients' && (
                <>
                  <div className="kpi-card">
                    <h3>Nuevos Clientes</h3>
                    <p className="kpi-value">{kpis.total}</p>
                  </div>
                  <div className="kpi-card">
                    <h3>Objetivo</h3>
                    <p className="kpi-value">{goals.find(g => g.variable === 'New Clients')?.target || 'N/A'}</p>
                  </div>
                  <div className="kpi-card">
                    <h3>% del Total</h3>
                    <p className="kpi-value">
                      {clients.length ? Math.round((kpis.total / clients.length) * 100) : 0}%
                    </p>
                  </div>
                </>
              )}
              
              {selectedVariable === 'nonRetainedClients' && (
                <>
                  <div className="kpi-card">
                    <h3>No Retenidos</h3>
                    <p className="kpi-value">{kpis.total}</p>
                  </div>
                  <div className="kpi-card">
                    <h3>Tasa de Retención</h3>
                    <p className="kpi-value">
                      {clients.length ? Math.round(((clients.length - kpis.total) / clients.length) * 100) : 0}%
                    </p>
                  </div>
                  <div className="kpi-card">
                    <h3>Cambio Mensual</h3>
                    <p className={`kpi-value ${kpis.growth >= 0 ? 'negative' : 'positive'}`}>
                      {formatPercentage(kpis.growth)}
                    </p>
                  </div>
                </>
              )}
            </div>
            
            <div className="chart-container">
              <h3>{selectedVariable === 'revenue' ? 'Tendencia de Ingresos' : 
                   selectedVariable === 'clientCount' ? 'Evolución de Clientes' :
                   selectedVariable === 'newClients' ? 'Adquisición de Nuevos Clientes' :
                   'Tendencias de Retención de Clientes'}</h3>
              <div className="chart-placeholder">
                {/* In a real implementation, we would use a charting library like Chart.js or Recharts */}
                <p>El gráfico de {selectedVariable === 'revenue' ? 'ingresos' : 
                   selectedVariable === 'clientCount' ? 'clientes' :
                   selectedVariable === 'newClients' ? 'nuevos clientes' :
                   'retención de clientes'} se mostraría aquí</p>
              </div>
            </div>
          </div>
          
          <div className="table-section">
            <h2>Análisis Detallado</h2>
            
            <div className="active-filters">
              {filters.map((filter, index) => (
                <div key={index} className="filter-tag">
                  <span>{filter.column} {filter.operator} {filter.value}</span>
                  <button onClick={() => handleRemoveFilter(index)}>×</button>
                </div>
              ))}
            </div>
            
            <div className="table-controls">
              <button className="button" onClick={() => setShowColumnModal(true)}>
                <i className="fas fa-columns"></i> Configurar Columnas
              </button>
              <button className="button" onClick={() => setShowFilterModal(true)}>
                <i className="fas fa-filter"></i> Añadir Filtro
              </button>
              <button className="button" onClick={exportData}>
                <i className="fas fa-download"></i> Exportar
              </button>
            </div>
            
            <div className="table-container">
              <table className="analysis-table">
                <thead>
                  <tr>
                    {visibleColumns.includes('client') && <th>Cliente</th>}
                    {visibleColumns.includes('i1') && <th>I1</th>}
                    {visibleColumns.includes('i2') && <th>I2</th>}
                    {visibleColumns.includes('i3') && <th>I3</th>}
                    {visibleColumns.includes('i4') && <th>I4</th>}
                    {visibleColumns.includes('abcClass') && <th>Clase ABC</th>}
                    {visibleColumns.includes('category') && <th>Categoría</th>}
                    {visibleColumns.includes('reason') && <th>Razón</th>}
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {/* For demo purposes, we'll use static data until the backend is fully connected */}
                  <tr>
                    {visibleColumns.includes('client') && <td>Cliente A</td>}
                    {visibleColumns.includes('i1') && <td>{formatCurrency(5000)}</td>}
                    {visibleColumns.includes('i2') && <td className="positive">+15%</td>}
                    {visibleColumns.includes('i3') && <td className="positive">+8%</td>}
                    {visibleColumns.includes('i4') && <td className="positive">+20%</td>}
                    {visibleColumns.includes('abcClass') && <td>A</td>}
                    {visibleColumns.includes('category') && <td>Retenido</td>}
                    {visibleColumns.includes('reason') && <td>Satisfecho</td>}
                    <td>
                      <button 
                        className="button small"
                        onClick={() => handleEditCategory({
                          id: 1,
                          name: 'Cliente A',
                          category: 'Retenido',
                          reason: 'Satisfecho'
                        })}
                      >
                        <i className="fas fa-edit"></i> Editar
                      </button>
                    </td>
                  </tr>
                  <tr>
                    {visibleColumns.includes('client') && <td>Cliente B</td>}
                    {visibleColumns.includes('i1') && <td>{formatCurrency(3200)}</td>}
                    {visibleColumns.includes('i2') && <td className="negative">-5%</td>}
                    {visibleColumns.includes('i3') && <td className="negative">-10%</td>}
                    {visibleColumns.includes('i4') && <td className="positive">+5%</td>}
                    {visibleColumns.includes('abcClass') && <td>B</td>}
                    {visibleColumns.includes('category') && <td>Con Problemas</td>}
                    {visibleColumns.includes('reason') && <td>Problemas de precio</td>}
                    <td>
                      <button 
                        className="button small"
                        onClick={() => handleEditCategory({
                          id: 2,
                          name: 'Cliente B',
                          category: 'Con Problemas',
                          reason: 'Problemas de precio'
                        })}
                      >
                        <i className="fas fa-edit"></i> Editar
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      
      {/* Column Configuration Modal */}
      {showColumnModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Configure Columns</h2>
              <button className="close-button" onClick={() => setShowColumnModal(false)}>&times;</button>
            </div>
            <div className="column-options">
              <div className="column-option">
                <input 
                  type="checkbox" 
                  id="col-client" 
                  checked={visibleColumns.includes('client')} 
                  onChange={() => handleColumnToggle('client')}
                />
                <label htmlFor="col-client">Client</label>
              </div>
              <div className="column-option">
                <input 
                  type="checkbox" 
                  id="col-i1" 
                  checked={visibleColumns.includes('i1')} 
                  onChange={() => handleColumnToggle('i1')}
                />
                <label htmlFor="col-i1">I1</label>
              </div>
              <div className="column-option">
                <input 
                  type="checkbox" 
                  id="col-i2" 
                  checked={visibleColumns.includes('i2')} 
                  onChange={() => handleColumnToggle('i2')}
                />
                <label htmlFor="col-i2">I2</label>
              </div>
              <div className="column-option">
                <input 
                  type="checkbox" 
                  id="col-i3" 
                  checked={visibleColumns.includes('i3')} 
                  onChange={() => handleColumnToggle('i3')}
                />
                <label htmlFor="col-i3">I3</label>
              </div>
              <div className="column-option">
                <input 
                  type="checkbox" 
                  id="col-i4" 
                  checked={visibleColumns.includes('i4')} 
                  onChange={() => handleColumnToggle('i4')}
                />
                <label htmlFor="col-i4">I4</label>
              </div>
              <div className="column-option">
                <input 
                  type="checkbox" 
                  id="col-abcClass" 
                  checked={visibleColumns.includes('abcClass')} 
                  onChange={() => handleColumnToggle('abcClass')}
                />
                <label htmlFor="col-abcClass">Clase ABC</label>
              </div>
              <div className="column-option">
                <input 
                  type="checkbox" 
                  id="col-category" 
                  checked={visibleColumns.includes('category')} 
                  onChange={() => handleColumnToggle('category')}
                />
                <label htmlFor="col-category">Categoría</label>
              </div>
              <div className="column-option">
                <input 
                  type="checkbox" 
                  id="col-reason" 
                  checked={visibleColumns.includes('reason')} 
                  onChange={() => handleColumnToggle('reason')}
                />
                <label htmlFor="col-reason">Razón</label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="button primary" onClick={() => setShowColumnModal(false)}>
                <i className="fas fa-check"></i> Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Filter Modal */}
      {showFilterModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add Filter</h2>
              <button className="close-button" onClick={() => setShowFilterModal(false)}>&times;</button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const column = e.target.column.value;
              const operator = e.target.operator.value;
              const value = e.target.value.value;
              handleAddFilter({ column, operator, value });
            }}>
              <div className="form-group">
                <label htmlFor="column">Column</label>
                <select id="column" name="column" required>
                  <option value="client">Client</option>
                  <option value="i1">I1</option>
                  <option value="i2">I2</option>
                  <option value="i3">I3</option>
                  <option value="i4">I4</option>
                  <option value="abcClass">ABC Class</option>
                  <option value="category">Category</option>
                  <option value="reason">Reason</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="operator">Operator</label>
                <select id="operator" name="operator" required>
                  <option value="equals">Equals</option>
                  <option value="contains">Contains</option>
                  <option value="greaterThan">Greater Than</option>
                  <option value="lessThan">Less Than</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="value">Value</label>
                <input type="text" id="value" name="value" required />
              </div>
              <div className="form-actions">
                <button type="button" className="button secondary" onClick={() => setShowFilterModal(false)}>Cancel</button>
                <button type="submit" className="button primary">Add Filter</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Category Edit Modal */}
      {showCategoryModal && editingClient && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Client Category</h2>
              <button className="close-button" onClick={() => {
                setShowCategoryModal(false);
                setEditingClient(null);
              }}>&times;</button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const category = e.target.category.value;
              const reason = e.target.reason.value;
              handleSaveCategory({ category, reason });
            }}>
              <div className="client-info">
                <h3>{editingClient.name}</h3>
              </div>
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select 
                  id="category" 
                  name="category" 
                  defaultValue={editingClient.category}
                  required
                >
                  {categories[selectedVariable].map((category, index) => (
                    <option key={index} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="reason">Reason</label>
                <select 
                  id="reason" 
                  name="reason" 
                  defaultValue={editingClient.reason}
                  required
                >
                  {reasons[editingClient.category]?.map((reason, index) => (
                    <option key={index} value={reason}>{reason}</option>
                  )) || <option value="">Select a category first</option>}
                </select>
              </div>
              <div className="form-actions">
                <button type="button" className="button secondary" onClick={() => {
                  setShowCategoryModal(false);
                  setEditingClient(null);
                }}>Cancel</button>
                <button type="submit" className="button primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analysis;
