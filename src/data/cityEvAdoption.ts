import { FeatureCollection, Point } from 'geojson';

interface CityProperties {
  name: string;
  population: number;
  month: number;
  adoptionRate: number;
}

const cityEvAdoption: FeatureCollection<Point, CityProperties> = {
  type: 'FeatureCollection',
  features: [
    // New York City - All 12 months
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-74.006, 40.7128] },
      properties: { name: 'New York', population: 8336817, month: 1, adoptionRate: 35.2 }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-74.006, 40.7128] },
      properties: { name: 'New York', population: 8336817, month: 2, adoptionRate: 36.5 }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-74.006, 40.7128] },
      properties: { name: 'New York', population: 8336817, month: 3, adoptionRate: 37.8 }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-74.006, 40.7128] },
      properties: { name: 'New York', population: 8336817, month: 4, adoptionRate: 38.9 }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-74.006, 40.7128] },
      properties: { name: 'New York', population: 8336817, month: 5, adoptionRate: 39.7 }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-74.006, 40.7128] },
      properties: { name: 'New York', population: 8336817, month: 6, adoptionRate: 40.5 }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-74.006, 40.7128] },
      properties: { name: 'New York', population: 8336817, month: 7, adoptionRate: 41.2 }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-74.006, 40.7128] },
      properties: { name: 'New York', population: 8336817, month: 8, adoptionRate: 41.8 }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-74.006, 40.7128] },
      properties: { name: 'New York', population: 8336817, month: 9, adoptionRate: 42.1 }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-74.006, 40.7128] },
      properties: { name: 'New York', population: 8336817, month: 10, adoptionRate: 42.4 }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-74.006, 40.7128] },
      properties: { name: 'New York', population: 8336817, month: 11, adoptionRate: 42.6 }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-74.006, 40.7128] },
      properties: { name: 'New York', population: 8336817, month: 12, adoptionRate: 42.8 }
    },
    // Los Angeles - All 12 months
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-118.2437, 34.0522] },
      properties: { name: 'Los Angeles', population: 3898747, month: 1, adoptionRate: 45.3 }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-118.2437, 34.0522] },
      properties: { name: 'Los Angeles', population: 3898747, month: 2, adoptionRate: 46.7 }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-118.2437, 34.0522] },
      properties: { name: 'Los Angeles', population: 3898747, month: 3, adoptionRate: 47.9 }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-118.2437, 34.0522] },
      properties: { name: 'Los Angeles', population: 3898747, month: 4, adoptionRate: 48.8 }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-118.2437, 34.0522] },
      properties: { name: 'Los Angeles', population: 3898747, month: 5, adoptionRate: 49.5 }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-118.2437, 34.0522] },
      properties: { name: 'Los Angeles', population: 3898747, month: 6, adoptionRate: 50.1 }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-118.2437, 34.0522] },
      properties: { name: 'Los Angeles', population: 3898747, month: 7, adoptionRate: 50.6 }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-118.2437, 34.0522] },
      properties: { name: 'Los Angeles', population: 3898747, month: 8, adoptionRate: 51.1 }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-118.2437, 34.0522] },
      properties: { name: 'Los Angeles', population: 3898747, month: 9, adoptionRate: 51.5 }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-118.2437, 34.0522] },
      properties: { name: 'Los Angeles', population: 3898747, month: 10, adoptionRate: 51.9 }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-118.2437, 34.0522] },
      properties: { name: 'Los Angeles', population: 3898747, month: 11, adoptionRate: 52.2 }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-118.2437, 34.0522] },
      properties: { name: 'Los Angeles', population: 3898747, month: 12, adoptionRate: 52.4 }
    },
    // Chicago - All 12 months
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-87.6298, 41.8781] },
      properties: { name: 'Chicago', population: 2718782, month: 1, adoptionRate: 28.9 }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-87.6298, 41.8781] },
      properties: { name: 'Chicago', population: 2718782, month: 2, adoptionRate: 29.5 }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-87.6298, 41.8781] },
      properties: { name: 'Chicago', population: 2718782, month: 3, adoptionRate: 30.1 }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-87.6298, 41.8781] },
      properties: { name: 'Chicago', population: 2718782, month: 4, adoptionRate: 30.7 }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-87.6298, 41.8781] },
      properties: { name: 'Chicago', population: 2718782, month: 5, adoptionRate: 31.3 }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-87.6298, 41.8781] },
      properties: { name: 'Chicago', population: 2718782, month: 6, adoptionRate: 31.8 }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-87.6298, 41.8781] },
      properties: { name: 'Chicago', population: 2718782, month: 7, adoptionRate: 32.2 }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-87.6298, 41.8781] },
      properties: { name: 'Chicago', population: 2718782, month: 8, adoptionRate: 32.6 }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-87.6298, 41.8781] },
      properties: { name: 'Chicago', population: 2718782, month: 9, adoptionRate: 32.9 }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-87.6298, 41.8781] },
      properties: { name: 'Chicago', population: 2718782, month: 10, adoptionRate: 33.2 }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-87.6298, 41.8781] },
      properties: { name: 'Chicago', population: 2718782, month: 11, adoptionRate: 33.7 }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-87.6298, 41.8781] },
      properties: { name: 'Chicago', population: 2718782, month: 12, adoptionRate: 35.2 }
    },
    // Houston - All 12 months
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-95.3698, 29.7604] },
      properties: { name: 'Houston', population: 2320268, month: 1, adoptionRate: 25.4 }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-95.3698, 29.7604] },
      properties: { name: 'Houston', population: 2320268, month: 2, adoptionRate: 26.1 }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-95.3698, 29.7604] },
      properties: { name: 'Houston', population: 2320268, month: 3, adoptionRate: 26.8 }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-95.3698, 29.7604] },
      properties: { name: 'Houston', population: 2320268, month: 4, adoptionRate: 27.5 }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-95.3698, 29.7604] },
      properties: { name: 'Houston', population: 2320268, month: 5, adoptionRate: 28.2 }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-95.3698, 29.7604] },
      properties: { name: 'Houston', population: 2320268, month: 6, adoptionRate: 28.9 }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-95.3698, 29.7604] },
      properties: { name: 'Houston', population: 2320268, month: 7, adoptionRate: 29.6 }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-95.3698, 29.7604] },
      properties: { name: 'Houston', population: 2320268, month: 8, adoptionRate: 30.1 }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-95.3698, 29.7604] },
      properties: { name: 'Houston', population: 2320268, month: 9, adoptionRate: 30.6 }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-95.3698, 29.7604] },
      properties: { name: 'Houston', population: 2320268, month: 10, adoptionRate: 31.1 }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-95.3698, 29.7604] },
      properties: { name: 'Houston', population: 2320268, month: 11, adoptionRate: 31.5 }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-95.3698, 29.7604] },
      properties: { name: 'Houston', population: 2320268, month: 12, adoptionRate: 31.8 }
    },
    // San Francisco - All 12 months
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-122.4194, 37.7749] },
      properties: { name: 'San Francisco', population: 873965, month: 1, adoptionRate: 55.2 }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-122.4194, 37.7749] },
      properties: { name: 'San Francisco', population: 873965, month: 2, adoptionRate: 56.8 }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-122.4194, 37.7749] },
      properties: { name: 'San Francisco', population: 873965, month: 3, adoptionRate: 57.9 }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-122.4194, 37.7749] },
      properties: { name: 'San Francisco', population: 873965, month: 4, adoptionRate: 58.7 }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-122.4194, 37.7749] },
      properties: { name: 'San Francisco', population: 873965, month: 5, adoptionRate: 59.3 }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-122.4194, 37.7749] },
      properties: { name: 'San Francisco', population: 873965, month: 6, adoptionRate: 59.8 }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-122.4194, 37.7749] },
      properties: { name: 'San Francisco', population: 873965, month: 7, adoptionRate: 60.1 }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-122.4194, 37.7749] },
      properties: { name: 'San Francisco', population: 873965, month: 8, adoptionRate: 60.4 }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-122.4194, 37.7749] },
      properties: { name: 'San Francisco', population: 873965, month: 9, adoptionRate: 60.7 }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-122.4194, 37.7749] },
      properties: { name: 'San Francisco', population: 873965, month: 10, adoptionRate: 61.0 }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-122.4194, 37.7749] },
      properties: { name: 'San Francisco', population: 873965, month: 11, adoptionRate: 61.8 }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-122.4194, 37.7749] },
      properties: { name: 'San Francisco', population: 873965, month: 12, adoptionRate: 62.5 }
    }
  ]
};

export { cityEvAdoption }; 