<!-- https://docs.mapbox.com/mapbox-gl-js/api/markers/#icontrol -->
<script>
	import { getContext } from "svelte";
	import { contextKey } from "../mapbox.js";

	const { getMap, getMapbox } = getContext(contextKey);
	const map = getMap();
	const mapbox = getMapbox();

	// https://github.com/bravecow/mapbox-gl-controls#ruler-control

	export let position = "bottom-left";
	export const options = {};

	// Control implemented as ES6 class
	const SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'de', 'ru', 'zh', 'pt', 'ar', 'ja', 'ko', 'mul'];


/**
 * Localize map. Language can be set dynamically with `.setLanguage(lang)` method.
 * @param {Object} options
 * @param {Array} [options.supportedLanguages] 
 */

export class LanguageControl {
  constructor(options = {}) {
    this.container = document.createElement('div');
	// this.titleListener = this.titleListener.bind(this);
  }

  onAdd(map) {
    this.map = map;
    this.map.on('mapTitle', this.titleListener);
    return this.container;
  }

  onRemove() {
    this.map.off('mapTitle', this.titleListener);
    this.map = undefined;
  }

  styleChangeListener() {
    this.map.off('mapTitle', this.titleListener);
    this.setTitle('HI');
  }

  setTitle(title) {
	  return title
	};
	

  }




	map.addControl(new LanguageControl(), position);
</script>

<!-- Map title control https://github.com/bravecow/mapbox-gl-controls -->
