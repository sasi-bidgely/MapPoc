import React, { useEffect, useRef, useState } from 'react';
import { citiesGeoJSON, routesGeoJSON, airportsGeoJSON, airportRoutesGeoJSON } from '../../data/sampleGeoJSON';

// Replace with your HERE Maps API key
const HERE_API_KEY = 'ELELf2LA3DWZAZ5mGoyhOOJFdMNNeq78NoIAEHLy2Bo';

declare global {
  interface Window {
    H: {
      Map: any;
      service: {
        Platform: any;
      };
      mapevents: {
        Behavior: any;
        MapEvents: any;
      };
      ui: {
        UI: {
          createDefault: any;
        };
      };
      geo: {
        LineString: any;
      };
      map: {
        Polyline: any;
        Marker: any;
        DomMarker: any;
      };
    };
  }
}

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

const HereMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<Window['H']['Map'] | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const [isFiltered, setIsFiltered] = useState(false);
  const [coordinates, setCoordinates] = useState<string>('');
  const [showInfoBar, setShowInfoBar] = useState(false);
  const [infoBarContent, setInfoBarContent] = useState<FeatureProperties | null>(null);
  const [layerVisibility, setLayerVisibility] = useState<LayerControl[]>([
    { id: 'cities', name: 'Cities', visible: true },
    { id: 'airports', name: 'Airports', visible: true },
    { id: 'routes', name: 'Routes', visible: true },
    { id: 'airport-routes', name: 'Airport Routes', visible: true }
  ]);

  const toggleLayer = (layerId: string) => {
    if (!map) return;
    
    const layer = layerVisibility.find(l => l.id === layerId);
    if (!layer) return;

    const newVisibility = !layer.visible;
    const objects = map.getObjects();
    objects.forEach((obj: any) => {
      if (obj.layerId === layerId) {
        obj.setVisibility(newVisibility);
      }
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

  useEffect(() => {
    let isMounted = true;
    let mapInstance: Window['H']['Map'] | null = null;

    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = false; // Set to false to ensure sequential loading
        script.onload = () => resolve();
        script.onerror = (error) => reject(error);
        document.head.appendChild(script);
      });
    };

    const initializeMap = async () => {
      try {
        if (!mapContainer.current) return;

        // Load scripts sequentially
        await loadScript('https://js.api.here.com/v3/3.1/mapsjs-core.js');
        await loadScript('https://js.api.here.com/v3/3.1/mapsjs-service.js');

        // Wait a small delay to ensure H object is fully initialized
        await new Promise(resolve => setTimeout(resolve, 500));

        if (!window.H || !window.H.Map || !window.H.service || !window.H.service.Platform) {
          console.error('HERE Maps API not properly initialized');
          return;
        }

        const platform = new window.H.service.Platform({
          apikey: HERE_API_KEY
        });

        const defaultLayers = platform.createDefaultLayers();
        mapInstance = new window.H.Map(
          mapContainer.current,
          defaultLayers.vector.normal.map,
          {
            zoom: 7,
            center: { lat: 40, lng: -74.5 }
          }
        );

        // Enable map interaction behaviors
        const behavior = new window.H.mapevents.Behavior(new window.H.mapevents.MapEvents(mapInstance));
        const ui = window.H.ui.UI.createDefault(mapInstance, defaultLayers);

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
        mapInstance.addEventListener('pointermove', (evt: any) => {
          const lat = evt.latLng.lat.toFixed(6);
          const lng = evt.latLng.lng.toFixed(6);
          setCoordinates(`Lat: ${lat}, Lng: ${lng}`);
          coordinateDiv.textContent = `Lat: ${lat}, Lng: ${lng}`;
        });

        // Add intercity routes (lines)
        routesGeoJSON.features.forEach((route, index) => {
          const lineString = new window.H.geo.LineString(
            route.geometry.coordinates.map(coord => ({ lat: coord[1], lng: coord[0] }))
          );
          const polyline = new window.H.map.Polyline(lineString, {
            style: { strokeColor: '#FF0000', lineWidth: 3 },
            layerId: 'routes'
          });
          mapInstance.addObject(polyline);

          // Add click listener for route info
          polyline.addEventListener('tap', () => {
            setSelectedFeature(route);
            setInfoBarContent(route.properties);
            setShowInfoBar(true);
          });
        });

        // Add airport-to-city routes (lines)
        airportRoutesGeoJSON.features.forEach((route, index) => {
          const lineString = new window.H.geo.LineString(
            route.geometry.coordinates.map(coord => ({ lat: coord[1], lng: coord[0] }))
          );
          const polyline = new window.H.map.Polyline(lineString, {
            style: { strokeColor: '#0000FF', lineWidth: 2, strokeDasharray: [5, 5] },
            layerId: 'airport-routes'
          });
          mapInstance.addObject(polyline);

          // Add click listener for route info
          polyline.addEventListener('tap', () => {
            setSelectedFeature(route);
            setInfoBarContent(route.properties);
            setShowInfoBar(true);
          });
        });

        // Add cities
        citiesGeoJSON.features.forEach((city, index) => {
          const marker = new window.H.map.Marker({
            lat: city.geometry.coordinates[1],
            lng: city.geometry.coordinates[0],
            layerId: 'cities'
          });
          mapInstance.addObject(marker);

          // Add city label
          const label = new window.H.map.DomMarker({
            lat: city.geometry.coordinates[1],
            lng: city.geometry.coordinates[0],
            domElement: document.createElement('div'),
            layerId: 'cities'
          });
          label.domElement.className = 'city-label';
          label.domElement.textContent = city.properties.name;
          mapInstance.addObject(label);

          // Add click listener for city info
          marker.addEventListener('tap', () => {
            setSelectedFeature(city);
            setInfoBarContent(city.properties);
            setShowInfoBar(true);
          });
        });

        // Add airports
        airportsGeoJSON.features.forEach((airport, index) => {
          const marker = new window.H.map.Marker({
            lat: airport.geometry.coordinates[1],
            lng: airport.geometry.coordinates[0],
            layerId: 'airports'
          });
          mapInstance.addObject(marker);

          // Add airport code label
          const label = new window.H.map.DomMarker({
            lat: airport.geometry.coordinates[1],
            lng: airport.geometry.coordinates[0],
            domElement: document.createElement('div'),
            layerId: 'airports'
          });
          label.domElement.className = 'airport-label';
          label.domElement.textContent = airport.properties.code;
          mapInstance.addObject(label);

          // Add click listener for airport info
          marker.addEventListener('tap', () => {
            setSelectedFeature(airport);
            setInfoBarContent(airport.properties);
            setShowInfoBar(true);
          });
        });

        // Add keyboard event listener
        window.addEventListener('keydown', handleKeyDown);

        if (isMounted) {
          setMap(mapInstance);
        }
      } catch (error) {
        console.error('Error initializing HERE Maps:', error);
      }
    };

    initializeMap();

    return () => {
      isMounted = false;
      if (mapInstance) {
        mapInstance.dispose();
      }
      window.removeEventListener('keydown', handleKeyDown);
      // Clean up DOM elements
      const coordinateDiv = mapContainer.current?.querySelector('.coordinate-display');
      if (coordinateDiv) coordinateDiv.remove();
    };
  }, []);

  // Keyboard navigation handler
  const handleKeyDown = (event: KeyboardEvent) => {
    if (!map) return;

    const moveAmount = 0.1; // Adjust this value to control movement speed
    const center = map.getCenter();
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
        map.setZoom(map.getZoom() + 1);
        return;
      case 'PageDown':
        map.setZoom(map.getZoom() - 1);
        return;
      default:
        return;
    }

    map.setCenter({ lat: newLat, lng: newLng });
  };

  return (
    <div className="map-container">
      <h3>HERE Maps</h3>
      <div ref={mapContainer} style={{ width: '100%', height: '400px', position: 'relative' }}>
        {renderLayerControl()}
        {renderInfoBar()}
      </div>
    </div>
  );
};

export default HereMap; 