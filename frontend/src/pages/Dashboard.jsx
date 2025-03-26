import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { getFireRiskZones, getFireIncidents, getAlerts } from '../services/api';
import { AuthContext } from '../context/AuthContext';

// Component for dashboard stats card
const StatCard = ({ title, value, icon, color }) => (
  <div className="dashboard-card">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <div className={`p-3 rounded-full bg-${color}-100 text-${color}-600`}>
        {icon}
      </div>
    </div>
  </div>
);

// Component for recent alerts
const RecentAlerts = ({ alerts }) => (
  <div className="dashboard-card">
    <h3 className="dashboard-title">Recent Alerts</h3>
    <div className="divide-y divide-gray-200">
      {alerts.length === 0 ? (
        <p className="py-2 text-gray-500">No recent alerts</p>
      ) : (
        alerts.map((alert) => (
          <div key={alert.id} className="py-2">
            <div className="flex justify-between">
              <p className="font-medium">{alert.message}</p>
              <span className={`alert-badge ${alert.is_read ? 'alert-badge-read' : 'alert-badge-unread'}`}>
                {alert.is_read ? 'Read' : 'Unread'}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              {new Date(alert.alert_time).toLocaleString()}
            </p>
          </div>
        ))
      )}
    </div>
    <div className="mt-4">
      <Link to="/alerts" className="text-primary-600 hover:text-primary-800 text-sm font-medium">
        View all alerts
      </Link>
    </div>
  </div>
);

// Component for high risk areas
const HighRiskAreas = ({ zones }) => (
  <div className="dashboard-card">
    <h3 className="dashboard-title">High Risk Areas</h3>
    <div className="divide-y divide-gray-200">
      {zones.length === 0 ? (
        <p className="py-2 text-gray-500">No high risk areas detected</p>
      ) : (
        zones.map((zone) => (
          <div key={zone.id} className="py-2">
            <div className="flex justify-between">
              <p className="font-medium">{zone.region_name}</p>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-danger-100 text-danger-800">
                {(zone.risk_level * 100).toFixed(0)}% Risk
              </span>
            </div>
            <div className="flex text-xs text-gray-500 mt-1">
              <p className="mr-3">Temp: {zone.temperature?.toFixed(1)}°C</p>
              <p className="mr-3">Humidity: {zone.humidity?.toFixed(0)}%</p>
              <p>Wind: {zone.wind_speed?.toFixed(1)} km/h</p>
            </div>
          </div>
        ))
      )}
    </div>
    <div className="mt-4">
      <Link to="/map" className="text-primary-600 hover:text-primary-800 text-sm font-medium">
        View on map
      </Link>
    </div>
  </div>
);

// Component for recent fire incidents
const RecentIncidents = ({ incidents }) => (
  <div className="dashboard-card">
    <h3 className="dashboard-title">Recent Fire Incidents</h3>
    <div className="divide-y divide-gray-200">
      {incidents.length === 0 ? (
        <p className="py-2 text-gray-500">No recent fire incidents</p>
      ) : (
        incidents.map((incident) => (
          <div key={incident.id} className="py-2">
            <div className="flex justify-between">
              <p className="font-medium">
                {`Fire near ${incident.latitude.toFixed(2)}, ${incident.longitude.toFixed(2)}`}
              </p>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                incident.status === 'Active' 
                  ? 'bg-danger-100 text-danger-800' 
                  : incident.status === 'Contained' 
                    ? 'bg-warning-100 text-warning-800' 
                    : 'bg-success-100 text-success-800'
              }`}>
                {incident.status}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              {`Started: ${new Date(incident.start_date).toLocaleDateString()} | Severity: ${incident.severity}`}
            </p>
          </div>
        ))
      )}
    </div>
    <div className="mt-4">
      <Link to="/historical" className="text-primary-600 hover:text-primary-800 text-sm font-medium">
        View historical data
      </Link>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    highRiskZones: 0,
    activeIncidents: 0,
    unreadAlerts: 0,
    savedRegions: 0,
  });
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [highRiskZones, setHighRiskZones] = useState([]);
  const [recentIncidents, setRecentIncidents] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch risk zones
        const riskResponse = await getFireRiskZones({ 
          min_risk_level: 0.7,  // High risk only
          limit: 5 
        });
        setHighRiskZones(riskResponse.data);
        
        // Fetch incidents
        const incidentResponse = await getFireIncidents({
          limit: 5,
          status: 'Active'
        });
        setRecentIncidents(incidentResponse.data);
        
        // Fetch alerts
        const alertResponse = await getAlerts({ limit: 5 });
        setRecentAlerts(alertResponse.data);
        
        // Calculate stats
        setStats({
          highRiskZones: riskResponse.data.length,
          activeIncidents: incidentResponse.data.length,
          unreadAlerts: alertResponse.data.filter(alert => !alert.is_read).length,
          savedRegions: 0, // This would come from a different endpoint in a real app
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  if (error) {
    return (
      <div className="bg-danger-100 border border-danger-400 text-danger-700 px-4 py-3 rounded relative">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.username || 'User'}!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="High Risk Zones" 
          value={stats.highRiskZones} 
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
          </svg>}
          color="danger"
        />
        <StatCard 
          title="Active Incidents" 
          value={stats.activeIncidents} 
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>}
          color="warning"
        />
        <StatCard 
          title="Unread Alerts" 
          value={stats.unreadAlerts} 
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>}
          color="primary"
        />
        <StatCard 
          title="Saved Regions" 
          value={stats.savedRegions} 
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>}
          color="success"
        />
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <HighRiskAreas zones={highRiskZones} />
        <RecentIncidents incidents={recentIncidents} />
        <RecentAlerts alerts={recentAlerts} />
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Link to="/map" className="flex items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-primary-400 transition-colors">
            <div className="p-3 rounded-full bg-primary-100 text-primary-600 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium">View Fire Risk Map</h3>
              <p className="text-sm text-gray-500">Check current risk levels</p>
            </div>
          </Link>
          <Link to="/alerts" className="flex items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-primary-400 transition-colors">
            <div className="p-3 rounded-full bg-primary-100 text-primary-600 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium">Check Alerts</h3>
              <p className="text-sm text-gray-500">View and manage your alerts</p>
            </div>
          </Link>
          <Link to="/profile" className="flex items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-primary-400 transition-colors">
            <div className="p-3 rounded-full bg-primary-100 text-primary-600 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium">Manage Settings</h3>
              <p className="text-sm text-gray-500">Customize your preferences</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 