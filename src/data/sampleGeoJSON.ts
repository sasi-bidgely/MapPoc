import { FeatureCollection, Point, LineString, Feature } from 'geojson';

interface CityProperties {
  name: string;
  population: number;
  description: string;
}

interface RouteProperties {
  name: string;
  distance: number;
  description: string;
  city: string;
}

interface AirportProperties {
  name: string;
  code: string;
  description: string;
  city: string;
}

// Cities GeoJSON
export const citiesGeoJSON: FeatureCollection<Point, CityProperties> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        name: "New York City",
        population: 8336817,
        description: "The most populous city in the United States"
      },
      geometry: {
        type: "Point",
        coordinates: [-74.006, 40.7128]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "Philadelphia",
        population: 1603797,
        description: "The sixth-largest city in the United States"
      },
      geometry: {
        type: "Point",
        coordinates: [-75.1652, 39.9526]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "Boston",
        population: 675647,
        description: "The capital and largest city of Massachusetts"
      },
      geometry: {
        type: "Point",
        coordinates: [-71.0589, 42.3601]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "Washington DC",
        population: 689545,
        description: "The capital of the United States"
      },
      geometry: {
        type: "Point",
        coordinates: [-77.0369, 38.9072]
      }
    }
  ]
};

// Routes GeoJSON (connecting cities)
export const routesGeoJSON: FeatureCollection<LineString, RouteProperties> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        name: "Northeast Corridor",
        distance: 450,
        description: "Major transportation corridor connecting major cities",
        city: "New York City"
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [-74.006, 40.7128], // NYC
          [-75.1652, 39.9526], // Philadelphia
          [-77.0369, 38.9072]  // Washington DC
        ]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "Boston-NYC Route",
        distance: 215,
        description: "Direct route between Boston and New York",
        city: "Boston"
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [-71.0589, 42.3601], // Boston
          [-74.006, 40.7128]    // NYC
        ]
      }
    }
  ]
};

// Airports GeoJSON with multiple airports per city
export const airportsGeoJSON: FeatureCollection<Point, AirportProperties> = {
  type: "FeatureCollection",
  features: [
    // NYC Airports
    {
      type: "Feature",
      properties: {
        name: "John F. Kennedy International Airport",
        code: "JFK",
        description: "Major international airport serving New York City",
        city: "New York City"
      },
      geometry: {
        type: "Point",
        coordinates: [-73.7781, 40.6413]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "LaGuardia Airport",
        code: "LGA",
        description: "Major domestic airport serving New York City",
        city: "New York City"
      },
      geometry: {
        type: "Point",
        coordinates: [-73.8726, 40.7769]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "Newark Liberty International Airport",
        code: "EWR",
        description: "Major airport serving the New York metropolitan area",
        city: "New York City"
      },
      geometry: {
        type: "Point",
        coordinates: [-74.1687, 40.6895]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "Teterboro Airport",
        code: "TEB",
        description: "General aviation airport serving New York City",
        city: "New York City"
      },
      geometry: {
        type: "Point",
        coordinates: [-74.0608, 40.8501]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "Westchester County Airport",
        code: "HPN",
        description: "Regional airport serving New York City",
        city: "New York City"
      },
      geometry: {
        type: "Point",
        coordinates: [-73.7076, 41.0670]
      }
    },

    // Philadelphia Airports
    {
      type: "Feature",
      properties: {
        name: "Philadelphia International Airport",
        code: "PHL",
        description: "Major airport serving Philadelphia",
        city: "Philadelphia"
      },
      geometry: {
        type: "Point",
        coordinates: [-75.2423, 39.8729]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "Northeast Philadelphia Airport",
        code: "PNE",
        description: "General aviation airport serving Philadelphia",
        city: "Philadelphia"
      },
      geometry: {
        type: "Point",
        coordinates: [-75.0105, 40.0819]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "Wings Field Airport",
        code: "LOM",
        description: "Small airport serving Philadelphia suburbs",
        city: "Philadelphia"
      },
      geometry: {
        type: "Point",
        coordinates: [-75.2644, 40.1375]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "Doylestown Airport",
        code: "DYL",
        description: "General aviation airport in Philadelphia region",
        city: "Philadelphia"
      },
      geometry: {
        type: "Point",
        coordinates: [-75.1222, 40.3335]
      }
    },

    // Boston Airports
    {
      type: "Feature",
      properties: {
        name: "Logan International Airport",
        code: "BOS",
        description: "Major airport serving Boston",
        city: "Boston"
      },
      geometry: {
        type: "Point",
        coordinates: [-71.0090, 42.3656]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "Hanscom Field",
        code: "BED",
        description: "General aviation airport serving Boston",
        city: "Boston"
      },
      geometry: {
        type: "Point",
        coordinates: [-71.2890, 42.4700]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "Norwood Memorial Airport",
        code: "OWD",
        description: "Regional airport serving Boston",
        city: "Boston"
      },
      geometry: {
        type: "Point",
        coordinates: [-71.1729, 42.1905]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "Beverly Regional Airport",
        code: "BVY",
        description: "General aviation airport in Boston region",
        city: "Boston"
      },
      geometry: {
        type: "Point",
        coordinates: [-70.9164, 42.5842]
      }
    },

    // Washington DC Airports
    {
      type: "Feature",
      properties: {
        name: "Ronald Reagan Washington National Airport",
        code: "DCA",
        description: "Major airport serving Washington DC",
        city: "Washington DC"
      },
      geometry: {
        type: "Point",
        coordinates: [-77.0377, 38.8521]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "Dulles International Airport",
        code: "IAD",
        description: "Major international airport serving Washington DC",
        city: "Washington DC"
      },
      geometry: {
        type: "Point",
        coordinates: [-77.4558, 38.9445]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "Baltimore/Washington International Airport",
        code: "BWI",
        description: "Major airport serving the Washington-Baltimore region",
        city: "Washington DC"
      },
      geometry: {
        type: "Point",
        coordinates: [-76.6683, 39.1754]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "Manassas Regional Airport",
        code: "MNZ",
        description: "General aviation airport serving Washington DC",
        city: "Washington DC"
      },
      geometry: {
        type: "Point",
        coordinates: [-77.5153, 38.7214]
      }
    }
  ]
};

