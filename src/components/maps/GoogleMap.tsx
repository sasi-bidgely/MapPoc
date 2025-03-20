import React, { useEffect, useRef, useState } from 'react';
import { citiesGeoJSON, routesGeoJSON, airportsGeoJSON, airportRoutesGeoJSON } from '../../data/sampleGeoJSON';
import { FeatureCollection, Point, LineString } from 'geojson';

const GOOGLE_MAPS_API_KEY = 'AIzaSyCfx50SQGxPADqwYRNF2c8wyBD19F_nwZY';

interface FeatureProperties {
  name?: string;
  population?: number;
  code?: string;
  distance?: number;
  description?: string;
  city?: string;
  from?: string;
  to?: string;
}

interface LayerControl {
  id: string;
  name: string;
  visible: boolean;
}

const GoogleMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const [isFiltered, setIsFiltered] = useState(false);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const [coordinates, setCoordinates] = useState<string>('');
  const [showInfoBar, setShowInfoBar] = useState(false);
  const [infoBarContent, setInfoBarContent] = useState<FeatureProperties | null>(null);
  const [layerVisibility, setLayerVisibility] = useState<LayerControl[]>([
    { id: 'cities', name: 'Cities', visible: true },
    { id: 'airports', name: 'Airports', visible: true },
    { id: 'routes', name: 'Routes', visible: true },
    { id: 'airport-routes', name: 'Airport Routes', visible: true }
  ]);

  const filterMap = (cityName: string) => {
    if (!map.current) return;

    // Filter cities to show only the selected city
    map.current.data.setStyle((feature: google.maps.Data.Feature) => {
      const properties = feature.getProperty('properties') as FeatureProperties;
      if (feature.getProperty('type') === 'city') {
        return {
          visible: properties.name === cityName
        };
      }
      if (feature.getProperty('type') === 'airport') {
        return {
          visible: properties.city === cityName
        };
      }
      if (feature.getProperty('type') === 'route') {
        return {
          visible: properties.from === cityName || properties.to === cityName
        };
      }
      if (feature.getProperty('type') === 'airport-route') {
        return {
          visible: properties.city === cityName
        };
      }
      return { visible: true };
    });

    setIsFiltered(true);
  };

  const resetFilters = () => {
    if (!map.current) return;

    // Reset all filters
    map.current.data.setStyle(() => ({ visible: true }));

    setIsFiltered(false);
  };

  // Keyboard navigation handler
  const handleKeyDown = (event: KeyboardEvent) => {
    if (!map.current) return;

    const moveAmount = 0.1; // Adjust this value to control movement speed
    const currentCenter = map.current.getCenter();
    if (!currentCenter) return;

    let newLat = currentCenter.lat();
    let newLng = currentCenter.lng();

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
        map.current.setZoom((map.current.getZoom() || 0) + 1);
        return;
      case 'PageDown':
        map.current.setZoom((map.current.getZoom() || 0) - 1);
        return;
      default:
        return;
    }

    map.current.setCenter({ lat: newLat, lng: newLng });
  };

  useEffect(() => {
    // Load Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsGoogleMapsLoaded(true);
    };
    document.head.appendChild(script);

    // Add keyboard event listener
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.head.removeChild(script);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !isGoogleMapsLoaded) return;

    // Initialize map
    map.current = new google.maps.Map(mapContainer.current, {
      center: { lat: 40, lng: -74.5 },
      zoom: 7,
      mapTypeId: 'roadmap',
      gestureHandling: 'greedy', // Enable smooth panning and zooming
      zoomControl: true,
      mapTypeControl: true,
      scaleControl: true,
      streetViewControl: true,
      rotateControl: true,
      fullscreenControl: true
    });

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
    map.current.addListener('mousemove', (event: google.maps.MapMouseEvent) => {
      if (!event.latLng) return;
      const lat = event.latLng.lat().toFixed(6);
      const lng = event.latLng.lng().toFixed(6);
      setCoordinates(`Lat: ${lat}, Lng: ${lng}`);
      coordinateDiv.textContent = `Lat: ${lat}, Lng: ${lng}`;
    });

    // Double click zoom
    map.current.addListener('dblclick', (event: google.maps.MapMouseEvent) => {
      if (!map.current) return;
      const currentZoom = map.current.getZoom() || 0;
      map.current.setZoom(currentZoom + 1);
    });

    // Right click context menu
    const contextMenu = document.createElement('div');
    contextMenu.className = 'context-menu';
    contextMenu.style.cssText = `
      position: absolute;
      background: white;
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 5px 0;
      display: none;
      z-index: 1000;
    `;
    mapContainer.current.appendChild(contextMenu);

    const menuItems = [
      { text: 'Zoom In', action: () => map.current?.setZoom((map.current.getZoom() || 0) + 1) },
      { text: 'Zoom Out', action: () => map.current?.setZoom((map.current.getZoom() || 0) - 1) },
      { text: 'Reset View', action: () => map.current?.setCenter({ lat: 40, lng: -74.5 }) && map.current?.setZoom(7) }
    ];

    menuItems.forEach(item => {
      const div = document.createElement('div');
      div.textContent = item.text;
      div.style.cssText = `
        padding: 5px 15px;
        cursor: pointer;
      `;
      div.onclick = () => {
        item.action();
        contextMenu.style.display = 'none';
      };
      contextMenu.appendChild(div);
    });

    map.current.addListener('rightclick', (event: google.maps.MapMouseEvent) => {
      if (!event.domEvent) return;
      const domEvent = event.domEvent as MouseEvent;
      contextMenu.style.display = 'block';
      contextMenu.style.left = `${domEvent.clientX}px`;
      contextMenu.style.top = `${domEvent.clientY}px`;
    });

    // Close context menu on left click
    map.current.addListener('click', () => {
      contextMenu.style.display = 'none';
    });

    // Add GeoJSON data
    map.current.data.addGeoJson(citiesGeoJSON as FeatureCollection<Point>);
    map.current.data.addGeoJson(routesGeoJSON as FeatureCollection<LineString>);
    map.current.data.addGeoJson(airportsGeoJSON as FeatureCollection<Point>);
    map.current.data.addGeoJson(airportRoutesGeoJSON as FeatureCollection<LineString>);

    // Style the features
    map.current.data.setStyle((feature: google.maps.Data.Feature) => {
      const type = feature.getProperty('type');
      switch (type) {
        case 'city':
          return {
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#00FF00',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 2
            }
          };
        case 'airport':
          return {
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 6,
              fillColor: '#0000FF',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 2
            }
          };
        case 'route':
          return {
            strokeColor: '#FF0000',
            strokeWeight: 3,
            strokeOpacity: 0.8
          };
        case 'airport-route':
          return {
            strokeColor: '#0000FF',
            strokeWeight: 2,
            strokeOpacity: 0.6,
            icons: [{
              icon: {
                path: 'M 0,-1 0,1',
                strokeOpacity: 0.6,
                scale: 2
              },
              offset: '0',
              repeat: '10px'
            }]
          };
        default:
          return {};
      }
    });

    // Add click handler
    map.current.data.addListener('click', (event: google.maps.Data.MouseEvent) => {
      const feature = event.feature;
      if (!feature) return;

      setSelectedFeature(feature);
      const properties = feature.getProperty('properties') as FeatureProperties;
      setInfoBarContent(properties);
      setShowInfoBar(true);

      // Create info window content
      const type = feature.getProperty('type');
      let content = '<div class="google-popup">';
      
      // Safely access properties with null checks
      const name = properties?.name || 'Unknown';
      content += `<h3>${name}</h3>`;
      
      if (properties?.population) {
        content += `<p>Population: ${properties.population.toLocaleString()}</p>`;
      }
      if (properties?.code) {
        content += `<p>Code: ${properties.code}</p>`;
      }
      if (properties?.distance) {
        content += `<p>Distance: ${properties.distance} miles</p>`;
      }
      if (properties?.description) {
        content += `<p>${properties.description}</p>`;
      }
      
      // Only add filter button for cities and if we have a name
      if (type === 'city' && name !== 'Unknown') {
        content += `
          <button id="filter-button" data-action="filter" data-city="${name}" style="
            background-color: ${isFiltered ? '#ff4444' : '#4CAF50'};
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 8px;
          ">
            ${isFiltered ? 'Reset Filter' : 'Filter Map'}
          </button>
        `;
      }
      content += '</div>';

      // Create and show info window
      const infoWindow = new google.maps.InfoWindow({
        content: content
      });

      infoWindow.setPosition(event.latLng);
      infoWindow.open(map.current);

      // Add event listener for the filter button
      const filterButton = document.getElementById('filter-button');
      if (filterButton) {
        const handleFilterClick = () => {
          const cityName = filterButton.getAttribute('data-city');
          if (isFiltered) {
            resetFilters();
          } else if (cityName) {
            filterMap(cityName);
          }
        };

        // Remove any existing listeners
        filterButton.removeEventListener('click', handleFilterClick);
        // Add new listener
        filterButton.addEventListener('click', handleFilterClick);
      }
    });

    // Add hover effects
    map.current.data.addListener('mouseover', (event: google.maps.Data.MouseEvent) => {
      if (map.current) {
        map.current.getDiv().style.cursor = 'pointer';
      }
    });

    map.current.data.addListener('mouseout', () => {
      if (map.current) {
        map.current.getDiv().style.cursor = '';
      }
    });

    return () => {
      if (map.current) {
        google.maps.event.clearInstanceListeners(map.current);
        map.current = null;
      }
      // Clean up DOM elements
      const coordinateDiv = mapContainer.current?.querySelector('.coordinate-display');
      const contextMenu = mapContainer.current?.querySelector('.context-menu');
      if (coordinateDiv) coordinateDiv.remove();
      if (contextMenu) contextMenu.remove();
    };
  }, [isGoogleMapsLoaded, isFiltered]);

  const renderInfoBar = () => {
    if (!showInfoBar || !infoBarContent) return null;

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
        <h3>Feature Details</h3>
        <div style={{ marginTop: '20px' }}>
          {Object.entries(infoBarContent).map(([key, value]) => (
            <div key={key} style={{ marginBottom: '10px' }}>
              <strong>{key}:</strong> {value?.toString() || 'N/A'}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const toggleLayer = (layerId: string) => {
    if (!map.current) return;
    
    const layer = layerVisibility.find(l => l.id === layerId);
    if (!layer) return;

    const newVisibility = !layer.visible;
    map.current.data.setStyle((feature: google.maps.Data.Feature) => {
      if (feature.getProperty('type') === layerId) {
        return { visible: newVisibility };
      }
      return { visible: true };
    });
    
    setLayerVisibility(prev => 
      prev.map(l => l.id === layerId ? { ...l, visible: newVisibility } : l)
    );
  };

  const renderLayerControl = () => {
    return (
      <div className="layer-control" style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        background: 'white',
        padding: '10px',
        borderRadius: '4px',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        zIndex: 1000
      }}>
        <h4 style={{ margin: '0 0 10px 0' }}>Layers</h4>
        {layerVisibility.map(layer => (
          <div key={layer.id} style={{ marginBottom: '5px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={layer.visible}
                onChange={() => toggleLayer(layer.id)}
                style={{ marginRight: '5px' }}
              />
              {layer.name}
            </label>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="map-container">
      <h3>Google Maps</h3>
      <div ref={mapContainer} style={{ width: '100%', height: '400px', position: 'relative' }}>
        {renderLayerControl()}
        {renderInfoBar()}
      </div>
    </div>
  );
};

export default GoogleMap; 