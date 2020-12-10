<!-- Map ruler control https://github.com/bravecow/mapbox-gl-controls -->

<script>
	import { getContext } from 'svelte'
	import { contextKey } from '../mapbox.js'

	const { getMap, getMapbox } = getContext(contextKey)
	const map = getMap()
	const mapbox = getMapbox()

	// https://github.com/bravecow/mapbox-gl-controls#ruler-control
	import RulerControl from 'mapbox-gl-controls/lib/ruler';

	export let position = 'bottom-right'
	export let options = {}
	
	map.addControl(new RulerControl(), position)

</script>