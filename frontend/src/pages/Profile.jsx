import React, { useState, useEffect, useContext } from 'react';
import { getCurrentUser, updateAlert } from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
  const { user: authUser, login } = useContext(AuthContext);
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    region_name: '',
    latitude: '',
    longitude: '',
    alert_threshold: 0.7,
    email_alerts: true,
    sms_alerts: false,
    phone_number: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  useEffect(() => {
    fetchUserProfile();
  }, []);
  
  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const response = await getCurrentUser();
      const userData = response.data;
      
      setUser(userData);
      
      // Update form data with user data
      setFormData({
        username: userData.username || '',
        email: userData.email || '',
        region_name: userData.region_name || '',
        latitude: userData.latitude || '',
        longitude: userData.longitude || '',
        alert_threshold: userData.alert_threshold || 0.7,
        email_alerts: userData.email_alerts || true,
        sms_alerts: userData.sms_alerts || false,
        phone_number: userData.phone_number || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to load your profile. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleAlertThresholdChange = (e) => {
    const value = parseFloat(e.target.value);
    setFormData({
      ...formData,
      alert_threshold: value
    });
  };
  
  const handlePersonalInfoSubmit = async (e) => {
    e.preventDefault();
    
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      // Format data for API
      const userData = {
        username: formData.username,
        region_name: formData.region_name,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      };
      
      // Call API to update user
      const response = await updateAlert(user.id, userData);
      
      // Update local state
      setUser({ ...user, ...userData });
      
      // Update auth context if needed
      login({ ...authUser, ...userData }, localStorage.getItem('token'));
      
      setSuccess('Personal information updated successfully.');
    } catch (error) {
      console.error('Error updating personal information:', error);
      setError('Failed to update personal information. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAlertPreferencesSubmit = async (e) => {
    e.preventDefault();
    
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      // Format data for API
      const userData = {
        alert_threshold: formData.alert_threshold,
        email_alerts: formData.email_alerts,
        sms_alerts: formData.sms_alerts,
        phone_number: formData.phone_number,
      };
      
      // Call API to update user
      const response = await updateAlert(user.id, userData);
      
      // Update local state
      setUser({ ...user, ...userData });
      
      setSuccess('Alert preferences updated successfully.');
    } catch (error) {
      console.error('Error updating alert preferences:', error);
      setError('Failed to update alert preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    setError('');
    setSuccess('');
    
    // Simple validation
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    
    setLoading(true);
    
    try {
      // Format data for API
      const userData = {
        current_password: formData.currentPassword,
        password: formData.newPassword,
      };
      
      // Call API to update password
      const response = await updateAlert(user.id, userData);
      
      // Clear password fields
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      setSuccess('Password updated successfully.');
    } catch (error) {
      console.error('Error updating password:', error);
      
      if (error.response && error.response.status === 400) {
        setError('Current password is incorrect.');
      } else {
        setError('Failed to update password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && !user) {
    return (
      <div className="text-center py-10">
        <svg className="animate-spin h-10 w-10 text-primary-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-2 text-gray-600">Loading your profile...</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Your Profile</h1>
        <p className="text-gray-600">Manage your account information and preferences</p>
      </div>
      
      {error && (
        <div className="bg-danger-100 border border-danger-400 text-danger-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {success && (
        <div className="bg-success-100 border border-success-400 text-success-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{success}</span>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button className="px-6 py-4 text-primary-600 border-b-2 border-primary-500 font-medium text-sm">
              Account Settings
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          {/* Personal Information Form */}
          <div className="mb-10">
            <h2 className="text-lg font-medium text-gray-900 mb-5">Personal Information</h2>
            
            <form onSubmit={handlePersonalInfoSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring focus:ring-primary-200"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="w-full rounded-md border-gray-300 bg-gray-100 cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                </div>
                
                <div>
                  <label htmlFor="region_name" className="block text-sm font-medium text-gray-700 mb-1">Region Name</label>
                  <input
                    type="text"
                    id="region_name"
                    name="region_name"
                    value={formData.region_name}
                    onChange={handleChange}
                    placeholder="e.g. Northern California"
                    className="w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring focus:ring-primary-200"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                    <input
                      type="text"
                      id="latitude"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleChange}
                      placeholder="e.g. 37.7749"
                      className="w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring focus:ring-primary-200"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                    <input
                      type="text"
                      id="longitude"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleChange}
                      placeholder="e.g. -122.4194"
                      className="w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring focus:ring-primary-200"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
          
          {/* Alert Preferences Form */}
          <div className="mb-10">
            <h2 className="text-lg font-medium text-gray-900 mb-5">Alert Preferences</h2>
            
            <form onSubmit={handleAlertPreferencesSubmit}>
              <div className="mb-6">
                <label htmlFor="alert_threshold" className="block text-sm font-medium text-gray-700 mb-1">
                  Alert Threshold: {formData.alert_threshold.toFixed(1)} (Low: 0.0 - High: 1.0)
                </label>
                <input
                  type="range"
                  id="alert_threshold"
                  name="alert_threshold"
                  min="0"
                  max="1"
                  step="0.1"
                  value={formData.alert_threshold}
                  onChange={handleAlertThresholdChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Receive all alerts (0.0)</span>
                  <span>Only high risk alerts (1.0)</span>
                </div>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="email_alerts"
                    name="email_alerts"
                    checked={formData.email_alerts}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="email_alerts" className="ml-2 block text-sm text-gray-700">
                    Receive alerts via email
                  </label>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      id="sms_alerts"
                      name="sms_alerts"
                      checked={formData.sms_alerts}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-2 text-sm">
                    <label htmlFor="sms_alerts" className="font-medium text-gray-700">Receive alerts via SMS</label>
                    <p className="text-gray-500">Standard message rates may apply</p>
                  </div>
                </div>
                
                {formData.sms_alerts && (
                  <div className="ml-6">
                    <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      id="phone_number"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      placeholder="e.g. +1 (555) 555-5555"
                      className="w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring focus:ring-primary-200"
                    />
                  </div>
                )}
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </form>
          </div>
          
          {/* Change Password Form */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-5">Change Password</h2>
            
            <form onSubmit={handlePasswordSubmit}>
              <div className="space-y-4 mb-6">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className="w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring focus:ring-primary-200"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring focus:ring-primary-200"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring focus:ring-primary-200"
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 