import React, { useState, useEffect } from 'react';
import { getFireIncidents } from '../services/api';
import { format } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const HistoricalData = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    severity: '',
    startDateFrom: '',
    startDateTo: '',
  });
  
  // Chart data
  const [severityData, setSeverityData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  
  const SEVERITY_COLORS = {
    'High': '#ef4444',
    'Medium': '#f59e0b',
    'Low': '#22c55e'
  };
  
  const STATUS_COLORS = {
    'Active': '#ef4444',
    'Contained': '#f59e0b',
    'Extinguished': '#22c55e'
  };
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  useEffect(() => {
    fetchIncidents();
  }, []);
  
  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.severity) params.severity = filters.severity;
      if (filters.startDateFrom) params.start_date_from = filters.startDateFrom;
      if (filters.startDateTo) params.start_date_to = filters.startDateTo;
      
      const response = await getFireIncidents(params);
      setIncidents(response.data);
      
      // Process data for charts
      processChartData(response.data);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      setError('Failed to load historical data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const processChartData = (data) => {
    // Process severity data
    const severityCounts = {
      'High': 0,
      'Medium': 0,
      'Low': 0
    };
    
    // Process status data
    const statusCounts = {
      'Active': 0,
      'Contained': 0,
      'Extinguished': 0
    };
    
    // Process monthly data
    const monthCounts = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    data.forEach(incident => {
      // Count severities
      if (incident.severity in severityCounts) {
        severityCounts[incident.severity]++;
      }
      
      // Count statuses
      if (incident.status in statusCounts) {
        statusCounts[incident.status]++;
      }
      
      // Count by month
      const date = new Date(incident.start_date);
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      const key = `${month} ${year}`;
      
      if (!monthCounts[key]) {
        monthCounts[key] = {
          month: key,
          count: 0,
          'High': 0,
          'Medium': 0,
          'Low': 0
        };
      }
      
      monthCounts[key].count++;
      monthCounts[key][incident.severity]++;
    });
    
    // Convert to chart format
    const severityDataArray = Object.keys(severityCounts).map(key => ({
      name: key,
      value: severityCounts[key],
      color: SEVERITY_COLORS[key]
    }));
    
    const statusDataArray = Object.keys(statusCounts).map(key => ({
      name: key,
      value: statusCounts[key],
      color: STATUS_COLORS[key]
    }));
    
    // Sort monthly data by date
    const monthlyDataArray = Object.values(monthCounts).sort((a, b) => {
      const [aMonth, aYear] = a.month.split(' ');
      const [bMonth, bYear] = b.month.split(' ');
      
      if (aYear !== bYear) return parseInt(aYear) - parseInt(bYear);
      return months.indexOf(aMonth) - months.indexOf(bMonth);
    });
    
    setSeverityData(severityDataArray);
    setStatusData(statusDataArray);
    setMonthlyData(monthlyDataArray);
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };
  
  const handleApplyFilters = (e) => {
    e.preventDefault();
    fetchIncidents();
  };
  
  const handleResetFilters = () => {
    setFilters({
      status: '',
      severity: '',
      startDateFrom: '',
      startDateTo: '',
    });
    
    // Fetch without filters
    fetchIncidents();
  };
  
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Historical Fire Data</h1>
        <p className="text-gray-600">Analyze past fire incidents and identify patterns</p>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Filter Incidents</h2>
        
        <form onSubmit={handleApplyFilters} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring focus:ring-primary-200"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Contained">Contained</option>
              <option value="Extinguished">Extinguished</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="severity" className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
            <select
              id="severity"
              name="severity"
              value={filters.severity}
              onChange={handleFilterChange}
              className="w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring focus:ring-primary-200"
            >
              <option value="">All Severities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="startDateFrom" className="block text-sm font-medium text-gray-700 mb-1">Start Date (From)</label>
            <input
              type="date"
              id="startDateFrom"
              name="startDateFrom"
              value={filters.startDateFrom}
              onChange={handleFilterChange}
              className="w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring focus:ring-primary-200"
            />
          </div>
          
          <div>
            <label htmlFor="startDateTo" className="block text-sm font-medium text-gray-700 mb-1">Start Date (To)</label>
            <input
              type="date"
              id="startDateTo"
              name="startDateTo"
              value={filters.startDateTo}
              onChange={handleFilterChange}
              className="w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring focus:ring-primary-200"
            />
          </div>
          
          <div className="flex space-x-2 col-span-1 md:col-span-2 lg:col-span-4">
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              Apply Filters
            </button>
            
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Reset
            </button>
          </div>
        </form>
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
          <p className="mt-2 text-gray-600">Loading historical data...</p>
        </div>
      ) : (
        <>
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Incident by Severity Chart */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold mb-4">Incidents by Severity</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={severityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} incidents`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Incident by Status Chart */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold mb-4">Incidents by Status</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} incidents`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* Monthly Trend Chart */}
          {monthlyData.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <h2 className="text-lg font-semibold mb-4">Monthly Incident Trends</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="High" stackId="a" fill={SEVERITY_COLORS.High} />
                    <Bar dataKey="Medium" stackId="a" fill={SEVERITY_COLORS.Medium} />
                    <Bar dataKey="Low" stackId="a" fill={SEVERITY_COLORS.Low} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          
          {/* Incidents Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <h2 className="text-lg font-semibold p-4 border-b">Fire Incidents ({incidents.length})</h2>
            
            <div className="overflow-x-auto">
              {incidents.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500">No incidents found matching your criteria.</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Start Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Severity
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Area Affected
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Source
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {incidents.map((incident) => (
                      <tr key={incident.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(incident.start_date)}</div>
                          {incident.end_date && (
                            <div className="text-xs text-gray-500">
                              End: {formatDate(incident.end_date)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${incident.status === 'Active' ? 'bg-danger-100 text-danger-800' : 
                            incident.status === 'Contained' ? 'bg-warning-100 text-warning-800' : 
                            'bg-success-100 text-success-800'}`}
                          >
                            {incident.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${incident.severity === 'High' ? 'bg-danger-100 text-danger-800' : 
                            incident.severity === 'Medium' ? 'bg-warning-100 text-warning-800' : 
                            'bg-success-100 text-success-800'}`}
                          >
                            {incident.severity}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {incident.area_affected ? `${incident.area_affected.toFixed(2)} km²` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {incident.source}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HistoricalData; 