<script>
  import Mapbox from "../components/App.svelte";
  import { onMount } from "svelte";

  let mapbox;

  // onMount(() => {
  //   // This handler will be executed every time the cursor
  //   // is moved over a different list item
  //   let test = document.getElementById("map");
  //   test.addEventListener(
  //     "mousemove",
  //     function (event) {
  //       let map = mapbox;

  //       var features = map.queryRenderedFeatures([event.layerX, event.layerY]);

  //       console.log(
  //         features.map(
  //           (f) =>
  //             `${f.sourceLayer}/${f.layer.id}:${JSON.stringify(f.properties)}`
  //         )
  //       );
  //     },
  //     false
  //   );
  // });
</script>

<style>
</style>

<svelte:head>
  
  <title>Public Map</title>

  <!-- Global site tag (gtag.js) - Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-VKRDLTY01M">
  </script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      dataLayer.push(arguments);
    }
    gtag("js", new Date());

    gtag("config", "G-VKRDLTY01M");
  </script>

</svelte:head>

<Mapbox bind:map={mapbox} />