// Airport-to-City Routes
export const airportRoutesGeoJSON: FeatureCollection<LineString, RouteProperties> = {
  type: "FeatureCollection",
  features: [
    // NYC Airport Routes
    {
      type: "Feature",
      properties: {
        name: "JFK to NYC",
        distance: 15,
        description: "Route from JFK Airport to New York City",
        city: "New York City"
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [-73.7781, 40.6413], // JFK
          [-74.006, 40.7128]   // NYC
        ]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "LGA to NYC",
        distance: 8,
        description: "Route from LaGuardia Airport to New York City",
        city: "New York City"
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [-73.8726, 40.7769], // LGA
          [-74.006, 40.7128]   // NYC
        ]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "EWR to NYC",
        distance: 18,
        description: "Route from Newark Airport to New York City",
        city: "New York City"
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [-74.1687, 40.6895], // EWR
          [-74.006, 40.7128]   // NYC
        ]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "TEB to NYC",
        distance: 12,
        description: "Route from Teterboro Airport to New York City",
        city: "New York City"
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [-74.0608, 40.8501], // TEB
          [-74.006, 40.7128]   // NYC
        ]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "HPN to NYC",
        distance: 33,
        description: "Route from Westchester County Airport to New York City",
        city: "New York City"
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [-73.7076, 41.0670], // HPN
          [-74.006, 40.7128]   // NYC
        ]
      }
    },

    // Philadelphia Airport Routes
    {
      type: "Feature",
      properties: {
        name: "PHL to Philadelphia",
        distance: 7,
        description: "Route from Philadelphia International Airport to Philadelphia",
        city: "Philadelphia"
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [-75.2423, 39.8729], // PHL
          [-75.1652, 39.9526]  // Philadelphia
        ]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "PNE to Philadelphia",
        distance: 12,
        description: "Route from Northeast Philadelphia Airport to Philadelphia",
        city: "Philadelphia"
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [-75.0105, 40.0819], // PNE
          [-75.1652, 39.9526]  // Philadelphia
        ]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "LOM to Philadelphia",
        distance: 15,
        description: "Route from Wings Field Airport to Philadelphia",
        city: "Philadelphia"
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [-75.2644, 40.1375], // LOM
          [-75.1652, 39.9526]  // Philadelphia
        ]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "DYL to Philadelphia",
        distance: 25,
        description: "Route from Doylestown Airport to Philadelphia",
        city: "Philadelphia"
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [-75.1222, 40.3335], // DYL
          [-75.1652, 39.9526]  // Philadelphia
        ]
      }
    },

    // Boston Airport Routes
    {
      type: "Feature",
      properties: {
        name: "BOS to Boston",
        distance: 3,
        description: "Route from Logan Airport to Boston",
        city: "Boston"
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [-71.0090, 42.3656], // BOS
          [-71.0589, 42.3601]  // Boston
        ]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "BED to Boston",
        distance: 20,
        description: "Route from Hanscom Field to Boston",
        city: "Boston"
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [-71.2890, 42.4700], // BED
          [-71.0589, 42.3601]  // Boston
        ]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "OWD to Boston",
        distance: 18,
        description: "Route from Norwood Memorial Airport to Boston",
        city: "Boston"
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [-71.1729, 42.1905], // OWD
          [-71.0589, 42.3601]  // Boston
        ]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "BVY to Boston",
        distance: 25,
        description: "Route from Beverly Regional Airport to Boston",
        city: "Boston"
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [-70.9164, 42.5842], // BVY
          [-71.0589, 42.3601]  // Boston
        ]
      }
    },

    // Washington DC Airport Routes
    {
      type: "Feature",
      properties: {
        name: "DCA to Washington DC",
        distance: 4,
        description: "Route from Reagan National Airport to Washington DC",
        city: "Washington DC"
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [-77.0377, 38.8521], // DCA
          [-77.0369, 38.9072]  // Washington DC
        ]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "IAD to Washington DC",
        distance: 26,
        description: "Route from Dulles Airport to Washington DC",
        city: "Washington DC"
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [-77.4558, 38.9445], // IAD
          [-77.0369, 38.9072]  // Washington DC
        ]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "BWI to Washington DC",
        distance: 32,
        description: "Route from Baltimore/Washington International Airport to Washington DC",
        city: "Washington DC"
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [-76.6683, 39.1754], // BWI
          [-77.0369, 38.9072]  // Washington DC
        ]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "MNZ to Washington DC",
        distance: 28,
        description: "Route from Manassas Regional Airport to Washington DC",
        city: "Washington DC"
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [-77.5153, 38.7214], // MNZ
          [-77.0369, 38.9072]  // Washington DC
        ]
      }
    }
  ]
}; 