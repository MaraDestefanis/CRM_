import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <ul className="sidebar-menu">
        <li>
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/goals" className={({ isActive }) => isActive ? 'active' : ''}>
            Goal Management
          </NavLink>
        </li>
        <li>
          <NavLink to="/analysis" className={({ isActive }) => isActive ? 'active' : ''}>
            Sales Analysis
          </NavLink>
        </li>
        <li>
          <NavLink to="/strategies" className={({ isActive }) => isActive ? 'active' : ''}>
            Strategy Definition
          </NavLink>
        </li>
        <li>
          <NavLink to="/tasks" className={({ isActive }) => isActive ? 'active' : ''}>
            Task Planning
          </NavLink>
        </li>
        <li>
          <NavLink to="/control" className={({ isActive }) => isActive ? 'active' : ''}>
            Control &amp; Results
          </NavLink>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
