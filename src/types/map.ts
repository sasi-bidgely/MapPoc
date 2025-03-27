import { Feature, Point, LineString, Geometry } from 'geojson';

export interface RouteProperties {
  from: string;
  to: string;
  name?: string;
  population?: number;
  code?: string;
  distance?: number;
  description?: string;
  city?: string;
}

export interface MapStyle {
  id: string;
  name: string;
  url: string;
}

export interface LayerControl {
  id: string;
  name: string;
  visible: boolean;
}

export interface FeatureProperties {
  name?: string;
  population?: number;
  code?: string;
  distance?: number;
  description?: string;
  city?: string;
  from?: string;
  to?: string;
  airportCount?: number;
}

export interface CityProperties {
  name: string;
  population: number;
  description: string;
  airportCount: number;
}

export type FeatureCollection<T extends Feature<Geometry>> = {
  type: 'FeatureCollection';
  features: T[];
}; 