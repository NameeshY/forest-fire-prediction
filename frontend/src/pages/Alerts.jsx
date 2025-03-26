import React, { useState, useEffect } from 'react';
import { getAlerts, updateAlert, markAllAlertsRead } from '../services/api';
import { format } from 'date-fns';

const AlertItem = ({ alert, onMarkRead }) => {
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };

  const getRiskLevelClass = (riskLevel) => {
    if (riskLevel > 0.7) return 'bg-danger-100 text-danger-800 border-danger-300';
    if (riskLevel > 0.4) return 'bg-warning-100 text-warning-800 border-warning-300';
    return 'bg-success-100 text-success-800 border-success-300';
  };

  return (
    <div 
      className={`mb-4 p-4 rounded-lg border ${
        alert.is_read 
          ? 'bg-gray-50 border-gray-200' 
          : getRiskLevelClass(alert.risk_level)
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center">
            <h3 className="text-lg font-semibold">
              {alert.risk_level > 0.7 
                ? 'High Risk Alert' 
                : alert.risk_level > 0.4 
                  ? 'Medium Risk Alert' 
                  : 'Low Risk Alert'}
            </h3>
            {!alert.is_read && (
              <span className="ml-2 alert-badge alert-badge-unread">New</span>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1">{formatDate(alert.alert_time)}</p>
        </div>
        
        {!alert.is_read && (
          <button 
            onClick={() => onMarkRead(alert.id)}
            className="text-sm text-primary-600 hover:text-primary-800"
          >
            Mark as read
          </button>
        )}
      </div>
      
      <p className="mt-2">{alert.message}</p>
      
      <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between text-sm">
        <span>Risk Level: <strong>{(alert.risk_level * 100).toFixed(0)}%</strong></span>
        <span>Sent via: {alert.is_sent_email ? 'Email' : 'App'}</span>
      </div>
    </div>
  );
};

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  
  useEffect(() => {
    fetchAlerts();
  }, [filter]);
  
  const fetchAlerts = async () => {
    setLoading(true);
    try {
      // Build query parameters based on filter
      const params = {};
      if (filter === 'unread') params.is_read = false;
      if (filter === 'read') params.is_read = true;
      
      const response = await getAlerts(params);
      setAlerts(response.data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      setError('Failed to load alerts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleMarkRead = async (alertId) => {
    try {
      await updateAlert(alertId, { is_read: true });
      
      // Update local state
      setAlerts(alerts.map(alert => 
        alert.id === alertId ? { ...alert, is_read: true } : alert
      ));
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };
  
  const handleMarkAllRead = async () => {
    try {
      await markAllAlertsRead();
      
      // Update local state
      setAlerts(alerts.map(alert => ({ ...alert, is_read: true })));
    } catch (error) {
      console.error('Error marking all alerts as read:', error);
    }
  };

  const getUnreadCount = () => {
    return alerts.filter(alert => !alert.is_read).length;
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Alerts</h1>
          <p className="text-gray-600">Stay informed about fire risks in your monitored areas</p>
        </div>
        
        <div className="flex items-center">
          {getUnreadCount() > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="mr-4 text-sm text-primary-600 hover:text-primary-800"
            >
              Mark all as read
            </button>
          )}
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="form-select rounded-md border-gray-300 focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
          >
            <option value="all">All alerts</option>
            <option value="unread">Unread alerts</option>
            <option value="read">Read alerts</option>
          </select>
        </div>
      </div>
      
      {error && (
        <div className="bg-danger-100 border border-danger-400 text-danger-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-10">
          <svg className="animate-spin h-10 w-10 text-primary-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2 text-gray-600">Loading alerts...</p>
        </div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No alerts found</h3>
          <p className="mt-1 text-gray-500">
            {filter === 'unread' 
              ? "You've read all your alerts. Great job staying informed!" 
              : filter === 'read' 
                ? "You haven't read any alerts yet." 
                : "You don't have any alerts yet."}
          </p>
        </div>
      ) : (
        <div>
          {alerts.map(alert => (
            <AlertItem 
              key={alert.id} 
              alert={alert} 
              onMarkRead={handleMarkRead} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Alerts; 