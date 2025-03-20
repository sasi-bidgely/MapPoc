export const mapConfig = {
  maptiler: {
    apiKey: process.env.REACT_APP_MAPTILER_API_KEY || 'YOUR_MAPTILER_API_KEY',
    styles: {
      streets: 'https://demotiles.maplibre.org/style.json',
      satellite: 'https://api.maptiler.com/tiles/satellite/style.json',
      terrain: 'https://api.maptiler.com/tiles/terrain/style.json',
      light: 'https://api.maptiler.com/tiles/streets-light/style.json',
      dark: 'https://api.maptiler.com/tiles/streets-dark/style.json'
    }
  }
}; 