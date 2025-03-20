import React from 'react';
import './MapComparisonTable.css';

const MapComparisonTable: React.FC = () => {
  const features = [
    {
      feature: 'Basic Map Display',
      hereMaps: '✓',
      mapbox: '✓',
      maplibre: '✓',
      googleMaps: '✓'
    },
    {
      feature: 'Custom Styling',
      hereMaps: '✓',
      mapbox: '✓',
      maplibre: '✓',
      googleMaps: 'Limited'
    },
    {
      feature: 'Offline Support',
      hereMaps: '✓',
      mapbox: 'Limited',
      maplibre: '✓',
      googleMaps: 'Limited'
    },
    {
      feature: '3D Buildings',
      hereMaps: '✓',
      mapbox: '✓',
      maplibre: 'Limited',
      googleMaps: '✓'
    },
    {
      feature: 'Custom Markers',
      hereMaps: '✓',
      mapbox: '✓',
      maplibre: '✓',
      googleMaps: '✓'
    },
    {
      feature: 'Geocoding',
      hereMaps: '✓',
      mapbox: '✓',
      maplibre: 'Limited',
      googleMaps: '✓'
    },
    {
      feature: 'Routing',
      hereMaps: '✓',
      mapbox: '✓',
      maplibre: 'Limited',
      googleMaps: '✓'
    }
  ];

  return (
    <div className="map-comparison-container">
      <h2>Map Services Comparison</h2>
      <table className="map-comparison-table">
        <thead>
          <tr>
            <th>Feature</th>
            <th>HERE Maps</th>
            <th>MapBox</th>
            <th>MapLibre</th>
            <th>Google Maps</th>
          </tr>
        </thead>
        <tbody>
          {features.map((row, index) => (
            <tr key={index}>
              <td>{row.feature}</td>
              <td>{row.hereMaps}</td>
              <td>{row.mapbox}</td>
              <td>{row.maplibre}</td>
              <td>{row.googleMaps}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MapComparisonTable; 