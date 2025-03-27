import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import * as turf from '@turf/turf';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { citiesGeoJSON, routesGeoJSON, airportsGeoJSON, airportRoutesGeoJSON } from '../../data/sampleGeoJSON';
import { FeatureCollection, Point, LineString, Polygon, Feature, MultiPolygon } from 'geojson';

// Replace with your MapBox access token
const MAPBOX_TOKEN = 'pk.eyJ1Ijoic2FzaXBvdGh1cmkiLCJhIjoiY204ZnNydm85MGl6dzJpczV0Z2w4MWd2dyJ9.OJwmXYqjGn8pv9UoBIUOuw';

// Set the access token
mapboxgl.accessToken = MAPBOX_TOKEN;

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

interface RouteProperties extends FeatureProperties {
  from: string;
  to: string;
}

interface LayerControl {
  id: string;
  name: string;
  visible: boolean;
}

const MapBoxMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const draw = useRef<MapboxDraw | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const [isFiltered, setIsFiltered] = useState(false);
  const [coordinates, setCoordinates] = useState<string>('');
  const [showInfoBar, setShowInfoBar] = useState(false);
  const [infoBarContent, setInfoBarContent] = useState<FeatureProperties | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnFeatures, setDrawnFeatures] = useState<Feature[]>([]);
  const popup = useRef<mapboxgl.Popup | null>(null);
  const [layerVisibility, setLayerVisibility] = useState<LayerControl[]>([
    { id: 'clusters', name: 'City Clusters', visible: true },
    { id: 'cluster-count', name: 'Cluster Counts', visible: true },
    { id: 'unclustered-point', name: 'Cities', visible: true },
    { id: 'cities-labels', name: 'City Labels', visible: true },
    { id: 'cities-airport-counts', name: 'Airport Counts', visible: true },
    { id: 'airports-points', name: 'Airports', visible: true },
    { id: 'airports-labels', name: 'Airport Labels', visible: true },
    { id: 'routes-lines', name: 'Routes', visible: true },
    { id: 'airport-routes-lines', name: 'Airport Routes', visible: true },
    { id: 'airport-routes-arrows', name: 'Route Arrows', visible: true }
  ]);
  const [isRegionFiltered, setIsRegionFiltered] = useState(false);

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

  const filterFeaturesInDrawnRegions = () => {
    if (!map.current || drawnFeatures.length === 0) return;

    // Get the bounds of all drawn regions
    const bounds = drawnFeatures.reduce((acc, feature) => {
      const coordinates = (feature as Feature<Polygon>).geometry.coordinates[0];
      const featureBounds = new mapboxgl.LngLatBounds();
      coordinates.forEach(coord => {
        featureBounds.extend([coord[0], coord[1]]);
      });
      if (!acc) return featureBounds;
      return acc.extend(featureBounds);
    }, null as mapboxgl.LngLatBounds | null);

    if (!bounds) return;

    // Filter cities
    const citiesInRegion = citiesGeoJSON.features.filter(feature => {
      const point = feature.geometry as Point;
      return bounds.contains([point.coordinates[0], point.coordinates[1]]);
    });
    const cityNames = citiesInRegion.map(f => f.properties?.name).filter(Boolean);
    map.current.setFilter('cities-points', ['in', ['get', 'name'], ['literal', cityNames]]);
    map.current.setFilter('cities-labels', ['in', ['get', 'name'], ['literal', cityNames]]);

    // Filter airports
    const airportsInRegion = airportsGeoJSON.features.filter(feature => {
      const point = feature.geometry as Point;
      return bounds.contains([point.coordinates[0], point.coordinates[1]]);
    });
    const airportCodes = airportsInRegion.map(f => f.properties?.code).filter(Boolean);
    map.current.setFilter('airports-points', ['in', ['get', 'code'], ['literal', airportCodes]]);
    map.current.setFilter('airports-labels', ['in', ['get', 'code'], ['literal', airportCodes]]);

    // Filter routes that start or end in the region
    const routesInRegion = routesGeoJSON.features.filter(feature => {
      const routeProps = feature.properties as RouteProperties;
      const fromCity = citiesInRegion.find(c => c.properties?.name === routeProps.from);
      const toCity = citiesInRegion.find(c => c.properties?.name === routeProps.to);
      return fromCity || toCity;
    });
    const routeFromCities = routesInRegion.map(f => (f.properties as RouteProperties).from).filter(Boolean);
    map.current.setFilter('routes-lines', ['in', ['get', 'from'], ['literal', routeFromCities]]);

    // Filter airport routes
    const airportRoutesInRegion = airportRoutesGeoJSON.features.filter(feature => 
      airportsInRegion.some(a => a.properties?.code === feature.properties?.city)
    );
    const airportRouteCities = airportRoutesInRegion.map(f => f.properties?.city).filter(Boolean);
    map.current.setFilter('airport-routes-lines', ['in', ['get', 'city'], ['literal', airportRouteCities]]);

    setIsRegionFiltered(true);
  };

  const resetRegionFilters = () => {
    if (!map.current) return;

    map.current.setFilter('cities-points', null);
    map.current.setFilter('cities-labels', null);
    map.current.setFilter('airports-points', null);
    map.current.setFilter('airports-labels', null);
    map.current.setFilter('routes-lines', null);
    map.current.setFilter('airport-routes-lines', null);

    setIsRegionFiltered(false);
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
        <div style={{ marginTop: '10px', borderTop: '1px solid #ccc', paddingTop: '10px' }}>
          <button
            onClick={() => {
              if (!draw.current) return;
              if (isDrawing) {
                draw.current.changeMode('simple_select');
              } else {
                draw.current.changeMode('draw_polygon');
              }
              setIsDrawing(!isDrawing);
            }}
            style={{
              padding: '5px 10px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              background: isDrawing ? '#ff4444' : '#4CAF50',
              color: 'white',
              cursor: 'pointer',
              width: '100%',
              marginBottom: '10px'
            }}
          >
            {isDrawing ? 'Stop Drawing' : 'Draw Region'}
          </button>
          {drawnFeatures.length > 0 && (
            <div style={{ marginTop: '10px' }}>
              <h4 style={{ margin: '0 0 5px 0' }}>Drawn Regions</h4>
              {drawnFeatures.map((feature, index) => (
                <div key={index} style={{ 
                  marginBottom: '5px',
                  padding: '5px',
                  background: '#f5f5f5',
                  borderRadius: '4px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>Region {index + 1}</span>
                  <button
                    onClick={() => {
                      if (draw.current) {
                        const features = draw.current.getAll();
                        const feature = features?.features[index];
                        if (feature && typeof feature.id === 'string') {
                          draw.current.delete(feature.id);
                        }
                      }
                    }}
                    style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      border: '1px solid #ff4444',
                      background: '#ff4444',
                      color: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
              <button
                onClick={isRegionFiltered ? resetRegionFilters : filterFeaturesInDrawnRegions}
                style={{
                  padding: '5px 10px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  background: isRegionFiltered ? '#ff4444' : '#4CAF50',
                  color: 'white',
                  cursor: 'pointer',
                  width: '100%',
                  marginTop: '10px'
                }}
              >
                {isRegionFiltered ? 'Reset Region Filter' : 'Filter Inside Regions'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-74.5, 40],
      zoom: 7,
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
    styleSwitcher.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
    styleSwitcher.style.backgroundColor = 'white';
    styleSwitcher.style.padding = '10px';
    styleSwitcher.style.borderRadius = '4px';
    styleSwitcher.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';

    const styles = [
      { name: 'Streets', value: 'mapbox://styles/mapbox/streets-v11' },
      { name: 'Satellite', value: 'mapbox://styles/mapbox/satellite-v9' },
      { name: 'Terrain', value: 'mapbox://styles/mapbox/outdoors-v11' },
      { name: 'Light', value: 'mapbox://styles/mapbox/light-v11' },
      { name: 'Dark', value: 'mapbox://styles/mapbox/dark-v11' }
    ];

    const select = document.createElement('select');
    select.style.padding = '5px';
    select.style.borderRadius = '4px';
    select.style.border = '1px solid #ccc';
    select.style.backgroundColor = 'white';
    select.style.cursor = 'pointer';

    styles.forEach(style => {
      const option = document.createElement('option');
      option.value = style.value;
      option.text = style.name;
      select.appendChild(option);
    });

    select.addEventListener('change', (e) => {
      const target = e.target as HTMLSelectElement;
      if (map.current) {
        map.current.setStyle(target.value);
      }
    });

    styleSwitcher.appendChild(select);

    // Add the style switcher to the map
    map.current.addControl({
      onAdd: () => styleSwitcher,
      onRemove: () => {
        styleSwitcher.parentNode?.removeChild(styleSwitcher);
      }
    }, 'top-right');

    // Initialize draw control
    draw.current = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true
      },
      defaultMode: 'draw_polygon',
      styles: [
        {
          'id': 'gl-draw-polygon-fill-inactive',
          'type': 'fill',
          'filter': ['all', ['==', 'active', 'false'],
            ['==', '$type', 'Polygon'],
            ['!=', 'mode', 'static']
          ],
          'paint': {
            'fill-color': '#3bb2d0',
            'fill-outline-color': '#3bb2d0',
            'fill-opacity': 0.1
          }
        },
        {
          'id': 'gl-draw-polygon-fill-active',
          'type': 'fill',
          'filter': ['all', ['==', 'active', 'true'],
            ['==', '$type', 'Polygon']
          ],
          'paint': {
            'fill-color': '#fbb03b',
            'fill-outline-color': '#fbb03b',
            'fill-opacity': 0.1
          }
        },
        {
          'id': 'gl-draw-polygon-stroke-inactive',
          'type': 'line',
          'filter': ['all', ['==', 'active', 'false'],
            ['==', '$type', 'Polygon'],
            ['!=', 'mode', 'static']
          ],
          'layout': {},
          'paint': {
            'line-color': '#3bb2d0',
            'line-width': 2
          }
        },
        {
          'id': 'gl-draw-polygon-stroke-active',
          'type': 'line',
          'filter': ['all', ['==', 'active', 'true'],
            ['==', '$type', 'Polygon']
          ],
          'layout': {},
          'paint': {
            'line-color': '#fbb03b',
            'line-dasharray': [0.2, 2],
            'line-width': 2
          }
        }
      ]
    });

    map.current.addControl(draw.current);

    // Handle draw events
    map.current.on('draw.create', (e) => {
      const features = draw.current?.getAll();
      if (features) {
        console.log('Drawn features:', features);
        setDrawnFeatures(features.features);
      }
    });

    map.current.on('draw.update', (e) => {
      const features = draw.current?.getAll();
      if (features) {
        console.log('Updated features:', features);
        setDrawnFeatures(features.features);
      }
    });

    map.current.on('draw.delete', (e) => {
      const features = draw.current?.getAll();
      if (features) {
        console.log('Remaining features:', features);
        setDrawnFeatures(features.features);
      }
    });

    // Add style change event listener
    map.current.on('style.load', () => {
      if (!map.current) return;

      // Re-add sources
      map.current.addSource('cities', {
        type: 'geojson',
        data: citiesGeoJSON as FeatureCollection<Point>,
        cluster: true,
        clusterMaxZoom: 6,
        clusterRadius: 50
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
        id: 'clusters',
        type: 'circle',
        source: 'cities',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#51bbd6',
            100,
            '#f1f075',
            750,
            '#f28cb1'
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20,
            100,
            30,
            750,
            40
          ],
          'circle-opacity': 0.8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
          'circle-stroke-opacity': 0.5
        }
      });

      map.current.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'cities',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12
        },
        paint: {
          'text-color': '#ffffff'
        }
      });

      map.current.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'cities',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#00FF00',
          'circle-radius': 8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#FFFFFF'
        }
      });

      map.current.addLayer({
        id: 'cities-labels',
        type: 'symbol',
        source: 'cities',
        filter: ['!', ['has', 'point_count']],
        minzoom: 6,
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
        id: 'airports-points',
        type: 'circle',
        source: 'airports',
        minzoom: 6, // Show when zoomed in
        paint: {
          'circle-radius': 6,
          'circle-color': '#0000FF',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#FFFFFF'
        }
      });

      map.current.addLayer({
        id: 'airports-labels',
        type: 'symbol',
        source: 'airports',
        minzoom: 6, // Show when zoomed in
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
        minzoom: 6, // Show when zoomed in
        paint: {
          'line-color': '#0000FF',
          'line-width': 2,
          'line-opacity': 0.6,
          'line-dasharray': [2, 2]
        }
      });

      // Add directional arrows for airport routes
      map.current.addLayer({
        id: 'airport-routes-arrows',
        type: 'symbol',
        source: 'airport-routes',
        minzoom: 6,
        layout: {
          'symbol-placement': 'line-center',
          'text-field': '▶',
          'text-size': 12,
          'text-allow-overlap': true,
          'text-ignore-placement': true,
          'text-rotate': 0
        },
        paint: {
          'text-color': '#0000FF',
          'text-opacity': 0.8
        }
      });

      // Re-apply filters if any are active
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
          layers: ['clusters', 'unclustered-point', 'airports-points', 'routes-lines', 'airport-routes-lines']
        });

        if (features.length > 0) {
          const feature = features[0];
          
          // Handle cluster clicks
          if (feature.properties?.cluster) {
            const clusterId = feature.properties.cluster_id;
            const mapboxSource = map.current?.getSource('cities') as mapboxgl.GeoJSONSource;
            mapboxSource.getClusterExpansionZoom(
              clusterId,
              (err: any, zoom: number | null | undefined) => {
                if (err || !zoom) return;
                map.current?.easeTo({
                  center: (feature.geometry as Point).coordinates as [number, number],
                  zoom: zoom
                });
              }
            );
            return;
          }

          setSelectedFeature(feature);
          setInfoBarContent(feature.properties as FeatureProperties);
          setShowInfoBar(true);

          // Create popup content
          const popupContent = `
            <div class="mapbox-popup">
              <h3>${feature.properties?.name || 'Unknown'}</h3>
              ${feature.properties?.population ? `<p>Population: ${feature.properties.population.toLocaleString()}</p>` : ''}
              ${feature.properties?.code ? `<p>Code: ${feature.properties.code}</p>` : ''}
              ${feature.properties?.distance ? `<p>Distance: ${feature.properties.distance} miles</p>` : ''}
              ${feature.properties?.airportCount ? `<p>Airports: ${feature.properties.airportCount}</p>` : ''}
              <p>${feature.properties?.description || ''}</p>
              ${feature.layer?.id === 'unclustered-point' ? `
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
      if (draw.current) {
        draw.current = null;
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
      <h3>MapBox</h3>
      <div ref={mapContainer} style={{ width: '100%', height: '400px', position: 'relative' }}>
        {renderLayerControl()}
        {renderInfoBar()}
      </div>
    </div>
  );
};

export default MapBoxMap; 