<script context="module">
	export function preload() {
		return this.fetch(`place.json`)
			.then((r) => r.json())
			.then((countries) => {
				return { countries };
			});
	}
</script>

<script>
	export let countries;

	import mapboxCountries from "../../data/mapbox-countries-v1.json";

	// Filter by selected worldview and undisputed countries
	let countryData = mapboxCountries.filter(
		(d) =>
			(d.worldview == "all" || d.worldview == "US") &&
			(d.description == "sovereign state" ||
				d.description == "dependent territory")
		// DEBUG: Filter specific countries
		// (d.wikidata_id == "Q142" ||
		//   d.wikidata_id == "Q1044" ||
		//   d.wikidata_id == "Q1049" ||
		//   d.wikidata_id == "Q237")
	);

	console.log(countryData);
</script>

<style>
	ul {
		margin: 0 0 1em 0;
		line-height: 1.5;
	}
</style>

<svelte:head>
	<title>Country index</title>
</svelte:head>

<div class="uk-padding">
	<h2>Places</h2>

	<ul>
		{#each countries as country}
			<!-- we're using the non-standard `rel=prefetch` attribute to
				tell Sapper to load the data for the page as soon as
				the user hovers over the link or taps it, instead of
				waiting for the 'click' event -->
			<li>
				<a
					rel="prefetch"
					href="place/{country.slug}">{country.title}</a>
			</li>
		{/each}
	</ul>

	<h2>Countries</h2>
	<ul>
		{#each countryData as country}
			<!-- we're using the non-standard `rel=prefetch` attribute to
				tell Sapper to load the data for the page as soon as
				the user hovers over the link or taps it, instead of
				waiting for the 'click' event -->
			<li style="width:400px;display:inline-block">
			<a rel="prefetch" href="#4/{JSON.parse(country.centroid)[1]}/{JSON.parse(country.centroid)[0]}">
					{#if country.hasOwnProperty('iso_3166_1')}
						<kbd>{country.iso_3166_1}</kbd>
					{/if}
					{country.name}
					{country.name !== country.name_en ? '/ ' + country.name_en : ''}
				</a>
			</li>
		{/each}
	</ul>
</div>
