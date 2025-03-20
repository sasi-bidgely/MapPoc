import React, { useState } from 'react';
import MapBoxMap from './maps/MapBoxMap';
import MapLibreMap from './maps/MapLibreMap';
import GoogleMap from './maps/GoogleMap';
import HereMap from './maps/HereMap';
import MapComparisonTable from './MapComparisonTable';
import MapBoxEvAdoption from './maps/MapBoxEvAdoption';
import './MapComparison.css';

const MapComparison: React.FC = () => {
  const [activeMap, setActiveMap] = useState<string>('mapbox');

  const renderMap = () => {
    switch (activeMap) {
      case 'mapbox':
        return <MapBoxMap />;
      case 'maplibre':
        return <MapLibreMap />;
      case 'google':
        return <GoogleMap />;
      case 'here':
        return <HereMap />;
      default:
        return <MapBoxMap />;
    }
  };

  return (
    <div className="map-comparison">
      <h1>Map Services Comparison</h1>
      
      <div className="map-selector">
        <button 
          className={activeMap === 'mapbox' ? 'active' : ''} 
          onClick={() => setActiveMap('mapbox')}
        >
          MapBox
        </button>
        <button 
          className={activeMap === 'maplibre' ? 'active' : ''} 
          onClick={() => setActiveMap('maplibre')}
        >
          MapLibre
        </button>
        <button 
          className={activeMap === 'google' ? 'active' : ''} 
          onClick={() => setActiveMap('google')}
        >
          Google Maps
        </button>
        <button 
          className={activeMap === 'here' ? 'active' : ''} 
          onClick={() => setActiveMap('here')}
        >
          HERE Maps
        </button>
      </div>

      <div className="map-display">
        {renderMap()}
      </div>

      <MapComparisonTable />

      <MapBoxEvAdoption />
    </div>
  );
};

export default MapComparison; 