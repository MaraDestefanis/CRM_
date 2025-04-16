import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const handleLogin = (credentials) => {
    if (credentials.email && credentials.password) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };
  
  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <div className="app">
        {isAuthenticated && (
          <>
            <Navbar onLogout={handleLogout} />
            <div className="content-wrapper">
              <Sidebar />
              <main className="main-content">
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/goals" element={<Goals />} />
                  <Route path="/analysis" element={<Analysis />} />
                  <Route path="/strategies" element={<Strategies />} />
                  <Route path="/tasks" element={<Tasks />} />
                  <Route path="/control" element={<Control />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
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
    </Router>
  );
}

export default App;
