<script>
  import Panel from "../components/Panel.svelte";
  import { Map, Geocoder, Marker, controls } from "@beyonk/svelte-mapbox";
  // const fetch = require('node-fetch');

  const { GeolocateControl, NavigationControl, ScaleControl } = controls;

  import countries from "../data/mapbox-countries-v1.json";

  export let mapbox, map, geocoder;

  export let settings = {
    user: {
      locale: "en-US",
      language: "en",
      fallbackLanguage: "en", // en es ar ru zh pt
      location: {
        geoip: null,
        gps: null,
      },
    },
    map: {
      accessToken:
        "pk.eyJ1IjoicGxhbmVtYWQiLCJhIjoiY2l3ZmNjNXVzMDAzZzJ0cDV6b2lkOG9odSJ9.eep6sUoBS0eMN4thZUWpyQ",
      // Switch to pk.eyJ1IjoicGxhbmVtYWQiLCJhIjoiY2l3ZmNjNXVzMDAzZzJ0cDV6b2lkOG9odSJ9.eep6sUoBS0eMN4thZUWpyQ
      worldview: "US", // Set worldview to use for disputed areas
      style: "mapbox://styles/planemad/ckgopajx83l581bo6qr5l86yg",
      locationContext: null,
      filter: {
        iso_3166_1: null,
        iso_3166_1_label: "...",
        iso_3166_2: null,
        iso_3166_2_label: null,
      },
    },
  };

  

  function onGeocoderResult(e) {
    console.log(e.detail.result.center);
    map.setCenter(e.detail.result.center);
  }

  function onGeolocate(e) {
    console.log(e.detail);
  }

  function onMapReady(e) {

    map = mapbox.getMap();

    detectUserSettings()
    getLocationContext(e);

    initMap();
  }

  var customData = {
    features: [
      {
        type: "Feature",
        properties: {
          title: "Lincoln Park",
          description: "A northside park that is home to the Lincoln Park Zoo",
        },
        geometry: {
          coordinates: [-87.637596, 41.940403],
          type: "Point",
        },
      },
      {
        type: "Feature",
        properties: {
          title: "Burnham Park",
          description: "A lakefront park on Chicago's south side",
        },
        geometry: {
          coordinates: [-87.603735, 41.829985],
          type: "Point",
        },
      },
      {
        type: "Feature",
        properties: {
          title: "Millennium Park",
          description:
            "A downtown park known for its art installations and unique architecture",
        },
        geometry: {
          coordinates: [-87.622554, 41.882534],
          type: "Point",
        },
      },
      {
        type: "Feature",
        properties: {
          title: "Grant Park",
          description:
            "A downtown park that is the site of many of Chicago's favorite festivals and events",
        },
        geometry: {
          coordinates: [-87.619185, 41.876367],
          type: "Point",
        },
      },
      {
        type: "Feature",
        properties: {
          title: "Humboldt Park",
          description: "A large park on Chicago's northwest side",
        },
        geometry: {
          coordinates: [-87.70199, 41.905423],
          type: "Point",
        },
      },
      {
        type: "Feature",
        properties: {
          title: "Douglas Park",
          description:
            "A large park near in Chicago's North Lawndale neighborhood",
        },
        geometry: {
          coordinates: [-87.699329, 41.860092],
          type: "Point",
        },
      },
      {
        type: "Feature",
        properties: {
          title: "Calumet Park",
          description:
            "A park on the Illinois-Indiana border featuring a historic fieldhouse",
        },
        geometry: {
          coordinates: [-87.530221, 41.715515],
          type: "Point",
        },
      },
      {
        type: "Feature",
        properties: {
          title: "Jackson Park",
          description:
            "A lakeside park that was the site of the 1893 World's Fair",
        },
        geometry: {
          coordinates: [-87.580389, 41.783185],
          type: "Point",
        },
      },
      {
        type: "Feature",
        properties: {
          title: "Columbus Park",
          description: "A large park in Chicago's Austin neighborhood",
        },
        geometry: {
          coordinates: [-87.769775, 41.873683],
          type: "Point",
        },
      },
    ],
    type: "FeatureCollection",
  };

  function getLocationContext(e) {
    let querylngLat = map.getCenter();
    
    let reverseGeocodingUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${
      querylngLat.lng
    }%2C${querylngLat.lat}.json?access_token=${
      settings.map.accessToken
    }&cachebuster=1606707965137&autocomplete=true&worldview=${settings.map.worldview.toLocaleLowerCase()}&types=country%2Cregion%2Cdistrict%2Cpostcode%2Clocality%2Cplace%2Cneighborhood%2Caddress%2Cpoi&language=${
      settings.user.language
    }`;
    fetch(reverseGeocodingUrl)
      .then((resp) => resp.json())
      .then((data) => {
        console.log(data);
        settings.map.locationContext = data;
        settings.map.filter.iso_3166_1_label =
          data.features[data.features.length - 1][
            `text_${settings.user.language}`
          ];
        settings.map.filter.iso_3166_1 =
          data.features[data.features.length - 1]["properties"]["short_code"];

        styleMap(map);
      });
  }

  function updateMapFilter() {
    styleMap();
  }

  // Style the map to highlight a country
  function styleMap(map) {
    let iso_3166_1 = settings.map.filter.iso_3166_1.toUpperCase();

    // console.log(map.getMap())

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


  function detectUserSettings(){

//     fetch('https://www.cloudflare.com/cdn-cgi/trace').then(resp=>resp.json())
// .then(data=>console.log(data))
  // var traceRequest = new XMLHttpRequest();
  //       traceRequest.open("GET", 'https://www.cloudflare.com/cdn-cgi/trace');
  //       traceRequest.onreadystatechange = () => {
  //           if (traceRequest.readyState == XMLHttpRequest.DONE) {
  //               let worldView = "US"
  //               if (traceRequest.status == 200) {
  //                   worldView = traceRequest.responseText.match(/loc=([^\n+]*)/)[1]
                    
  //                   console.log(worldView)
  //               }
  //           }
  //       }
  //       traceRequest.send(null);

  }

  function initMap(){
    map.addSource('mapbox-dem', {
'type': 'raster-dem',
'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
'tileSize': 512,
'maxzoom': 14
});
// add the DEM source as a terrain layer with exaggerated height
map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });
 
// add a sky layer that will show when the map is highly pitched
map.addLayer({
'id': 'sky',
'type': 'sky',
'paint': {
'sky-type': 'atmosphere',
'sky-atmosphere-sun': [0.0, 0.0],
'sky-atmosphere-sun-intensity': 15
}
});
  }


</script>

<style>
  #map {
    height: 100vh;
  }
  #locator-map{
    position: absolute;
    right: 10px;
    bottom:10px;
  }
  section {
    background-color: rgba(255, 255, 255, 0.5);
  }
  :global(#map .mapboxgl-control-container > *) {
    opacity: 0.5;
    z-index: 10;
  }
  :global(#map:hover .mapboxgl-control-container > *) {
    opacity: 1;
  }
</style>

<Panel>
  <section class="uk-padding-small">
    <h1 class="uk-no-margin">{settings.map.filter.iso_3166_1_label}</h1>
    <Geocoder
      bind:this={geocoder}
      accessToken={settings.map.accessToken}
      options={{ localGeocoder: forwardGeocoder, countries: settings.map.filter.iso_3166_1 }}
      placeholder={'Find a place'}
      on:result={onGeocoderResult} />
  </section>
</Panel>

<div id="map">

  <Map
    bind:this={mapbox}
    accessToken={settings.map.accessToken}
    style={settings.map.style}
    options={{hash:true}}
    on:ready={onMapReady}
    on:recentre={getLocationContext}
    version="v2.0.0">
    <GeolocateControl
      position="top-right"
      options={{ trackUserLocation: true }}
      on:geolocate={onGeolocate} />
    <NavigationControl />
    <ScaleControl />
  </Map>

</div>

<div id="locator-map">    
  {#if settings.map.filter.iso_3166_1}
  <img width=200 src='https://api.mapbox.com/styles/v1/planemad/ckhw6q1000e0h19pckcjqadsr/static/0,10,0,0/600x300?access_token=pk.eyJ1IjoicGxhbmVtYWQiLCJhIjoiemdYSVVLRSJ9.g3lbg_eN0kztmsfIPxa9MQ&amp;setfilter=["all",["any",["in","US",["get","worldview"]],["==","all",["get","worldview"]]],["match",["get","iso_3166_1"],["{settings.map.filter.iso_3166_1.toUpperCase()}"],true,false]]&amp;layer_id=selected-countries'>
  {/if}
</div>
