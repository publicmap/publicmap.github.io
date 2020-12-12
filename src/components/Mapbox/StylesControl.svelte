<!-- Map style switcher control https://github.com/bravecow/mapbox-gl-controls -->
<script>
	// Mapbox context
	import { getContext, createEventDispatcher } from "svelte";
	import { contextKey } from "../mapbox.js";

	const dispatch = createEventDispatcher()

	const { getMap, getMapbox } = getContext(contextKey);
	const map = getMap();
	const mapbox = getMapbox();

	// Mapbox control plugin
	// https://github.com/bravecow/mapbox-gl-controls#styles-control

	import StylesControl from "mapbox-gl-controls/lib/styles";

	export let styles = [
		{
			label: "Streets",
			styleName: "Mapbox Streets",
			styleUrl: "mapbox://styles/mapbox/streets-v9",
		},
		{
			label: "Satellite",
			styleName: "Satellite",
			styleUrl: "mapbox://styles/mapbox/satellite-v9",
		},
	];

	export let position = "bottom-right";

	map.addControl(
		new StylesControl({
			styles,
			onChange: (style) => dispatch('change', { style })
		}),
		position
	);
</script>


