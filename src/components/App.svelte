<script>
  import { Map, Geocoder, Marker, controls } from "@beyonk/svelte-mapbox";
  import { onMount, createEventDispatcher, setContext } from "svelte";
  import RulerControl from "../components/Mapbox/RulerControl.svelte";
  import NavControl from "../components/Mapbox/NavControl.svelte";
  import InspectControl from "../components/Mapbox/InspectControl.svelte";
  import TitleControl from "../components/Mapbox/TitleControl.svelte";
  import StylesControl from "../components/Mapbox/StylesControl.svelte";
  import TiltShift from "./Mapbox/TiltShift.svelte";
  import { contextKey } from "./mapbox.js";
  import { settingsStore } from "./settingsStore.js";
  import sanitizeHtml from "sanitize-html";
  import { parse } from "node-html-parser";
  import { queryWikidata } from "./utils.js";

  var wkt = require("wellknown");

  import { stores } from "@sapper/app";
  const { page, session } = stores();

  const { GeolocateControl, ScaleControl } = controls;

  import countriesLookup from "../data/mapbox-countries-v1.json";

  let map, geocoder, mapbox, countryList;

  setContext(contextKey, {
    getMap: () => map,
    getMapbox: () => mapbox,
  });

  export let settings = {
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
      accessToken: null,
      title: null,
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
        tiles: null,
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
  $: settings.map.title = $page.query.title || null;
  $: settings.map.description = $page.query.description
    ? sanitizeHtml($page.query.description, {
        allowedAttributes: {
          data: ["data-lat", "data-lng"],
        },
      })
    : null;
  $: place = $page.query.place || "";
  $: settings.map.worldview = $page.query.worldview || settings.map.worldview;
  $: settings.map.accessToken =
    $page.query.access_token ||
    "pk.eyJ1IjoicHVibGljbWFwIiwiYSI6ImNrajZuM3E2MDBtNzkyem55OG9oMjVwNHcifQ.S0ovBPKikZhHZ_6Dexk8Ow"; //
  $: settings.map.source.tiles = $page.query.tiles;
  $: settings.map.source.wms = $page.query.wms;
  $: settings.map.camera.rotate = $page.query.rotate_camera;
  $: settings.map.camera.blur = $page.query.blur;
  $: settings.map.wikidata.isEnabled =
    ($page.query.wikidata || "true") == "true";

  const root = parse($page.query.description);
  settings.map.markers = [];
  root.querySelectorAll("data").forEach((d) => {
    settings.map.markers.push({
      lng: parseInt(d.getAttribute("data-lng")),
      lat: parseInt(d.getAttribute("data-lat")),
    });
  });

  // DEBUG: settings
  // console.log(settings);

  //
  // Initialize Mapbox compnent
  //

  onMount(() => {
    // Load map config from external JSON
    if ($page.query.config) {
      fetch($page.query.config)
        .then((resp) => resp.json())
        .then((data) => {
          // Object.assign(settings.map, data);
        });
    }

    if (!window.location.hash) settings.map.autoLocate = true;

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

  //
  // Map state change handlers
  //

  function onGeocoderReady(e) {}
  function onGeocoderResult(e) {
    map.setCenter(e.detail.result.center);
    setLocationContext();
  }

  function onGeolocate(e) {
    setLocationContext();
  }

  function onMapReady(e) {
    map = mapbox.getMap();
    mapbox = mapbox.getMapbox();

    // Enable RTL support
    // https://docs.mapbox.com/mapbox-gl-js/example/mapbox-gl-rtl-text/
    mapbox.setRTLTextPlugin(
      "https://api.mapboxgl.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js",
      null,
      true // Lazy load the plugin
    );

    if (settings.map.autoLocate) {
      map.fitBounds(
        JSON.parse(
          countryList.filter(
            (country) => country.iso_3166_1 == settings.user.location.iso_3166_1
          )[0].bounds
        )
      );
    }

    setupMapStyle();
  }

  function onStyleChange(e) {
    // Update style params in url

    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("style", e.detail.style.label);

    const nextURL = `?${searchParams.toString()}${window.location.hash}`;
    const nextTitle = "Public Map";
    const nextState = { additionalInformation: "Updated the URL with JS" };
    window.history.pushState(nextState, nextTitle, nextURL);

    settings.map.style = e.detail.style.label;

    map.once("styledata", function (e) {
      setupMapStyle();
    });
  }

  //
  // Detect user country code and browser locale
  //

  function detectUserSettings() {
    var traceRequest = new XMLHttpRequest();
    traceRequest.open("GET", "https://www.cloudflare.com/cdn-cgi/trace");
    traceRequest.onreadystatechange = () => {
      if (traceRequest.readyState == XMLHttpRequest.DONE) {
        if (traceRequest.status == 200) {
          settings.user.location.iso_3166_1 = traceRequest.responseText
            .match(/loc=([^\n+]*)/)[1]
            .toUpperCase();

          if (
            settings.map.worldviews.indexOf(settings.user.location.iso_3166_1) >
            -1
          )
            settings.map.worldview = settings.user.location.iso_3166_1;

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

  //
  // Setup map style by adding custom layers for overlays, 3D terrain and country mask
  //

  function setupMapStyle() {
    settings.map.styleName = map.getStyle().name;
    settings.map.stylesheet = map.style.stylesheet;

    // Find the first label layer in the style so that other layers can be inserted below it
    const layers = map.getStyle().layers;

    let lineLayerId = null;
    for (var i = 0; i < layers.length; i++) {
      if (layers[i].type === "line") {
        lineLayerId = layers[i].id;
        break;
      }
    }

    let labelLayerId = null;
    for (var i = 0; i < layers.length; i++) {
      if (layers[i].type === "symbol" && layers[i].layout["text-field"]) {
        labelLayerId = layers[i].id;
        break;
      }
    }

    // TODO check if style already has 3d terratin
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

      // Add sky

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

    // Add 3D hillshade
    // https://docs.mapbox.com/mapbox-gl-js/example/hillshade/

    if (!map.getSource("3d-hillshade")) {
      map.addSource("3d-hillshade", {
        type: "raster-dem",
        url: "mapbox://mapbox.mapbox-terrain-dem-v1",
        tileSize: 512,
        maxzoom: 14,
      });

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
        labelLayerId || null
      );
    }

    // Add a country mask layer

    const countryBoundaryLayers = map
      .getStyle()
      .layers.filter((l) => l["source-layer"] == "country_boundaries");

    let countryBoundariesSource = map.getSource("country-boundaries");

    if (!countryBoundaryLayers.length) {
      map.addSource("country-boundaries", {
        type: "vector",
        url: "mapbox://mapbox.country-boundaries-v1",
        tileSize: 512,
        maxzoom: 14,
      });
      countryBoundariesSource = "country-boundaries";
    } else {
      countryBoundariesSource = countryBoundaryLayers[0].source;
    }

    if (!map.getLayer("country-mask")) {
      map.addLayer(
        {
          id: "country-mask",
          type: "fill",
          source: countryBoundariesSource,
          "source-layer": "country_boundaries",
          paint: {
            "fill-color": "hsla(0, 0%, 94%, 0)",
          },
        },
        lineLayerId || null
      );

      setLayerWorldview("country-mask");

      map.addLayer(
        {
          id: "country-mask-outline",
          type: "line",
          source: countryBoundariesSource,
          "source-layer": "country_boundaries",
          paint: {
            "line-color": "hsla(0, 0%, 20%, 0.5)",
            "line-width": ["interpolate", ["linear"], ["zoom"], 2, 1, 6, 4],
          },
        },
        labelLayerId || null
      );

      setLayerWorldview("country-mask-outline");
    }

    // Add user defined tiles

    if (settings.map.source.tiles) {
      const sourceURL = new URL(settings.map.source.tiles);

      map.addSource("tiles", {
        type: "raster",
        tiles: [tileUrl(settings.map.source.tiles)],
        tileSize: 512,
        attribution: `Overlay tiles from <a target="_top" rel="noopener" href="${tileAttributionUrl(
          settings.map.source.tiles
        )}">${sourceURL.hostname}</a>`,
      });

      function tileUrl(url) {
        return url.includes("wmflabs")
          ? "https://cors-anywhere.herokuapp.com/" + url
          : url;
      }

      function tileAttributionUrl(url) {
        return url.includes("warper")
          ? url.replace("tile/", "").split("{")[0]
          : url;
      }

      map.addLayer(
        {
          id: "raster-tiles",
          type: "raster",
          source: "tiles",
          minzoom: 0,
          maxzoom: 22,
          paint: {
            "raster-opacity": [
              "interpolate",
              ["linear"],
              ["zoom"],
              12,
              0.95,
              15,
              0.8,
              17,
              0.2,
            ],
          },
        },
        lineLayerId
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

    // Add Wikidata layer
    if (settings.map.wikidata.isEnabled) {
      if (!map.getSource("wikidata")) {
        map.addSource("wikidata", {
          type: "geojson",
          data: null,
          attribution: "Wikidata",
        });

        map.addLayer({
          id: "wikidata-circle",
          type: "circle",
          source: "wikidata",
          paint: {
            "circle-radius": 2,
          },
        });

        map.addLayer({
          id: "wikidata",
          type: "symbol",
          source: "wikidata",
          paint: {
            "text-opacity": 0.6,
          },
          layout: {
            "text-field": ["get", "name"],
            "text-font": ["Open Sans Semibold"],
            "text-size": 12,
            "text-offset": [0, 0.2],
            "text-anchor": "top",
          },
        });
      }
    }

    setLocationContext();
  }

  //
  // Set the map location context by reverse geocoding the current map location
  //

  function setLocationContext() {
    let querylngLat = map.getCenter();

    let reverseGeocodingUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${
      querylngLat.lng
    }%2C${querylngLat.lat}.json?access_token=${
      settings.map.accessToken
    }&worldview=${settings.map.worldview.toLocaleLowerCase()}&types=country%2Cregion%2Cdistrict%2Cpostcode%2Clocality%2Cplace%2Cneighborhood%2Caddress%2Cpoi&language=${
      settings.user.language
    }`;

    settings.map.locationContext.fetch = fetch(reverseGeocodingUrl)
      .then((resp) => resp.json())
      .then((data) => {
        // DEBUG CONTEXT
        // console.log(data);

        settings.map.locationContext.geojson = data;

        if (data.features.length) {
          settings.map.locationContext.iso_3166_1_label =
            data.features[data.features.length - 1][
              `text_${settings.user.language}`
            ];

          settings.map.locationContext.iso_3166_1 = data.features[
            data.features.length - 1
          ]["properties"]["short_code"].toUpperCase();

          settings.map.locationContext.text = "";

          data.features.forEach((feature) => {
            if (
              feature.place_type.indexOf("country") > -1 ||
              (feature.place_type.indexOf("region") > -1 &&
                map.getZoom() > 6) ||
              (feature.place_type.indexOf("district") > -1 && map.getZoom() > 9)
            ) {
              settings.map.locationContext.text +=
                feature.text +
                (feature.place_type.indexOf("country") == -1 ? ", " : " ");
            }
          });
        }

        updateMapStyle();

        return data;
      });
  }

  //
  // Update map style based on current location context
  //

  function updateMapStyle() {
    // Mask features not in current country

    if (settings.map.locationContext.iso_3166_1) {
      const iso_3166_1 = settings.map.locationContext.iso_3166_1;

      const maskableSourceLayers = [
        "place_label",
        "road",
        "country_boundaries",
        "admin",
      ];

      map
        .getStyle()
        .layers.filter(
          (layer) => maskableSourceLayers.indexOf(layer["source-layer"]) > -1
        )
        .forEach((layer) => {
          if (layer.type == "symbol") {
            map.setPaintProperty(layer.id, "text-opacity", [
              "match",
              ["get", "iso_3166_1"],
              iso_3166_1,
              1,
              0.5,
            ]);

            map.setLayoutProperty(layer.id, "symbol-sort-key", [
              "match",
              ["get", "iso_3166_1"],
              iso_3166_1,
              0,
              1,
            ]);

            map.setPaintProperty(layer.id, "icon-opacity", [
              "match",
              ["get", "iso_3166_1"],
              iso_3166_1,
              1,
              0.1,
            ]);
          }

          if (layer.type == "fill" && layer.id == "country-mask") {
            map.setPaintProperty(layer.id, "fill-color", [
              "case",
              ["in", iso_3166_1, ["get", "iso_3166_1"]],
              "hsla(0, 0%, 94%, 0)",
              ["match", ["get", "disputed"], ["true"], true, false],
              "hsla(36, 0%, 10%, 0.05)",
              "hsla(36, 0%, 100%, 0.5)",
            ]);
          }

          if (layer.type == "line") {
            if (layer.id == "country-mask-outline") {
              map.setPaintProperty(layer.id, "line-opacity", [
                "case",
                ["in", iso_3166_1, ["get", "iso_3166_1"]],
                1,
                0,
              ]);
            } else {
              const srcLineOpacity =
                map.getPaintProperty(layer.id, "line-opacity") || 1;

              if (
                Array.isArray(srcLineOpacity) &&
                (srcLineOpacity[1] == "zoom" || srcLineOpacity[2] == "zoom")
              ) {
                // TODO: https://github.com/publicmap/publicmap.github.io/issues/23
              } else {
                map.setPaintProperty(layer.id, "line-opacity", [
                  "match",
                  ["get", "iso_3166_1"],
                  iso_3166_1,
                  srcLineOpacity || 1,
                  0.3,
                ]);
              }
            }
          }
        });
    }

    if (settings.map.wikidata.isEnabled && map.getZoom() > 10) {
      getWikidataFeatures();
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

  function setLayerWorldview(layerId, worldview) {
    const worldviewFilter = [
      "all",
      [
        "any",
        ["in", worldview || settings.map.worldview, ["get", "worldview"]],
        ["==", "all", ["get", "worldview"]],
      ],
    ];

    map.setFilter(layerId, worldviewFilter);
  }

  // Rotate camera around point
  // https://docs.mapbox.com/mapbox-gl-js/example/animate-camera-around-point/
  function rotateCamera(timestamp) {
    // clamp the rotation between 0 -360 degrees
    // Divide timestamp by 100 to slow rotation to ~10 degrees / sec
    map.rotateTo((timestamp / 100) % 360, { duration: 0 });
    // Request the next frame of the animation.
    requestAnimationFrame(rotateCamera);
  }

  //
  // Data methods
  //

  function getWikidataFeatures() {
    Number.prototype.map = function (in_min, in_max, out_min, out_max) {
      return (
        ((this - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min
      );
    };

    let queryRadius = map.getZoom().map(10, 14, 8, 0.5);
    queryRadius = queryRadius > 0.5 ? queryRadius : 0.5;

    // Live query https://w.wiki/sNL
    const sparql = `
    SELECT ?item ?itemLabel (SAMPLE(?item_location) AS ?wkt) ?article WHERE {     
  SERVICE wikibase:around { 
  ?item wdt:P625 ?item_location .
  bd:serviceParam wikibase:center "Point(${map.getCenter().lng} ${
      map.getCenter().lat
    })"^^geo:wktLiteral .  
  bd:serviceParam wikibase:radius "${queryRadius}" 
}
    OPTIONAL{
?article schema:about ?item. 
  ?article schema:inLanguage "${settings.user.language}"
           }

SERVICE wikibase:label { bd:serviceParam wikibase:language "${
      settings.user.language
    },${settings.user.fallbackLanguage}". }
}
GROUP BY ?item ?itemLabel ?article
LIMIT 200
    `;
    queryWikidata(sparql).then((result) => {
      let geojson = {
        type: "FeatureCollection",
        features: [],
      };

      result.forEach((d) => {
        let feature = {
          type: "Feature",
          properties: {
            name: d.itemLabel.value,
            url: d.item.value,
          },
          geometry: wkt(d.wkt.value),
        };

        geojson.features.push(feature);
      });

      map.getSource("wikidata").setData(geojson);
    });
  }

  //
  // UI methods
  //

  function closeInfoPanel() {
    document.getElementById("info-panel").style.display = "none";
  }
</script>

<style>
  #map {
    height: 100vh;
    z-index: -1;
  }
  #locator-map {
    position: absolute;
    right: 10px;
    bottom: 10px;
  }
  section {
    z-index: 99;
    margin-top: 20px;
    margin-left: 50px;
    width: 400px;
  }

  :global(.uk-card-default) {
    background: #ffffffbd;
  }
  :global(#description data) {
    font-weight: bold;
  }

  :global(.mapboxgl-ctrl-geocoder.mapboxgl-ctrl) {
    width: 100%;
  }

  :global(.mapboxgl-control-container > *:not(.mapboxgl-ctrl-bottom-left) > *) {
    opacity: 0;
    transition: opacity 5s ease-out;
    z-index: 99;
  }
  :global(.mapboxgl-ctrl-attrib) {
    opacity: 1 !important;
    transition: opacity 0.1s ease-out;
    z-index: 99;
  }
  :global(.mapboxgl-control-container:hover
      > *:not(.mapboxgl-ctrl-bottom-left)
      > *) {
    opacity: 1;
    transition: opacity 0.1s ease-in;
  }
</style>

<div id="map">
  <Map
    bind:this={mapbox}
    accessToken={settings.map.accessToken}
    style={settings.map.styleUrl}
    options={{ hash: true, attributionControl: true, customAttribution: customAttribution }}
    on:ready={onMapReady}
    on:recentre={setLocationContext}
    version="v2.0.1">
    <TiltShift />

    <NavControl />
    <GeolocateControl
      position="top-right"
      options={{ trackUserLocation: true }}
      on:geolocate={onGeolocate} />
    <StylesControl styles={settings.map.styles} on:change={onStyleChange} />
    <InspectControl />
    <RulerControl />
    <ScaleControl position="bottom-left" />
  </Map>
</div>

<section id="info-panel" class="uk-position-absolute uk-position-top-left">
  <div class="uk-card uk-card-body uk-card-default uk-card-small uk-card-hover">
    {#if settings.map.title}
      <h2 class="uk-no-margin uk-heading-divider">{settings.map.title}</h2>
    {/if}

    <button
      type="button"
      uk-close
      style="position:absolute;top:10px;right:10px"
      on:click|once={closeInfoPanel} />

    {#if settings.map.description}
      <p>
        {@html sanitizeHtml(settings.map.description, {
          allowedAttributes: {
            data: ['data-lat', 'data-lng'],
          },
        })}
      </p>
    {/if}

    <div class="uk-position-relative">
      {#if settings.map.locationContext.iso_3166_1}
        <div
          class="uk-position-absolute uk-position-center-left"
          style="left:50px">
          {#await settings.map.locationContext.fetch}
            <span>...</span>
          {:then result}
            {#each result.features as feature}
              {#if feature.place_type.indexOf('country') > -1 || (feature.place_type.indexOf('region') > -1 && map.getZoom() > 6) || (feature.place_type.indexOf('district') > -1 && map.getZoom() > 9)}
                <a
                  target="_blank"
                  style="color:grey;text-decoration: underline"
                  href="https://www.wikidata.org/wiki/{feature.properties.wikidata}">
                  {feature.text}</a>{feature.place_type.indexOf('country') == -1 ? ', ' : ''}
              {/if}
            {/each}
          {/await}
        </div>
      {/if}

      <Geocoder
        bind:geocoder
        accessToken={settings.map.accessToken}
        types={['country', 'region', 'postcode', 'district', 'place', 'locality', 'neighborhood']}
        options={{ clearOnBlur: true, collapsed: true, marker: true, mapboxgl: mapbox }}
        on:ready={onGeocoderReady}
        on:result={onGeocoderResult} />
    </div>

    {#if settings.map.stylesheet}
      <span>Cartography:
        <a
          class="uk-link-reset"
          href={`https://api.mapbox.com/styles/v1/${settings.map.stylesheet.owner}/${settings.map.stylesheet.id}.html?fresh=true&title=copy&access_token=${settings.map.accessToken}${window.location.hash}`}>{settings.map.styleName ? settings.map.styleName + ' by ' + settings.map.stylesheet.owner : 'Loading'}</a></span>
    {/if}
  </div>
</section>

<div id="locator-map">
  {#if false && settings.map.filter.iso_3166_1}
    <img
      width="200"
      src={`https://api.mapbox.com/styles/v1/planemad/ckhw6q1000e0h19pckcjqadsr/static/0,10,0,0/600x300?access_token=${settings.map.accessToken}&amp;setfilter=["all",["any",["in","US",["get","worldview"]],["==","all",["get","worldview"]]],["match",["get","iso_3166_1"],["{settings.map.filter.iso_3166_1.toUpperCase()}"],true,false]]&amp;layer_id=selected-countries`} />
  {/if}
</div>