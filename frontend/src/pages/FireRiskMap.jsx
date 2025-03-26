import React, { useState } from 'react';
import MapComponent from '../components/map/FireRiskMap';

const FireRiskMapPage = () => {
  const [selectedRegion, setSelectedRegion] = useState(null);
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Fire Risk Map</h1>
          <p className="text-gray-600">View and predict fire risks in different regions</p>
        </div>
        
        {selectedRegion && (
          <div className="bg-white p-3 rounded-md shadow-sm border border-gray-200">
            <h3 className="font-semibold">{selectedRegion.name}</h3>
            <p className="text-sm text-gray-600">
              Risk Level: <span className={selectedRegion.riskLevel > 0.7 ? 'text-danger-600' : selectedRegion.riskLevel > 0.4 ? 'text-warning-600' : 'text-success-600'}>
                {selectedRegion.riskLevel > 0.7 ? 'High' : selectedRegion.riskLevel > 0.4 ? 'Medium' : 'Low'}
              </span>
            </p>
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-4 flex-1">
        <div className="rounded-md overflow-hidden h-full border border-gray-200">
          <MapComponent onSelectRegion={setSelectedRegion} />
        </div>
      </div>
    </div>
  );
};

export default FireRiskMapPage; 