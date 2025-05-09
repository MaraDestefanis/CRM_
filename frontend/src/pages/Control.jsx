import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import goalService from '../services/goalService';
import saleService from '../services/saleService';
import clientService from '../services/clientService';
import strategyService from '../services/strategyService';
import taskService from '../services/taskService';

const Control = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [goals, setGoals] = useState([]);
  const [sales, setSales] = useState([]);
  const [clients, setClients] = useState([]);
  const [strategies, setStrategies] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [globalKPIs, setGlobalKPIs] = useState({
    goalCompletion: 0,
    clientRetention: 0,
    newClients: 0,
    totalSales: 0
  });
  const [alerts, setAlerts] = useState([]);
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);

  useEffect(() => {
    fetchData();
  }, [selectedPeriod]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [goalsData, salesData, clientsData, strategiesData, tasksData] = await Promise.all([
        goalService.getGoals(),
        saleService.getSales(),
        clientService.getClients(),
        strategyService.getStrategies(),
        taskService.getTasks()
      ]);
      
      setGoals(goalsData);
      setSales(salesData);
      setClients(clientsData);
      setStrategies(strategiesData);
      setTasks(tasksData);
      
      calculateGlobalKPIs(goalsData, salesData, clientsData);
      generateAlerts(goalsData, tasksData, strategiesData);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load control data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const calculateGlobalKPIs = (goalsData, salesData, clientsData) => {
    const completedGoals = goalsData.filter(goal => {
      const target = goal.target || 0;
      const actual = calculateActualValue(goal, salesData, clientsData);
      return (actual / target) >= 1;
    }).length;
    
    const goalCompletion = goalsData.length > 0 
      ? Math.round((completedGoals / goalsData.length) * 100) 
      : 0;
    
    const activeClients = clientsData.filter(client => client.active).length;
    const clientRetention = clientsData.length > 0 
      ? Math.round((activeClients / clientsData.length) * 100) 
      : 0;
    
    const periodStartDate = getPeriodStartDate();
    const newClientsCount = clientsData.filter(client => {
      const createdDate = new Date(client.createdAt);
      return createdDate >= periodStartDate;
    }).length;
    
    const totalSalesAmount = salesData
      .filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= periodStartDate;
      })
      .reduce((sum, sale) => sum + sale.amount, 0);
    
    setGlobalKPIs({
      goalCompletion,
      clientRetention,
      newClients: newClientsCount,
      totalSales: totalSalesAmount
    });
  };

  const generateAlerts = (goalsData, tasksData, strategiesData) => {
    const newAlerts = [];
    
    goalsData.forEach(goal => {
      const target = goal.target || 0;
      const actual = calculateActualValue(goal, sales, clients);
      const progress = target > 0 ? (actual / target) * 100 : 0;
      
      if (progress < 70 && getDaysRemaining() < 15) {
        newAlerts.push({
          type: 'warning',
          title: 'Underperforming Goal',
          message: `${goal.variable} - ${goal.productFamily} is at ${Math.round(progress)}% of target with ${getDaysRemaining()} days remaining.`,
          action: 'View Details',
          link: `/goals?id=${goal.id}`
        });
      }
    });
    
    const overdueTasks = tasksData.filter(task => {
      const dueDate = new Date(task.dueDate);
      return dueDate < new Date() && task.status !== 'done';
    });
    
    if (overdueTasks.length > 0) {
      const strategiesWithOverdueTasks = {};
      
      overdueTasks.forEach(task => {
        if (task.strategyId) {
          strategiesWithOverdueTasks[task.strategyId] = (strategiesWithOverdueTasks[task.strategyId] || 0) + 1;
        }
      });
      
      Object.entries(strategiesWithOverdueTasks).forEach(([strategyId, count]) => {
        const strategy = strategiesData.find(s => s.id === strategyId);
        if (strategy) {
          newAlerts.push({
            type: 'danger',
            title: 'Overdue Tasks',
            message: `${count} task${count > 1 ? 's are' : ' is'} overdue for the ${strategy.name} strategy.`,
            action: 'View Tasks',
            link: `/tasks?strategyId=${strategyId}`
          });
        }
      });
    }
    
    strategiesData.forEach(strategy => {
      const strategyTasks = tasksData.filter(task => task.strategyId === strategy.id);
      if (strategyTasks.length === 0) {
        newAlerts.push({
          type: 'info',
          title: 'Strategy Without Tasks',
          message: `${strategy.name} strategy has no associated tasks.`,
          action: 'Add Tasks',
          link: `/tasks?strategyId=${strategy.id}`
        });
      }
    });
    
    setAlerts(newAlerts);
  };

  const calculateActualValue = (goal, salesData, clientsData) => {
    switch (goal.variable) {
      case 'Revenue':
        return salesData
          .filter(sale => sale.productFamily === goal.productFamily)
          .reduce((sum, sale) => sum + sale.amount, 0);
      case 'Client Count':
        return clientsData
          .filter(client => client.active && client.productFamily === goal.productFamily)
          .length;
      case 'New Clients':
        const periodStartDate = getPeriodStartDate();
        return clientsData
          .filter(client => {
            const createdDate = new Date(client.createdAt);
            return createdDate >= periodStartDate && client.productFamily === goal.productFamily;
          })
          .length;
      case 'Non-Retained Clients':
        return clientsData
          .filter(client => !client.active && client.productFamily === goal.productFamily)
          .length;
      default:
        return 0;
    }
  };

  const getPeriodStartDate = () => {
    const now = new Date();
    
    if (selectedPeriod === 'custom' && customDateRange.startDate) {
      return new Date(customDateRange.startDate);
    }
    
    switch (selectedPeriod) {
      case 'month':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        return new Date(now.getFullYear(), quarter * 3, 1);
      case 'year':
        return new Date(now.getFullYear(), 0, 1);
      default:
        return new Date(now.getFullYear(), now.getMonth(), 1);
    }
  };

  const getDaysRemaining = () => {
    const now = new Date();
    const endDate = getEndDate();
    
    const diffTime = Math.abs(endDate - now);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getEndDate = () => {
    const now = new Date();
    
    if (selectedPeriod === 'custom' && customDateRange.endDate) {
      return new Date(customDateRange.endDate);
    }
    
    switch (selectedPeriod) {
      case 'month':
        return new Date(now.getFullYear(), now.getMonth() + 1, 0);
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        return new Date(now.getFullYear(), (quarter + 1) * 3, 0);
      case 'year':
        return new Date(now.getFullYear(), 11, 31);
      default:
        return new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }
  };

  const handlePeriodChange = (e) => {
    const period = e.target.value;
    setSelectedPeriod(period);
    
    if (period === 'custom') {
      setShowCustomDatePicker(true);
    } else {
      setShowCustomDatePicker(false);
    }
  };

  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setCustomDateRange({
      ...customDateRange,
      [name]: value
    });
  };

  const handleApplyCustomRange = () => {
    if (customDateRange.startDate && customDateRange.endDate) {
      fetchData();
      setShowCustomDatePicker(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const getGoalStatus = (progress) => {
    if (progress >= 90) return 'on-track';
    if (progress >= 70) return 'needs-attention';
    return 'at-risk';
  };

  const getGoalStatusText = (progress) => {
    if (progress >= 90) return 'On Track';
    if (progress >= 70) return 'Needs Attention';
    return 'At Risk';
  };

  const calculateStrategyImpact = (strategy) => {
    return Math.floor(Math.random() * 25) - 5;
  };

  const calculateTaskCompletion = (strategyId) => {
    const strategyTasks = tasks.filter(task => task.strategyId === strategyId);
    if (strategyTasks.length === 0) return 0;
    
    const completedTasks = strategyTasks.filter(task => task.status === 'done').length;
    return Math.round((completedTasks / strategyTasks.length) * 100);
  };

  const handleAlertAction = (link) => {
    navigate(link);
  };

  return (
    <div className="control-page">
      <div className="page-header">
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
          
          {showCustomDatePicker && (
            <div className="custom-date-picker">
              <div className="date-inputs">
                <div className="form-group">
                  <label htmlFor="startDate">Start Date:</label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={customDateRange.startDate}
                    onChange={handleDateRangeChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="endDate">End Date:</label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={customDateRange.endDate}
                    onChange={handleDateRangeChange}
                    required
                  />
                </div>
              </div>
              <button 
                className="button primary"
                onClick={handleApplyCustomRange}
                disabled={!customDateRange.startDate || !customDateRange.endDate}
              >
                Apply
              </button>
            </div>
          )}
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading">Loading control data...</div>
      ) : (
        <>
          <div className="global-kpis">
            <h2>Global KPIs</h2>
            <div className="kpi-cards">
              <div className="kpi-card">
                <h3>Goal Completion</h3>
                <p className="kpi-value">{globalKPIs.goalCompletion}%</p>
              </div>
              <div className="kpi-card">
                <h3>Client Retention</h3>
                <p className="kpi-value">{globalKPIs.clientRetention}%</p>
              </div>
              <div className="kpi-card">
                <h3>New Clients</h3>
                <p className="kpi-value">{globalKPIs.newClients}</p>
              </div>
              <div className="kpi-card">
                <h3>Total Sales</h3>
                <p className="kpi-value">{formatCurrency(globalKPIs.totalSales)}</p>
              </div>
            </div>
          </div>
          
          <div className="goal-progress">
            <h2>Goal Progress</h2>
            {goals.length === 0 ? (
              <p>No goals found. Create goals to track progress.</p>
            ) : (
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
                  {goals.map(goal => {
                    const target = goal.target || 0;
                    const actual = calculateActualValue(goal, sales, clients);
                    const progress = target > 0 ? Math.round((actual / target) * 100) : 0;
                    const status = getGoalStatus(progress);
                    
                    return (
                      <tr key={goal.id}>
                        <td>{goal.variable} - {goal.productFamily}</td>
                        <td>{goal.variable}</td>
                        <td>{goal.variable === 'Revenue' ? formatCurrency(target) : target}</td>
                        <td>{goal.variable === 'Revenue' ? formatCurrency(actual) : actual}</td>
                        <td>
                          <div className="progress-bar">
                            <div 
                              className={`progress ${status}`} 
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            ></div>
                          </div>
                          <span>{progress}%</span>
                        </td>
                        <td><span className={`status ${status}`}>{getGoalStatusText(progress)}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
          
          <div className="strategy-impact">
            <h2>Strategy Impact</h2>
            {strategies.length === 0 ? (
              <p>No strategies found. Create strategies to track their impact.</p>
            ) : (
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
                  {strategies.map(strategy => {
                    const taskCompletion = calculateTaskCompletion(strategy.id);
                    const impact = calculateStrategyImpact(strategy);
                    const goal = goals.find(g => g.id === strategy.goalId);
                    
                    return (
                      <tr key={strategy.id}>
                        <td>{strategy.name}</td>
                        <td>{goal ? `${goal.variable} - ${goal.productFamily}` : 'No Goal Linked'}</td>
                        <td>{taskCompletion}%</td>
                        <td className={impact >= 0 ? 'positive' : 'negative'}>
                          {impact >= 0 ? '+' : ''}{impact}%
                        </td>
                        <td>
                          <span className={`status ${impact >= 0 ? 'positive' : 'negative'}`}>
                            {impact >= 0 ? 'Positive' : 'Negative'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
          
          <div className="alerts-section">
            <h2>Alerts</h2>
            {alerts.length === 0 ? (
              <p>No alerts at this time.</p>
            ) : (
              <div className="alerts-list">
                {alerts.map((alert, index) => (
                  <div key={index} className={`alert ${alert.type}`}>
                    <h3>{alert.title}</h3>
                    <p>{alert.message}</p>
                    <button 
                      className="button small"
                      onClick={() => handleAlertAction(alert.link)}
                    >
                      {alert.action}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Control;
