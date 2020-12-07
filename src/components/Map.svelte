<script>
  import { onMount } from "svelte";
  import mapboxgl from "mapbox-gl";

  // Worldview for disputed areas.
  // https://docs.mapboxgl.com/vector-tiles/reference/mapbox-boundaries-v3/#--polygon---worldview-text
  export let map, settings = {
    style: "satellite",
    worldview: "US",
    langauge: "en",
    location: {
      bounds: [
        [-10.76, 49.864],
        [1.863, 59.479],
      ],
    },
  };
  mapboxgl.accessToken =
    "pk.eyJ1IjoicGxhbmVtYWQiLCJhIjoiY2todmxnbDFyMDFmcDJ5cGthZ2Vqenh3OSJ9.Plw3yyu23yPZFPIiuatpKQ";


  // https://docs.mapbox.com/api/maps/#mapbox-styles
  let mapStyles = {
    default: "mapbox://styles/mapbox/streets-v11",
    outdoor: "mapbox://styles/mapbox/outdoors-v11",
    satellite: "mapbox://styles/mapbox/satellite-v9",
    "satellite-map": "mapbox://styles/mapbox/satellite-streets-v11",
  };

  // Default map program
  export let program = function (map) {
    console.log(map);
  };

  let container;
  let options;

  function resetView() {
    map.fitBounds(settings.location.bounds);
  }

  onMount(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/mapbox-gl/dist/mapbox-gl.css";

    // Detect user settings
    let locale = navigator.language;

    let localeLanguage = locale.split("-")[0] || settings.langauge;
    let localeCountry = locale.split("-")[1] || settings.worldview;

    link.onload = () => {
      map = new mapboxgl.Map({
        container,
        style: mapStyles[settings.style],
        interactive: true,
        ...options,
      });
      // map.scrollZoom.disable();

      mapboxgl.setRTLTextPlugin(
        "https://api.mapboxgl.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js",
        null,
        true // Lazy load the plugin
      );

      var nav = new mapboxgl.NavigationControl();
      map.addControl(nav, "top-right");

      var scale = new mapboxgl.ScaleControl({
        maxWidth: 80,
      });
      map.addControl(scale, "bottom-right");

      map.on("load", function () {
        initMap();

        program(map);
      });
    };

    document.head.appendChild(link);

    return () => {
      map.remove();
      link.parentNode.removeChild(link);
    };
  });

  function initMap() {}


  // var traceRequest = new XMLHttpRequest();
  //       traceRequest.open("GET", 'https://www.cloudflare.com/cdn-cgi/trace');
  //       traceRequest.onreadystatechange = () => {
  //           if (traceRequest.readyState == XMLHttpRequest.DONE) {
  //               let worldView = "US"
  //               if (traceRequest.status == 200) {
  //                   worldView = traceRequest.responseText.match(/loc=([^\n+]*)/)[1]
  //                   if (!(worldViews.includes(worldView.trim().toUpperCase()))) {
  //                       worldView = 'US'
  //                   }
  //               }
  //               this.host.persistProperties(<VisualObjectInstancesToPersist>{
  //                   merge: [{
  //                       objectName: "choropleth",
  //                       selector: null,
  //                       properties: {
  //                           worldView: worldView,
  //                       }
  //                   }]
  //               })
  //           }
  //       }
  //       traceRequest.send(null);


</script>

<style>
  div {
    width: 60%;
    height: 100%;
    position: fixed;
    right: 0;
  }
  @media (max-width: 1000px) {
    div {
      width: 100%;
      height: 60%;
      position: absolute;
    }
  }
</style>

<div id="map" bind:this={container}>
  {#if map}
    <slot />
  {/if}
</div>
