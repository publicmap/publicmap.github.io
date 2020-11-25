<script>
  import Map from "../components/Map.svelte";
  import Panel from "../components/Panel.svelte";

  let map;
</script>

<style>
</style>

<svelte:head>
  <title>Open Atlas</title>
</svelte:head>

<Panel>
  <div id="panel" class="uk-position-absolute uk-padding-small uk-width-1-1">
    <h1>A!</h1>

    <p>Hi
    </p>
  </div>
</Panel>

<Map bind:map />
