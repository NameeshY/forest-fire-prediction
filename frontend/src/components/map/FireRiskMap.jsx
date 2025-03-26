import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { getFireRiskZones, predictFireRisk, predictFireSpread } from '../../services/api';

// Define custom markers for different risk levels
const riskMarkerIcon = (riskLevel) => {
  const color = riskLevel > 0.7 ? '#ef4444' : riskLevel > 0.4 ? '#facc15' : '#4ade80';
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

// Component to recenter map when location changes
const SetViewOnClick = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.setView(coords, 10);
    }
  }, [coords, map]);
  return null;
};

const FireRiskMap = () => {
  const [riskZones, setRiskZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [spreadPoints, setSpreadPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mapCenter, setMapCenter] = useState([37.7749, -122.4194]); // Default center (San Francisco)
  const [clickLocation, setClickLocation] = useState(null);
  const mapRef = useRef(null);

  // Fetch initial fire risk zones
  useEffect(() => {
    const fetchRiskZones = async () => {
      setLoading(true);
      try {
        const response = await getFireRiskZones();
        setRiskZones(response.data);
        
        // If we have risk zones, center the map on the first one
        if (response.data.length > 0) {
          const firstZone = response.data[0];
          setMapCenter([firstZone.latitude, firstZone.longitude]);
        }
      } catch (error) {
        console.error('Error fetching fire risk zones:', error);
        setError('Failed to load fire risk data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRiskZones();
  }, []);

  // Predict fire risk for a clicked location
  const handleMapClick = async (e) => {
    const { lat, lng } = e.latlng;
    setClickLocation([lat, lng]);
    
    try {
      setLoading(true);
      const response = await predictFireRisk(lat, lng);
      
      // Add the new prediction to the risk zones
      setRiskZones(prevZones => {
        // Check if zone already exists to avoid duplicates
        const exists = prevZones.some(zone => 
          Math.abs(zone.latitude - response.data.latitude) < 0.01 && 
          Math.abs(zone.longitude - response.data.longitude) < 0.01
        );
        
        if (exists) return prevZones;
        return [response.data, ...prevZones];
      });
      
      // Select the new zone
      setSelectedZone(response.data);
      
      // Clear any existing spread points
      setSpreadPoints([]);
    } catch (error) {
      console.error('Error predicting fire risk:', error);
      setError('Failed to predict fire risk. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Predict fire spread when a zone is selected
  const handlePredictSpread = async (zoneId) => {
    if (!zoneId) return;
    
    try {
      setLoading(true);
      const response = await predictFireSpread(zoneId);
      setSpreadPoints(response.data.spread_points || []);
    } catch (error) {
      console.error('Error predicting fire spread:', error);
      setError('Failed to predict fire spread. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Get risk category based on numerical risk level
  const getRiskCategory = (riskLevel) => {
    if (riskLevel > 0.7) return 'High';
    if (riskLevel > 0.4) return 'Medium';
    return 'Low';
  };

  // Get color based on risk level
  const getRiskColor = (riskLevel) => {
    if (riskLevel > 0.7) return '#ef4444';
    if (riskLevel > 0.4) return '#facc15';
    return '#4ade80';
  };

  return (
    <div className="h-full flex flex-col">
      {loading && (
        <div className="absolute top-0 left-0 right-0 z-10 bg-primary-600 text-white text-center py-1">
          Loading...
        </div>
      )}
      
      {error && (
        <div className="absolute top-0 left-0 right-0 z-10 bg-danger-600 text-white text-center py-1">
          {error}
        </div>
      )}
      
      <div className="flex-1 relative">
        <MapContainer
          center={mapCenter}
          zoom={10}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
          onClick={handleMapClick}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {riskZones.map((zone) => (
            <Marker
              key={zone.id || `${zone.latitude}-${zone.longitude}`}
              position={[zone.latitude, zone.longitude]}
              icon={riskMarkerIcon(zone.risk_level)}
              eventHandlers={{
                click: () => {
                  setSelectedZone(zone);
                  setSpreadPoints([]);
                },
              }}
            >
              <Popup>
                <div>
                  <h3 className="font-semibold">{zone.region_name}</h3>
                  <p>
                    Risk Level: <span className="font-semibold" style={{ color: getRiskColor(zone.risk_level) }}>
                      {getRiskCategory(zone.risk_level)} ({(zone.risk_level * 100).toFixed(1)}%)
                    </span>
                  </p>
                  {zone.temperature && (
                    <p>Temperature: {zone.temperature.toFixed(1)}°C</p>
                  )}
                  {zone.humidity && (
                    <p>Humidity: {zone.humidity.toFixed(1)}%</p>
                  )}
                  {zone.wind_speed && (
                    <p>Wind Speed: {zone.wind_speed.toFixed(1)} km/h</p>
                  )}
                  <button
                    className="mt-2 px-3 py-1 bg-primary-600 text-white rounded-md text-sm"
                    onClick={() => handlePredictSpread(zone.id)}
                  >
                    Predict Spread
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
          
          {/* Display fire spread prediction points */}
          {spreadPoints.map((point, index) => (
            <CircleMarker
              key={`spread-${index}`}
              center={[point.latitude, point.longitude]}
              radius={5}
              pathOptions={{
                fillColor: getRiskColor(point.risk_level),
                fillOpacity: 0.5,
                color: 'white',
                weight: 1,
              }}
            >
              <Popup>
                <div>
                  <p>Predicted spread point</p>
                  <p>Time: {new Date(point.timestamp).toLocaleString()}</p>
                  <p>Risk Level: {(point.risk_level * 100).toFixed(1)}%</p>
                </div>
              </Popup>
            </CircleMarker>
          ))}
          
          {/* Circle for clicked location */}
          {clickLocation && (
            <CircleMarker
              center={clickLocation}
              radius={10}
              pathOptions={{
                color: 'blue',
                fillColor: 'blue',
                fillOpacity: 0.3,
              }}
            />
          )}
          
          {/* Auto-center the map when location changes */}
          <SetViewOnClick coords={mapCenter} />
        </MapContainer>
      </div>
      
      {/* Legend */}
      <div className="bg-white p-2 border-t border-gray-200">
        <div className="flex items-center justify-center space-x-4">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-success-500 mr-1"></div>
            <span className="text-xs">Low Risk</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-warning-500 mr-1"></div>
            <span className="text-xs">Medium Risk</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-danger-500 mr-1"></div>
            <span className="text-xs">High Risk</span>
          </div>
          <div className="text-xs text-gray-500">Click on map to predict fire risk</div>
        </div>
      </div>
    </div>
  );
};

export default FireRiskMap; 