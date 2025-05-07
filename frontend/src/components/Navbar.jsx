import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
    }
  };
  
  return (
    <div className="navbar-container">
      <div className="navbar-user">
        {user && (
          <span className="user-name">{user.name || 'User'}</span>
        )}
      </div>
      <div className="navbar-actions">
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;
