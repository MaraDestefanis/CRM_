import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ onLogout }) => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/dashboard">CRM System</Link>
      </div>
      <div className="navbar-menu">
        <div className="navbar-end">
          <div className="navbar-item">
            <button className="button is-light" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
