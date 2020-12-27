<!-- Mapbox GL v2.0 photo tilt shift -->
<!-- Based on CC BY 4.0 code by Steve Attewell https://twitter.com/steveattewell -->
<!-- view-source:https://steveattewell.com/mapbox-photo/  -->
<script>
	import { getContext } from "svelte";
	import { contextKey } from "../mapbox.js";

	const { getMap } = getContext(contextKey);
	const map = getMap();

	// Insert blur and mist divs just above the map container
	const mapContainer = document.getElementsByClassName(
		"mapboxgl-canvas-container"
	)[0];
	mapContainer.insertAdjacentHTML(
		"afterend",
		'<div id="tiltShift"></div><div id="mist"></div>'
	);
	var tiltShiftBlur = document.getElementById("tiltShift");
	var mist = document.getElementById("mist");

	// SOME SETTINGS TO PLAY WITH
	// ==========================
	// change the color of the mist in the CSS above: e.g. background-color: blanchedalmond;
	export const mistAmount = 0.4; // how misty should it be? 0.6 is subtle and nice. Practical values are from 0.5 to 1.5
	export const tiltShiftMaxBlur = 1; // The maximum blur, in pixels, when the tilt-shift effect is fully on. 3 pixels is subtle and nice
	//

	// These easing functions are useful to ensure the amount of blur or mist is
	// not applied in a linear fashion when zooming in and out.
	function easeInCubic(x) {
		return x * x * x;
	}

	function easeOutCubic(x) {
		return 1 - Math.pow(1 - x, 3);
	}

	// apply a style to the DIVs that contain the blur and mist effects
	tiltShiftBlur.style.display = "block";
	mist.style.display = "block";

	addPhotoEffects();

	// adjust the photo effects every time the map moves...
	map.on("move", function () {
		addPhotoEffects();
	});

	// Here's the clever bit...
	function addPhotoEffects() {
		// Get the map state and preapare some useful normalized values of zoom and pitch
		// ==============================================================================
		var pitch = map.getPitch();
		var zoom = map.getZoom() - 4; // minus 4 from zoom so that it starts at zero
		var fractionZoomedOut = 1 - zoom / 18; // normalize the zoom so it is now constrained bewteen 0 and 1
		var fractionPitched = pitch / 80; // normalise pitch so that its now a value between 0 and 1 (zero being when you're looking down from above)
		var fractionPitchedBackwards = Math.max(1 - pitch / 80, 0); // normalise pitch so that its now a value between 1 and 0 (zero being when you're looking to the horizon)

		/*  Set the CSS values that control the tilt-shift and mist
                The numbers here look complex (like the amount of blur)...
                 blur is calculated by: (tiltShiftMaxBlur * easeInCubic(fractionPitched)) * fractionZoomedOut
                 , but each is simply similar to:
                 1) an amount of the effect: tiltShiftMaxBlur 
                 2) an adjustment applied to that number and takes into account how pitched the map view is (in this case an easing function is also used): tiltShiftMaxBlur * easeInCubic(fractionPitched)
                 3) another adjustment applied to all of the above which ajusts the effect given how zoomed out we are: (tiltShiftMaxBlur * easeInCubic(fractionPitched)) * fractionZoomedOut   
             */
		// ==========================================================
		// Adjust the tilt-shift effect. The result of this is...
		// the more pitched your viewpoint, the stronger the blur
		// and when you're very close to the ground, the blur effect is reduced
		var tiltShiftBackdropFilter =
			"blur(" +
			tiltShiftMaxBlur *
				easeInCubic(fractionPitched) *
				fractionZoomedOut +
			"px)";
		var tiltShiftGradientBlackPoint =
			75 + 25 * easeOutCubic(fractionPitchedBackwards);

		tiltShiftBlur.style.backdropFilter = tiltShiftBackdropFilter;
		tiltShiftBlur.style.webkitBackdropFilter = tiltShiftBackdropFilter;

		// this needs to be styled in two different ways to support the most browsers
		tiltShiftBlur.style.webkitMaskImage =
			"-webkit-gradient(linear, left bottom, left top, from(black), color-stop(5%, black), color-stop(45%, rgba(0, 0, 0, 0)), color-stop(55%, rgba(0, 0, 0, 0)), color-stop(" +
			tiltShiftGradientBlackPoint +
			"%, black), to(black))";
		tiltShiftBlur.style.maskImage =
			"linear-gradient(0deg, black 0%, black 5%, rgba(0, 0, 0, 0) 45%, rgba(0, 0, 0, 0) 55%, black " +
			tiltShiftGradientBlackPoint +
			"%)";

		// Adjust mist Effect based on camera pitch and zoom level. The result of this is...
		// the further you are from the ground, the stronger the mist effect
		// when you're looking stright down on the map from above the mist effect tends toward a solid block (but never a completely solid block because... nature). The mist tends toward a linear gradient (transparent at the bottom, more solid at the top, you know, like mist!) the more your view is pitched
		var bottomMistOpacity =
			mistAmount * (fractionPitchedBackwards * 0.5) * fractionZoomedOut;
		var topMistOpacity = mistAmount * fractionZoomedOut;

		// this needs to be styled in two different ways to support the most browsers
		mist.style.maskImage =
			"linear-gradient(0deg, rgba(0, 0, 0, " +
			bottomMistOpacity +
			") 0%, rgba(0, 0, 0, " +
			topMistOpacity +
			") 100%)";
		mist.style.webkitMaskImage =
			"-webkit-gradient(linear, left bottom, left top, color-stop(0%, rgba(0, 0, 0, " +
			bottomMistOpacity +
			")), color-stop(100%, rgba(0, 0, 0, " +
			topMistOpacity +
			")))";
	}
</script>

<style>
	:global(#tiltShift) {
		display: none; /* this gets turned on by the javascript */
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		z-index: 2;
		pointer-events: none; /* Ensure the mouse pointer can't interact with this layer */
	}

	:global(#mist) {
		display: none; /* this gets turned on by the javascript */
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		z-index: 3;
		pointer-events: none;
		background-color: blanchedalmond; /* change the mist colour here */
	}
</style>

<!-- Mapbox GL v2.0 photo tilt shift -->
<!-- Based on CC BY 4.0 code by Steve Attewell https://twitter.com/steveattewell -->
