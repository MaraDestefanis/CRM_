import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/Sidebar.css';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <ul className="sidebar-menu">
        <li>
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
            <i className="fas fa-tachometer-alt"></i> Panel Principal
          </NavLink>
        </li>
        <li>
          <NavLink to="/goals" className={({ isActive }) => isActive ? 'active' : ''}>
            <i className="fas fa-bullseye"></i> Gestión de Objetivos
          </NavLink>
        </li>
        <li>
          <NavLink to="/analysis" className={({ isActive }) => isActive ? 'active' : ''}>
            <i className="fas fa-chart-line"></i> Análisis de Ventas
          </NavLink>
        </li>
        <li>
          <NavLink to="/strategies" className={({ isActive }) => isActive ? 'active' : ''}>
            <i className="fas fa-chess"></i> Definición de Estrategias
          </NavLink>
        </li>
        <li>
          <NavLink to="/tasks" className={({ isActive }) => isActive ? 'active' : ''}>
            <i className="fas fa-tasks"></i> Planificación de Tareas
          </NavLink>
        </li>
        <li>
          <NavLink to="/control" className={({ isActive }) => isActive ? 'active' : ''}>
            <i className="fas fa-chart-pie"></i> Control y Resultados
          </NavLink>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
