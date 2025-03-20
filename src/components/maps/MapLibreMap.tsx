import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { citiesGeoJSON, routesGeoJSON, airportsGeoJSON, airportRoutesGeoJSON } from '../../data/sampleGeoJSON';
import { FeatureCollection, Point, LineString } from 'geojson';
import { StyleSpecification } from 'maplibre-gl';

const MAPTILER_API_KEY = '6Ncq5CHosYP9vPaj9rbQ';

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

const MapLibreMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const [isFiltered, setIsFiltered] = useState(false);
  const [coordinates, setCoordinates] = useState<string>('');
  const [showInfoBar, setShowInfoBar] = useState(false);
  const [infoBarContent, setInfoBarContent] = useState<FeatureProperties | null>(null);
  const popup = useRef<maplibregl.Popup | null>(null);
  const [layerVisibility, setLayerVisibility] = useState<LayerControl[]>([
    { id: 'cities-points', name: 'Cities', visible: true },
    { id: 'cities-labels', name: 'City Labels', visible: true },
    { id: 'airports-points', name: 'Airports', visible: true },
    { id: 'airports-labels', name: 'Airport Labels', visible: true },
    { id: 'routes-lines', name: 'Routes', visible: true },
    { id: 'airport-routes-lines', name: 'Airport Routes', visible: true }
  ]);

  const filterMap = (cityName: string) => {
    if (!map.current) return;

    // Filter cities to show only the selected city
    map.current.setFilter('cities-points', ['==', ['get', 'name'], cityName]);
    map.current.setFilter('cities-labels', ['==', ['get', 'name'], cityName]);

    // Filter airports to show only those connected to the selected city
    map.current.setFilter('airports-points', [
      'any',
      ['==', ['get', 'city'], cityName],
      ['==', ['get', 'city'], cityName]
    ]);
    map.current.setFilter('airports-labels', [
      'any',
      ['==', ['get', 'city'], cityName],
      ['==', ['get', 'city'], cityName]
    ]);

    // Filter routes to show only those connected to the selected city
    map.current.setFilter('routes-lines', [
      'any',
      ['==', ['get', 'from'], cityName],
      ['==', ['get', 'to'], cityName]
    ]);

    // Filter airport routes to show only those connected to the selected city
    map.current.setFilter('airport-routes-lines', [
      'any',
      ['==', ['get', 'city'], cityName],
      ['==', ['get', 'city'], cityName]
    ]);

    setIsFiltered(true);
  };

  const resetFilters = () => {
    if (!map.current) return;

    // Reset all filters
    map.current.setFilter('cities-points', null);
    map.current.setFilter('cities-labels', null);
    map.current.setFilter('airports-points', null);
    map.current.setFilter('airports-labels', null);
    map.current.setFilter('routes-lines', null);
    map.current.setFilter('airport-routes-lines', null);

    setIsFiltered(false);
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

  const toggleLayer = (layerId: string) => {
    if (!map.current) return;
    
    const layer = layerVisibility.find(l => l.id === layerId);
    if (!layer) return;

    const newVisibility = !layer.visible;
    map.current.setLayoutProperty(layerId, 'visibility', newVisibility ? 'visible' : 'none');
    
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
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/streets/style.json?key=${MAPTILER_API_KEY}`,
      center: [-74.5, 40],
      zoom: 7,
      keyboard: false, // Disable default keyboard controls to use our custom ones
      doubleClickZoom: true,
      dragRotate: true,
      touchZoomRotate: true
    });

    // Create popup
    popup.current = new maplibregl.Popup({
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
      { text: 'Zoom In', action: () => map.current?.zoomIn() },
      { text: 'Zoom Out', action: () => map.current?.zoomOut() },
      { text: 'Reset View', action: () => map.current?.setCenter([-74.5, 40]) && map.current?.setZoom(7) }
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

    map.current.on('contextmenu', (event) => {
      event.preventDefault();
      contextMenu.style.display = 'block';
      contextMenu.style.left = `${event.point.x}px`;
      contextMenu.style.top = `${event.point.y}px`;
    });

    // Close context menu on left click
    map.current.on('click', () => {
      contextMenu.style.display = 'none';
    });

    // Add style switcher control
    const styleSwitcher = document.createElement('div');
    styleSwitcher.className = 'maplibregl-ctrl maplibregl-ctrl-group';
    styleSwitcher.style.backgroundColor = 'white';
    styleSwitcher.style.padding = '10px';
    styleSwitcher.style.borderRadius = '4px';
    styleSwitcher.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';

    const select = document.createElement('select');
    select.style.padding = '5px';
    select.style.borderRadius = '4px';
    select.style.border = '1px solid #ccc';
    select.style.backgroundColor = 'white';
    select.style.cursor = 'pointer';

    const styles = [
      { name: 'Streets', url: `https://api.maptiler.com/maps/streets/style.json?key=${MAPTILER_API_KEY}` },
      { name: 'Satellite', url: `https://api.maptiler.com/maps/satellite/style.json?key=${MAPTILER_API_KEY}` },
      { name: 'Terrain', url: `https://api.maptiler.com/maps/terrain/style.json?key=${MAPTILER_API_KEY}` },
      { name: 'Light', url: `https://api.maptiler.com/maps/streets-light/style.json?key=${MAPTILER_API_KEY}` },
      { name: 'Dark', url: `https://api.maptiler.com/maps/streets-dark/style.json?key=${MAPTILER_API_KEY}` }
    ];

    styles.forEach(style => {
      const option = document.createElement('option');
      option.value = style.url;
      option.textContent = style.name;
      select.appendChild(option);
    });

    select.addEventListener('change', (e) => {
      const target = e.target as HTMLSelectElement;
      if (!map.current) return;

      // Set the new style
      map.current.setStyle(target.value);
    });

    // Add the select to the style switcher
    styleSwitcher.appendChild(select);

    // Add the style switcher to the map
    map.current.addControl({
      onAdd: () => styleSwitcher,
      onRemove: () => {
        styleSwitcher.parentNode?.removeChild(styleSwitcher);
      }
    }, 'top-right');

    // Add style change event listener
    map.current.on('style.load', () => {
      if (!map.current) return;

      // Re-add sources
      map.current.addSource('cities', {
        type: 'geojson',
        data: citiesGeoJSON as FeatureCollection<Point>
      });

      map.current.addSource('routes', {
        type: 'geojson',
        data: routesGeoJSON as FeatureCollection<LineString>
      });

      map.current.addSource('airports', {
        type: 'geojson',
        data: airportsGeoJSON as FeatureCollection<Point>
      });

      map.current.addSource('airport-routes', {
        type: 'geojson',
        data: airportRoutesGeoJSON as FeatureCollection<LineString>
      });

      // Re-add layers
      map.current.addLayer({
        id: 'routes-lines',
        type: 'line',
        source: 'routes',
        paint: {
          'line-color': '#FF0000',
          'line-width': 3,
          'line-opacity': 0.8
        }
      });

      map.current.addLayer({
        id: 'cities-points',
        type: 'circle',
        source: 'cities',
        paint: {
          'circle-radius': 8,
          'circle-color': '#00FF00',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#FFFFFF'
        }
      });

      map.current.addLayer({
        id: 'airports-points',
        type: 'circle',
        source: 'airports',
        minzoom: 8,
        paint: {
          'circle-radius': 6,
          'circle-color': '#0000FF',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#FFFFFF'
        }
      });

      map.current.addLayer({
        id: 'cities-labels',
        type: 'symbol',
        source: 'cities',
        layout: {
          'text-field': ['get', 'name'],
          'text-size': 12,
          'text-offset': [0, 1.5]
        },
        paint: {
          'text-color': '#000000'
        }
      });

      map.current.addLayer({
        id: 'airports-labels',
        type: 'symbol',
        source: 'airports',
        minzoom: 8,
        layout: {
          'text-field': ['get', 'code'],
          'text-size': 10,
          'text-offset': [0, 1.5]
        },
        paint: {
          'text-color': '#0000FF'
        }
      });

      map.current.addLayer({
        id: 'airport-routes-lines',
        type: 'line',
        source: 'airport-routes',
        minzoom: 8,
        paint: {
          'line-color': '#0000FF',
          'line-width': 2,
          'line-opacity': 0.6,
          'line-dasharray': [2, 2]
        }
      });

      // Re-apply filters if they were active
      if (isFiltered && selectedFeature?.properties?.name) {
        filterMap(selectedFeature.properties.name);
      }
    });

    map.current.on('load', () => {
      if (!map.current) return;

      // Add click handlers
      map.current.on('click', (e) => {
        if (!map.current || !popup.current) return;

        const features = map.current.queryRenderedFeatures(e.point, {
          layers: ['cities-points', 'airports-points', 'routes-lines', 'airport-routes-lines']
        });

        if (features.length > 0) {
          const feature = features[0];
          setSelectedFeature(feature);
          setInfoBarContent(feature.properties as FeatureProperties);
          setShowInfoBar(true);

          // Create popup content
          const popupContent = `
            <div class="maplibre-popup">
              <h3>${feature.properties?.name || 'Unknown'}</h3>
              ${feature.properties?.population ? `<p>Population: ${feature.properties.population.toLocaleString()}</p>` : ''}
              ${feature.properties?.code ? `<p>Code: ${feature.properties.code}</p>` : ''}
              ${feature.properties?.distance ? `<p>Distance: ${feature.properties.distance} miles</p>` : ''}
              <p>${feature.properties?.description || ''}</p>
              ${feature.layer?.id === 'cities-points' ? `
                <button id="filter-button" data-action="filter" data-city="${feature.properties?.name}" style="
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
              ` : ''}
            </div>
          `;

          // Update popup
          popup.current
            .setLngLat(e.lngLat)
            .setHTML(popupContent)
            .addTo(map.current);

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
        }
      });

      // Change cursor to pointer when hovering over features
      map.current.on('mouseenter', (e) => {
        const features = map.current?.queryRenderedFeatures(e.point, {
          layers: ['cities-points', 'airports-points', 'routes-lines', 'airport-routes-lines']
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
    });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      // Clean up DOM elements
      const coordinateDiv = mapContainer.current?.querySelector('.coordinate-display');
      const contextMenu = mapContainer.current?.querySelector('.context-menu');
      if (coordinateDiv) coordinateDiv.remove();
      if (contextMenu) contextMenu.remove();
    };
  }, [isFiltered]);

  return (
    <div className="map-container">
      <h3>MapLibre</h3>
      <div ref={mapContainer} style={{ width: '100%', height: '400px', position: 'relative' }}>
        {renderLayerControl()}
        {renderInfoBar()}
      </div>
    </div>
  );
};

export default MapLibreMap; 