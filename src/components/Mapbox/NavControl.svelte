<!-- Map ruler control https://github.com/bravecow/mapbox-gl-controls -->
<script>
	import { getContext } from "svelte";
	import { contextKey } from "../mapbox.js";

	const { getMap, getMapbox } = getContext(contextKey);
	const map = getMap();
	const mapbox = getMapbox();

	// https://github.com/bravecow/mapbox-gl-controls#compass-control
	import CompassControl from "mapbox-gl-controls/lib/compass";

	export let position = "top-right";

	map.addControl(new CompassControl(), position);

	// https://github.com/bravecow/mapbox-gl-controls#compass-control
	import ZoomControl from "mapbox-gl-controls/lib/zoom";

	map.addControl(new ZoomControl(), position);
</script>


