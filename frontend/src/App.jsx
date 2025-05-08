import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import './App.css';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Goals from './pages/Goals';
import Analysis from './pages/Analysis';
import Strategies from './pages/Strategies';
import Tasks from './pages/Tasks';
import Control from './pages/Control';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import authService from './services/authService';

const ProtectedLayout = ({ user, onLogout }) => {
  return (
    <>
      <Navbar user={user} onLogout={onLogout} />
      <div className="content-wrapper">
        <Sidebar />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  }, []);
  
  const handleLogin = async (credentials) => {
    try {
      await authService.login(credentials.email, credentials.password);
      setIsAuthenticated(true);
      setUser(authService.getCurrentUser());
      return true;
    } catch (error) {
      console.error('Error de inicio de sesión:', error);
      return false;
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />
          } />
          
          <Route 
            element={
              isAuthenticated ? 
                <ProtectedLayout user={user} onLogout={handleLogout} /> : 
                <Navigate to="/login" replace />
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/strategies" element={<Strategies />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/control" element={<Control />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
