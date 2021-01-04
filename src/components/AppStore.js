import { writable } from 'svelte/store';

let defaults= {
    fetch: {
      locationContext: null,
    },
    user: {
      locale: "en-US",
      language: "en",
      fallbackLanguage: "en", // en es ar ru zh pt
      location: {
        iso_3166_1: null,
        geoip: null,
        gps: null,
      },
    },
    map: {
      configUrl: null,
      accessToken: null,
      title: "publicmap.github.io",
      description: null,
      attribution: null,
      bbox: null,
      worldviews: ["US", "CN", "IN", "JP"],
      worldview: "US", // Set worldview to use for disputed areas
      style: null, // style: "https://cdn.jsdelivr.net/gh/osm-in/mapbox-gl-styles@latest/osm-mapnik.json",
      styles: [
        {
          label: "Satellite",
          styleName: "Mapbox Satellite",
          styleUrl: "mapbox://styles/mapbox/satellite-streets-v11",
        },
        {
          label: "Railway",
          styleName: "Railway",
          styleUrl: "mapbox://styles/planemad/ck7p3wxmp0q571imu99elwqs1",
        },
        {
          label: "Hydrology",
          styleName: "Hydrology",
          styleUrl: "mapbox://styles/planemad/ckd42fwa20n531iqrewerwla1",
        },
        {
          label: "OpenStreetMap",
          styleName: "OpenStreetMap",
          styleUrl:
            "https://cdn.jsdelivr.net/gh/osm-in/mapbox-gl-styles@latest/osm-mapnik-india-v8.json",
        },
        {
          label: "Connectivity",
          styleName: "Connectivity",
          styleUrl: "mapbox://styles/planemad/ckhijjwug10ht19mjwvno5o38",
        },
      ],
      locationContext: {
        text: "",
        fetch: null,
        geojson: null,
      },
      source: {
        geojson: null,
        vector: null,
        tms: null,
        wms: null,
      },
      camera: {
        rotate: false,
        blur: false,
      },
      wikidata: {
        isEnabled: null,
      },
    },
  }

export const settings = writable(defaults);

