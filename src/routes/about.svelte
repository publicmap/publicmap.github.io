<script>
  import Panel from "../components/Panel.svelte";
  import Map from "../components/Map.svelte";

function mapProgram(map){
	console.log(map);
}
</script>

<svelte:head>
  <title>About</title>
</svelte:head>

<Panel>
  <h1>About</h1>

  <p>This is the 'about' page. There's not much here.</p>
</Panel>

<Map program={mapProgram}/>
