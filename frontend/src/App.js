import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout components
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';

// Pages
import Dashboard from './pages/Dashboard';
import FireRiskMap from './pages/FireRiskMap';
import HistoricalData from './pages/HistoricalData';
import Alerts from './pages/Alerts';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';

// Context for authentication
import { AuthContext } from './context/AuthContext';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // In a real app, validate the token with the backend
          // For now, we'll just get the user info from localStorage
          const userData = JSON.parse(localStorage.getItem('user') || '{}');
          setUser(userData);
        } catch (error) {
          console.error('Error validating token:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Authentication functions
  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Private route component
  const PrivateRoute = ({ element }) => {
    if (loading) return <div>Loading...</div>;
    return user ? element : <Navigate to="/login" />;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <div className="flex flex-col h-screen">
        <Header />
        
        <div className="flex flex-1 overflow-hidden">
          {user && <Sidebar />}
          
          <main className="flex-1 overflow-y-auto bg-gray-100 p-4">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Private routes */}
              <Route path="/" element={<PrivateRoute element={<Dashboard />} />} />
              <Route path="/map" element={<PrivateRoute element={<FireRiskMap />} />} />
              <Route path="/historical" element={<PrivateRoute element={<HistoricalData />} />} />
              <Route path="/alerts" element={<PrivateRoute element={<Alerts />} />} />
              <Route path="/profile" element={<PrivateRoute element={<Profile />} />} />
              
              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </div>
    </AuthContext.Provider>
  );
}

export default App; 