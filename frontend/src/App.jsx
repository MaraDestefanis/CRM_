import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import './styles/Dashboard.css';

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

const ProtectedRoute = ({ children }) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
  const [user, setUser] = useState(authService.getCurrentUser());
  
  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated());
    setUser(authService.getCurrentUser());
  }, []);
  
  const handleLogin = async (credentials) => {
    try {
      await authService.login(credentials.email, credentials.password);
      setIsAuthenticated(true);
      setUser(authService.getCurrentUser());
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };
  
  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <div className="app">
      {isAuthenticated && (
        <>
          <Navbar user={user} onLogout={handleLogout} />
          <div className="content-wrapper">
            <Sidebar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/goals" element={
                  <ProtectedRoute>
                    <Goals />
                  </ProtectedRoute>
                } />
                <Route path="/analysis" element={
                  <ProtectedRoute>
                    <Analysis />
                  </ProtectedRoute>
                } />
                <Route path="/strategies" element={
                  <ProtectedRoute>
                    <Strategies />
                  </ProtectedRoute>
                } />
                <Route path="/tasks" element={
                  <ProtectedRoute>
                    <Tasks />
                  </ProtectedRoute>
                } />
                <Route path="/control" element={
                  <ProtectedRoute>
                    <Control />
                  </ProtectedRoute>
                } />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </>
      )}
      {!isAuthenticated && (
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </div>
  );
}

export default App;
