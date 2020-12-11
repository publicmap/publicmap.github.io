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
	<h1>Countries</h1>

	<ul>
		{#each countries as country}
			<!-- we're using the non-standard `rel=prefetch` attribute to
				tell Sapper to load the data for the page as soon as
				the user hovers over the link or taps it, instead of
				waiting for the 'click' event -->
			<li><a rel="prefetch" href="place/{country.slug}">{country.title}</a></li>
		{/each}
	</ul>
</div>
