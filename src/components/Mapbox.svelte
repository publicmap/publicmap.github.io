<script>
  import { Map, Geocoder, Marker, controls } from "@beyonk/svelte-mapbox";
  import { onMount, createEventDispatcher, setContext } from "svelte";
  import RulerControl from "../components/Mapbox/RulerControl.svelte";
  import TitleControl from "../components/Mapbox/TitleControl.svelte";
  import StylesControl from "../components/Mapbox/StylesControl.svelte";
  import { contextKey } from "./mapbox.js";
  import { settingsStore } from "./settingsStore.js";

  const queryString = require("query-string");

  import { stores } from "@sapper/app";
  const { preloading, page, session } = stores();

  const { GeolocateControl, NavigationControl, ScaleControl } = controls;

  import countriesLookup from "../data/mapbox-countries-v1.json";

  let map, geocoder, mapbox, countryList;

  setContext(contextKey, {
    getMap: () => map,
    getMapbox: () => mapbox,
  });

  export let settings = {
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
      accessToken: null,
      attribution: null,
      worldview: "US", // Set worldview to use for disputed areas
      style: null,
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
      // style: "https://cdn.jsdelivr.net/gh/osm-in/mapbox-gl-styles@latest/osm-mapnik.json",
      // ckgopajx83l581bo6qr5l86yg
      locationContext: null,
      filter: {
        iso_3166_1: null,
        iso_3166_1_label: "...",
        iso_3166_2: null,
        iso_3166_2_label: null,
      },
    },
  };

  //
  // Define URL query params
  //

  $: customAttribution = $page.query.attribution || null;

  $: settings.map.style = $page.query.style
    ? settings.map.styles.map((s) => s.label).indexOf($page.query.style) > -1
      ? $page.query.style
      : "Custom"
    : settings.map.styles[0].label;

  $: settings.map.styleUrl =
    settings.map.style == "Custom"
      ? $page.query.style
      : settings.map.styles.filter((s) => s.label == settings.map.style)[0]
          .styleUrl; // style=mapbox://styles/planemad/ckhijjwug10ht19mjwvno5o38

  $: terrainExaggeration = $page.query.terrain || 1.5;
  $: title = $page.query.title || null;
  $: description = $page.query.description || null;
  $: place = $page.query.place || "";
  $: settings.map.worldview = $page.query.worldview || settings.map.worldview;
  $: settings.map.accessToken =
    $page.query.access_token ||
    "pk.eyJ1IjoicGxhbmVtYWQiLCJhIjoiY2l3ZmNjNXVzMDAzZzJ0cDV6b2lkOG9odSJ9.eep6sUoBS0eMN4thZUWpyQ";

  //
  // Map state change handers
  //

  function onGeocoderResult(e) {
    map.setCenter(e.detail.result.center);
  }

  function onGeolocate(e) {
    // console.log(e.detail);
  }

  function onMapReady(e) {
    map = mapbox.getMap();

    getLocationContext(e);

    initMap();
  }

  function onStyleChange(e) {
    settings.map.style = e.detail.style.label;

    // Update url
    // https://www.30secondsofcode.org/blog/s/javascript-modify-url-without-reload
    const nextURL = `?style=${settings.map.style}${window.location.hash}`;
    const nextTitle = "Public Map";
    const nextState = { additionalInformation: "Updated the URL with JS" };
    window.history.pushState(nextState, nextTitle, nextURL);

    map.once("styledata", function (e) {
      initMap();
    });
  }

  var customData = {
    features: [],
    type: "FeatureCollection",
  };

  onMount(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://raw.githack.com/bravecow/mapbox-gl-controls/master/theme.css";
    document.body.appendChild(link);

    detectUserSettings();

    return () => {
      map.remove();
      link.parentNode.removeChild(link);
    };
  });

  function getLocationContext(e) {
    let querylngLat = map.getCenter();

    let reverseGeocodingUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${
      querylngLat.lng
    }%2C${querylngLat.lat}.json?access_token=${
      settings.map.accessToken
    }&worldview=${settings.map.worldview.toLocaleLowerCase()}&types=country%2Cregion%2Cdistrict%2Cpostcode%2Clocality%2Cplace%2Cneighborhood%2Caddress%2Cpoi&language=${
      settings.user.language
    }`;

    fetch(reverseGeocodingUrl)
      .then((resp) => resp.json())
      .then((data) => {
        // DEBUG CONTEXT
        // console.log(data);

        settings.map.locationContext = data;
        if (data.features.length) {
          settings.map.filter.iso_3166_1_label =
            data.features[data.features.length - 1][
              `text_${settings.user.language}`
            ];
          settings.map.filter.iso_3166_1 =
            data.features[data.features.length - 1]["properties"]["short_code"];
        }

        styleMap(map);
      });
  }

  // Style the map to highlight a country
  function styleMap() {
    if (false) {
      let iso_3166_1 = settings.map.filter.iso_3166_1.toUpperCase();

      // Hide country labels
      [
        "country-label",
        "settlement-minor-label",
        "settlement-major-label",
        "poi-label",
        "water-point-label",
        "water-line-label",
        "waterway-label",
        "water-line-label",
        "waterway-label",
        "natural-point-label",
        "natural-line-label",
        "roads",
      ].forEach((layerId) =>
        map.setLayoutProperty(layerId, "visibility", "visible")
      );

      // Mask country boundary
      map.setPaintProperty("country-boundaries", "fill-color", [
        "case",
        ["match", ["get", "iso_3166_1"], [iso_3166_1], true, false],
        "hsla(0, 0%, 94%, 0)",
        ["match", ["get", "disputed"], ["true"], true, false],
        "hsla(36, 0%, 10%, 0.05)",
        "hsla(36, 0%, 100%, 0.89)",
      ]);

      // Style country outline and internal boundaries
      map.setPaintProperty("country-boundaries-outline", "line-color", [
        "match",
        ["get", "iso_3166_1"],
        iso_3166_1,
        "orange",
        "hsla(0, 0%, 100%, 0)",
      ]);

      map.setPaintProperty("admin-boundaries-line", "line-color", [
        "case",
        ["match", ["get", "iso_3166_1"], [iso_3166_1], true, false],
        "hsl(0, 0%, 100%)",
        ["match", ["get", "disputed"], ["true"], true, false],
        "hsla(0, 0%, 82%,0.5)",
        [
          "case",
          ["==", ["get", "admin_level"], 0],
          "hsla(0, 0%, 66%,0.5)",
          "hsla(0, 0%, 66%,0)",
        ],
      ]);

      map.setLayoutProperty("country-label", "symbol-sort-key", [
        "match",
        ["get", "iso_3166_1"],
        iso_3166_1,
        0,
        1,
      ]);

      map.setLayoutProperty("settlement-minor-label", "symbol-sort-key", [
        "match",
        ["get", "iso_3166_1"],
        iso_3166_1,
        0,
        1,
      ]);

      // Highlight matching country and city labels
      map.setPaintProperty("country-label", "text-opacity", [
        "match",
        ["get", "iso_3166_1"],
        iso_3166_1,
        1,
        0.3,
      ]);
      map.setPaintProperty("settlement-minor-label", "text-opacity", [
        "match",
        ["get", "iso_3166_1"],
        iso_3166_1,
        1,
        0.2,
      ]);
      map.setPaintProperty("settlement-major-label", "text-opacity", [
        "match",
        ["get", "iso_3166_1"],
        iso_3166_1,
        1,
        0.2,
      ]);
      map.setPaintProperty("settlement-minor-label", "icon-opacity", [
        "match",
        ["get", "iso_3166_1"],
        iso_3166_1,
        1,
        0.1,
      ]);
      map.setPaintProperty("settlement-major-label", "icon-opacity", [
        "match",
        ["get", "iso_3166_1"],
        iso_3166_1,
        1,
        0.1,
      ]);
      map.setPaintProperty("roads", "line-opacity", [
        "match",
        ["get", "iso_3166_1"],
        iso_3166_1,
        1,
        0,
      ]);
    }
  }

  function forwardGeocoder(query) {
    var matchingFeatures = [];
    for (var i = 0; i < customData.features.length; i++) {
      var feature = customData.features[i];
      // handle queries with different capitalization than the source data by calling toLowerCase()
      if (
        feature.properties.title.toLowerCase().search(query.toLowerCase()) !==
        -1
      ) {
        // add a tree emoji as a prefix for custom data results
        // using carmen geojson format: https://github.com/mapbox/carmen/blob/master/carmen-geojson.md
        feature["place_name"] = "🌲 " + feature.properties.title;
        feature["center"] = feature.geometry.coordinates;
        feature["place_type"] = ["park"];
        matchingFeatures.push(feature);
      }
    }
    return matchingFeatures;
  }

  // Detect user country code and browser locale
  function detectUserSettings() {
    var traceRequest = new XMLHttpRequest();
    traceRequest.open("GET", "https://www.cloudflare.com/cdn-cgi/trace");
    traceRequest.onreadystatechange = () => {
      if (traceRequest.readyState == XMLHttpRequest.DONE) {
        if (traceRequest.status == 200) {
          settings.user.location.iso_3166_1 = traceRequest.responseText.match(
            /loc=([^\n+]*)/
          )[1];

          countryList = countriesLookup.filter(
            (d) =>
              (d.worldview == "all" || d.worldview == settings.mapWorldview) &&
              (d.description == "sovereign state" ||
                d.description == "dependent territory")
          );

        }
      }
    };

    traceRequest.send(null);
  }

  function initMap() {
    settings.map.styleName = map.getStyle().name;
    settings.map.stylesheet = map.style.stylesheet;

    // map.addControl(new mapboxgl.AttributionControl());

    // if (true) {
    //   setWorldViewFilter(
    //     filterStyle('layers', layer => layer["source-layer"] == "country_boundaries"),
    //     settings.map.worldview
    //   );
    // }

    if (terrainExaggeration > 0) {
      // Add 3D terrain
      // https://docs.mapbox.com/mapbox-gl-js/example/add-terrain/
      if (!map.getSource("mapbox-dem")) {
        map.addSource("mapbox-dem", {
          type: "raster-dem",
          url: "mapbox://mapbox.mapbox-terrain-dem-v1",
          tileSize: 512,
          maxzoom: 14,
        });
        // add the DEM source as a terrain layer with exaggerated height
        map.setTerrain({
          source: "mapbox-dem",
          exaggeration: [
            "interpolate",
            ["linear"],
            ["zoom"],
            0,
            terrainExaggeration * Math.pow(2, 4),
            1,
            terrainExaggeration * Math.pow(2, 3),
            2,
            terrainExaggeration * Math.pow(2, 2),
            10,
            terrainExaggeration * Math.pow(2, 1),
            16,
            1,
          ],
        });
      }
    }

    // Add 3D hillshade
    // https://docs.mapbox.com/mapbox-gl-js/example/hillshade/

    if (!map.getSource("3d-hillshade")) {
      map.addSource("3d-hillshade", {
        type: "raster-dem",
        url: "mapbox://mapbox.mapbox-terrain-dem-v1",
        tileSize: 512,
        maxzoom: 14,
      });

      let symbolLayers = map
        .getStyle()
        .layers.filter((l) => l.type == "symbol");
      map.addLayer(
        {
          id: "3d-hillshade",
          source: "3d-hillshade",
          type: "hillshade",
          paint: {
            "hillshade-shadow-color": "#0f0f0f",
            "hillshade-highlight-color": "#ffffff",
            "hillshade-accent-color": "#625e3c",
            "hillshade-exaggeration": [
              "interpolate",
              ["linear"],
              ["zoom"],
              1,
              0.7,
              6,
              0.4,
              16,
              0.1,
            ],
          },
        },
        symbolLayers.length ? symbolLayers[0].id : null
      );
    }

    // Add 3D buildings
    // https://docs.mapbox.com/mapbox-gl-js/example/add-terrain/
    if (!map.getLayer("3d-buildings")) {
      if (!map.getSource("composite")) {
        map.addSource("composite", {
          type: "vector",
          url: "mapbox://mapbox.mapbox-streets-v8",
        });
      }

      // Insert the layer beneath any symbol layer.
      var layers = map.getStyle().layers;

      var labelLayerId;
      for (var i = 0; i < layers.length; i++) {
        if (layers[i].type === "symbol" && layers[i].layout["text-field"]) {
          labelLayerId = layers[i].id;
          break;
        }
      }

      map.addLayer(
        {
          id: "3d-buildings",
          source: "composite",
          "source-layer": "building",
          filter: ["==", "extrude", "true"],
          type: "fill-extrusion",
          minzoom: 15,
          paint: {
            "fill-extrusion-color": "#aaa",

            // use an 'interpolate' expression to add a smooth transition effect to the
            // buildings as the user zooms in
            "fill-extrusion-height": [
              "interpolate",
              ["linear"],
              ["zoom"],
              15,
              0,
              15.05,
              ["get", "height"],
            ],
            "fill-extrusion-base": [
              "interpolate",
              ["linear"],
              ["zoom"],
              15,
              0,
              15.05,
              ["get", "min_height"],
            ],
            "fill-extrusion-opacity": 0.8,
          },
        },
        labelLayerId
      );
    }

    if (!map.getLayer("sky")) {
      // add a sky layer that will show when the map is highly pitched
      map.addLayer({
        id: "sky",
        type: "sky",
        paint: {
          "sky-type": "atmosphere",
          "sky-atmosphere-sun": [0.0, 0.0],
          "sky-atmosphere-sun-intensity": 2,
        },
      });
    }
  }

  //
  // Mapbox utility methods
  //

  // Returns an array of map style layers that match a given filter function
  function filterStyle(styleObject, filterFn) {
    return map.getStyle()[styleObject].filter((layer) => {
      return filterFn ? filterFn(layer) : layer;
    });
  }

  function setWorldViewFilter(layers, worldView) {
    let worldviewFilter = getWorldviewFilter(worldView);

    layers.forEach((layerId) => map.setFilter(layerId, worldviewFilter));
  }

  function getWorldviewFilter(worldView) {
    let selectedWorldView = worldView || "IN";
    return [
      "all",
      [
        "any",
        [
          "in",
          selectedWorldView || settings.map.worldview,
          ["get", "worldview"],
        ],
        ["==", "all", ["get", "worldview"]],
      ],
    ];
  }
</script>

<style>
  #map {
    height: 100vh;
  }
  #locator-map {
    position: absolute;
    right: 10px;
    bottom: 10px;
  }
  section {
    position: absolute;
    left: 46px;
    top: 12px;
    z-index: 99;
  }
  span.block {
    padding: 0 4px;
    background-color: rgba(255, 255, 255, 0.5);
  }

  #description > * {
    background-color: rgba(255, 255, 255, 0.5);
    color: #111;
    padding: 3px;
  }
  #description:empty {
    display: none;
  }

  :global(.mapboxgl-control-container > * > *) {
    opacity: 0;
    transition: opacity 5s ease-out;
    z-index: 99;
  }
  :global(.mapboxgl-ctrl-attrib, .mapboxgl-ctrl-bottom-left
      > .mapboxgl-ctrl:nth-child(3), .mapboxgl-ctrl-bottom-left
      > .mapboxgl-ctrl:nth-child(4)) {
    opacity: 1;
    transition: opacity 0.1s ease-out;
    z-index: 99;
  }
  :global(.mapboxgl-control-container:hover > * > *) {
    opacity: 1;
    transition: opacity 0.1s ease-in;
  }
  :global(.mapboxgl-ctrl-geocoder) {
    width: 30px;
    min-width: 30px;
  }

  :global(.mapboxgl-ctrl-geocoder .suggestions li, .mapboxgl-ctrl-geocoder
      div) {
    display: none;
  }

  :global(.mapboxgl-ctrl-geocoder:hover) {
    width: 200px;
    min-width: inherit;
    transition: width 0.3s ease-in-out;
  }

  :global(.mapboxgl-ctrl-geocoder:hover
      .suggestions
      li, .mapboxgl-ctrl-geocoder:hover div) {
    display: inherit;
  }
</style>

<section>
  <h1 class="uk-no-margin">
    <span class="block">
      {#if settings.pageTitle || settings.map.filter.iso_3166_1}
        {settings.pageTitle || (settings.map.locationContext.features.length && settings.map.locationContext.features.filter((f) => f.place_type.indexOf('country') > -1)[0].text + '/' + settings.map.locationContext.features.filter((f) => f.place_type.indexOf('region') > -1)[0].text) || ''}
      {/if}
    </span>
  </h1>
  <p id="description" class="uk-text-lead">
    {#if description}
    <span>{description}</span> <br />
    {/if}
    {#if settings.map.stylesheet}
    <small>
      <span>Map Style:
        <a
          class="uk-link-text"
          href={`https://api.mapbox.com/styles/v1/${settings.map.stylesheet.owner}/${settings.map.stylesheet.id}.html?fresh=true&title=copy&access_token=${settings.map.accessToken}${window.location.hash}`}>{settings.map.styleName ? settings.map.styleName + ' by ' + settings.map.stylesheet.owner : 'Loading'}</a></span>
          
    </small>
    {/if}
  </p>
</section>

https://api.mapbox.com/styles/v1/planemad/ckd42fwa20n531iqrewerwla1.html?fresh=true&title=copy&access_token=pk.eyJ1IjoicGxhbmVtYWQiLCJhIjoiY2l3ZmNjNXVzMDAzZzJ0cDV6b2lkOG9odSJ9.eep6sUoBS0eMN4thZUWpyQ#7.87/20.062/75.079
https://api.mapbox.com/styles/v1/planemad/ckd42fwa20n531iqrewerwla1.html?fresh=true&title=copy&access_token=pk.eyJ1IjoicGxhbmVtYWQiLCJhIjoiemdYSVVLRSJ9.g3lbg_eN0kztmsfIPxa9MQ#11.77/37.7553/-77.4834

<!-- <Geocoder
    bind:this={geocoder}
    accessToken={settings.map.accessToken}
    options={{ position: 'top-right',localGeocoder: forwardGeocoder, countries: settings.map.filter.iso_3166_1 ? settings.map.filter.iso_3166_1.toLocaleLowerCase() : '' }}
    placeholder={'Find a place'}
    on:result={onGeocoderResult} /> -->

<div id="map">
  <Map
    bind:this={mapbox}
    accessToken={settings.map.accessToken}
    style={settings.map.styleUrl}
    options={{ hash: true, attributionControl: true, customAttribution: customAttribution }}
    on:ready={onMapReady}
    on:recentre={getLocationContext}
    version="v2.0.1">
    <StylesControl styles={settings.map.styles} on:change={onStyleChange} />

    <GeolocateControl
      position="top-right"
      options={{ trackUserLocation: true }}
      on:geolocate={onGeolocate} />

    <NavigationControl />

    <ScaleControl position="bottom-left" />
    <RulerControl position="bottom-left" />
    <TitleControl />
  </Map>
</div>

<div id="locator-map">
  {#if false && settings.map.filter.iso_3166_1}
    <img
      width="200"
      src={`https://api.mapbox.com/styles/v1/planemad/ckhw6q1000e0h19pckcjqadsr/static/0,10,0,0/600x300?access_token=${settings.map.accessToken}&amp;setfilter=["all",["any",["in","US",["get","worldview"]],["==","all",["get","worldview"]]],["match",["get","iso_3166_1"],["{settings.map.filter.iso_3166_1.toUpperCase()}"],true,false]]&amp;layer_id=selected-countries`} />
  {/if}
</div>
