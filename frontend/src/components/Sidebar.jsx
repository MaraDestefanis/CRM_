import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import '../styles/Dashboard.css';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Link to="/" className="sidebar-logo">CRM</Link>
      </div>
      
      <div className="sidebar-actions">
        <button className="action-button">
          <i className="fa fa-download"></i> Export
        </button>
        <button className="action-button">
          <i className="fa fa-share-alt"></i> Share
        </button>
      </div>
      
      <ul className="sidebar-menu">
        <li>
          <NavLink to="/goals" className={({ isActive }) => isActive ? 'active' : ''}>
            Objectives
          </NavLink>
        </li>
        <li>
          <NavLink to="/analysis" className={({ isActive }) => isActive ? 'active' : ''}>
            Analysis
          </NavLink>
        </li>
        <li>
          <NavLink to="/strategies" className={({ isActive }) => isActive ? 'active' : ''}>
            Strategies
          </NavLink>
        </li>
        <li>
          <NavLink to="/tasks" className={({ isActive }) => isActive ? 'active' : ''}>
            Tasks
          </NavLink>
        </li>
        <li>
          <NavLink to="/control" className={({ isActive }) => isActive ? 'active' : ''}>
            Control
          </NavLink>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
