<!-- Map ruler control https://github.com/bravecow/mapbox-gl-controls -->

<script>
	import { getContext } from 'svelte'
	import { contextKey } from '../mapbox.js'

	const { getMap, getMapbox } = getContext(contextKey)
	const map = getMap()
	const mapbox = getMapbox()

	// import InspectControl from 'mapbox-gl-controls/lib/inspect';
	import InspectControl from 'mapbox-gl-controls/lib/inspect';

	export let position = 'bottom-right'
	export const options = {}
	
	map.addControl(new InspectControl(options), position);

</script>