import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { cityEvAdoption } from '../../data/cityEvAdoption';
import { FeatureCollection, Point } from 'geojson';

// Replace with your MapBox access token
const MAPBOX_TOKEN = 'pk.eyJ1Ijoic2FzaXBvdGh1cmkiLCJhIjoiY204ZnNydm85MGl6dzJpczV0Z2w4MWd2dyJ9.OJwmXYqjGn8pv9UoBIUOuw';

// Set the access token
mapboxgl.accessToken = MAPBOX_TOKEN;

interface CityProperties {
  name: string;
  population: number;
  month: number;
  adoptionRate: number;
}

const MapBoxEvAdoption: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [coordinates, setCoordinates] = useState<string>('');
  const [showInfoBar, setShowInfoBar] = useState(false);
  const [infoBarContent, setInfoBarContent] = useState<CityProperties | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const popup = useRef<mapboxgl.Popup | null>(null);

  // Animation function
  const animate = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setSelectedMonth(prev => {
        const next = prev === 12 ? 1 : prev + 1;
        return next;
      });
    }, 500); // 2 second delay between month changes
  };

  // Start/Stop animation
  const toggleAnimation = () => {
    if (isPlaying) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      animate();
    }
  };

  // Get current month's adoption rate
  const getCurrentAdoptionRate = (features: any[], cityName: string) => {
    const cityFeature = features.find(f => f.properties.name === cityName && f.properties.month === selectedMonth);
    return cityFeature?.properties.adoptionRate || 0;
  };

  // Get all months data for a city
  const getCityMonthlyData = (features: any[], cityName: string) => {
    return features.filter(f => f.properties.name === cityName)
      .sort((a, b) => a.properties.month - b.properties.month);
  };

  // Keyboard navigation handler
  const handleKeyDown = (event: KeyboardEvent) => {
    if (!map.current) return;

    const moveAmount = 0.1; // Adjust this value to control movement speed
    const center = map.current.getCenter();
    let newLat = center.lat;
    let newLng = center.lng;

    switch (event.key) {
      case 'ArrowUp':
        newLat += moveAmount;
        break;
      case 'ArrowDown':
        newLat -= moveAmount;
        break;
      case 'ArrowLeft':
        newLng -= moveAmount;
        break;
      case 'ArrowRight':
        newLng += moveAmount;
        break;
      case 'PageUp':
        map.current.zoomIn();
        return;
      case 'PageDown':
        map.current.zoomOut();
        return;
      default:
        return;
    }

    map.current.setCenter([newLng, newLat]);
  };

  const renderInfoBar = () => {
    if (!showInfoBar || !infoBarContent) return null;

    const monthlyData = getCityMonthlyData(cityEvAdoption.features, infoBarContent.name);

    return (
      <div className="info-bar" style={{
        position: 'absolute',
        right: 0,
        top: 0,
        width: '300px',
        height: '100%',
        background: 'white',
        boxShadow: '-2px 0 5px rgba(0,0,0,0.1)',
        padding: '20px',
        overflowY: 'auto',
        zIndex: 1000
      }}>
        <button 
          onClick={() => setShowInfoBar(false)}
          style={{
            position: 'absolute',
            right: '10px',
            top: '10px',
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer'
          }}
        >
          ×
        </button>
        <h3>City Details</h3>
        <div style={{ marginTop: '20px' }}>
          <div style={{ marginBottom: '10px' }}>
            <strong>Name:</strong> {infoBarContent.name}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Population:</strong> {infoBarContent.population.toLocaleString()}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Current EV Adoption Rate:</strong> {infoBarContent.adoptionRate.toFixed(1)}%
          </div>
          <div style={{ marginTop: '20px' }}>
            <h4>Monthly EV Adoption Rates</h4>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {monthlyData.map((data) => (
                <div key={data.properties.month} style={{ 
                  marginBottom: '5px',
                  padding: '5px',
                  backgroundColor: data.properties.month === selectedMonth ? '#e3f2fd' : 'transparent'
                }}>
                  <strong>{new Date(2000, data.properties.month - 1).toLocaleString('default', { month: 'long' })}:</strong> {data.properties.adoptionRate.toFixed(1)}%
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTimeSlider = () => {
    return (
      <div style={{
        position: 'absolute',
        bottom: '40px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'white',
        padding: '15px',
        borderRadius: '4px',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
      }}>
        <button 
          onClick={toggleAnimation}
          style={{
            padding: '5px 10px',
            background: isPlaying ? '#ff4444' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <input
          type="range"
          min="1"
          max="12"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          style={{ width: '200px' }}
        />
        <span style={{ minWidth: '100px' }}>
          {new Date(2000, selectedMonth - 1).toLocaleString('default', { month: 'long' })}
        </span>
      </div>
    );
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-95.7129, 37.0902], // Center of US
      zoom: 4,
      keyboard: false,
      doubleClickZoom: true,
      dragRotate: true,
      touchZoomRotate: true
    });

    // Create popup
    popup.current = new mapboxgl.Popup({
      closeButton: true,
      closeOnClick: false
    });

    // Add keyboard event listener
    window.addEventListener('keydown', handleKeyDown);

    // Add coordinate display
    const coordinateDiv = document.createElement('div');
    coordinateDiv.className = 'coordinate-display';
    coordinateDiv.style.cssText = `
      position: absolute;
      bottom: 10px;
      left: 10px;
      background: rgba(255, 255, 255, 0.8);
      padding: 5px 10px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 12px;
      z-index: 1000;
    `;
    mapContainer.current.appendChild(coordinateDiv);

    // Update coordinates on mouse move
    map.current.on('mousemove', (event) => {
      const lng = event.lngLat.lng.toFixed(6);
      const lat = event.lngLat.lat.toFixed(6);
      setCoordinates(`Lat: ${lat}, Lng: ${lng}`);
      coordinateDiv.textContent = `Lat: ${lat}, Lng: ${lng}`;
    });

    // Add style change event listener
    map.current.on('style.load', () => {
      if (!map.current) return;

      try {
        // Add source with initial EV adoption data
        map.current.addSource('cities', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: cityEvAdoption.features.filter(
              feature => feature.properties.month === selectedMonth
            )
          }
        });

        // Add layers with EV adoption coloring
        map.current.addLayer({
          id: 'cities-points',
          type: 'circle',
          source: 'cities',
          paint: {
            'circle-radius': ['get', 'adoptionRate'],
            'circle-color': [
              'interpolate',
              ['linear'],
              ['get', 'adoptionRate'],
              0, '#FF0000',
              30, '#FFFF00',
              60, '#00FF00'
            ],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#FFFFFF'
          }
        });

        map.current.addLayer({
          id: 'cities-labels',
          type: 'symbol',
          source: 'cities',
          layout: {
            'text-field': [
              'concat',
              ['get', 'name'],
              '\n',
              ['to-string', ['number', ['get', 'adoptionRate'], 1]],
              '% EV'
            ],
            'text-size': 12,
            'text-offset': [0, 1.5]
          },
          paint: {
            'text-color': '#000000'
          }
        });

        // Add click handlers
        map.current.on('click', (e) => {
          if (!map.current || !popup.current) return;

          const features = map.current.queryRenderedFeatures(e.point, {
            layers: ['cities-points']
          });

          if (features.length > 0) {
            const feature = features[0];
            if (!feature.properties) return;

            try {
              const properties = feature.properties as CityProperties;
              setInfoBarContent(properties);
              setShowInfoBar(true);

              // Create popup content
              const popupContent = `
                <div class="mapbox-popup">
                  <h3>${properties.name}</h3>
                  <p>Population: ${properties.population.toLocaleString()}</p>
                  <p>Current EV Adoption Rate: ${properties.adoptionRate.toFixed(1)}%</p>
                </div>
              `;

              // Update popup
              popup.current
                .setLngLat(e.lngLat)
                .setHTML(popupContent)
                .addTo(map.current);
            } catch (error) {
              console.error('Error processing feature properties:', error);
            }
          }
        });

        // Change cursor to pointer when hovering over features
        map.current.on('mouseenter', (e) => {
          const features = map.current?.queryRenderedFeatures(e.point, {
            layers: ['cities-points']
          });

          if (features && features.length > 0) {
            if (map.current) {
              map.current.getCanvas().style.cursor = 'pointer';
            }
          }
        });

        map.current.on('mouseleave', () => {
          if (map.current) {
            map.current.getCanvas().style.cursor = '';
          }
        });

        console.log('Cities data and layers added successfully');
      } catch (error) {
        console.error('Error adding cities data:', error);
      }
    });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // Clean up DOM elements
      const coordinateDiv = mapContainer.current?.querySelector('.coordinate-display');
      if (coordinateDiv) coordinateDiv.remove();
    };
  }, []); // Remove selectedMonth from dependencies

  // Add a separate effect to update the data source when month changes
  useEffect(() => {
    if (!map.current) return;

    try {
      // Filter features for current month
      const currentMonthFeatures = cityEvAdoption.features.filter(
        feature => feature.properties.month === selectedMonth
      );

      // Update the data source without re-rendering the map
      const source = map.current.getSource('cities') as mapboxgl.GeoJSONSource;
      if (source) {
        source.setData({
          type: 'FeatureCollection',
          features: currentMonthFeatures
        });
      }
    } catch (error) {
      console.error('Error updating data source:', error);
    }
  }, [selectedMonth]); // This effect only runs when selectedMonth changes

  return (
    <div className="map-container">
      <h3>MapBox EV Adoption</h3>
      <div ref={mapContainer} style={{ width: '100%', height: '400px', position: 'relative' }}>
        {renderTimeSlider()}
        {renderInfoBar()}
      </div>
    </div>
  );
};

export default MapBoxEvAdoption; 