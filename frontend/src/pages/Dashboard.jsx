import React from 'react';
import '../styles/Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <h1 className="page-title">Panel Principal</h1>
      
      <div className="dashboard-summary">
        <div className="summary-card">
          <div className="card-icon">
            <i className="fas fa-bullseye"></i>
          </div>
          <div className="card-content">
            <h3>Objetivos</h3>
            <p className="card-value">5</p>
            <p className="card-description">objetivos activos</p>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="card-icon">
            <i className="fas fa-chart-line"></i>
          </div>
          <div className="card-content">
            <h3>Ventas</h3>
            <p className="card-value">$10,000</p>
            <p className="card-description">este mes</p>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="card-icon">
            <i className="fas fa-users"></i>
          </div>
          <div className="card-content">
            <h3>Clientes</h3>
            <p className="card-value">25</p>
            <p className="card-description">clientes activos</p>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="card-icon">
            <i className="fas fa-tasks"></i>
          </div>
          <div className="card-content">
            <h3>Tareas</h3>
            <p className="card-value">12</p>
            <p className="card-description">tareas pendientes</p>
          </div>
        </div>
      </div>
      
      <div className="dashboard-charts">
        <div className="chart-card">
          <h3 className="chart-title">
            <i className="fas fa-chart-bar"></i> Rendimiento de Ventas
          </h3>
          <div className="chart-content">
            <div className="chart-placeholder">
              <i className="fas fa-chart-line chart-icon"></i>
              <p>Gráfico de ventas</p>
            </div>
          </div>
        </div>
        
        <div className="chart-card">
          <h3 className="chart-title">
            <i className="fas fa-bullseye"></i> Progreso de Objetivos
          </h3>
          <div className="chart-content">
            <div className="chart-placeholder">
              <i className="fas fa-chart-pie chart-icon"></i>
              <p>Gráfico de progreso</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
