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
    user:{
      location: {lng: null, lat: null},
      iso_3166_1: null,
      locale: null,
    }
  };
  mapboxgl.accessToken =
    "pk.eyJ1IjoicGxhbmVtYWQiLCJhIjoiY2l3ZmNjNXVzMDAzZzJ0cDV6b2lkOG9odSJ9.eep6sUoBS0eMN4thZUWpyQ";


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

    //
    // Construct map
    //

    link.onload = () => {

      // Create a basic map

      map = new mapboxgl.Map({
        container,
        style: mapStyles[settings.style],
        interactive: true,
        ...options,
      });

      console.log('hi')
      detectUserSettings();

      // Enable RTL support
      // https://docs.mapbox.com/mapbox-gl-js/example/mapbox-gl-rtl-text/
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

      //
      // Map logic
      //

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

  function initMap() {



  }






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
