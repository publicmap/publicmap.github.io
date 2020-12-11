<script>
  export let segment;
  export let queryString = null;
</script>

<style>
  nav{
		background-color: rgb(232, 232, 232);
	}
</style>

<nav class="uk-background-muted" style="padding:2px">
  <ul class="uk-subnav uk-margin-remove">
    <li class={segment === undefined ? 'uk-active' : ''}>
    <a aria-current={segment === undefined ? 'page' : undefined} href="{ queryString ? ".?" + queryString : "." }"><span uk-icon="icon: world" /></a>
    </li>

    <!-- for the blog link, we're using rel=prefetch so that Sapper prefetches
		     the blog data when we hover over the link or tap it on a touchscreen -->
    <li class={segment === 'place' ? 'uk-active' : ''}>
      <a
        rel="prefetch"
        aria-current={segment === 'place' ? 'page' : undefined}
        href="place">Places</a>
    </li>
    <li class={segment === 'about' ? 'uk-active' : ''}>
      <a
        aria-current={segment === 'about' ? 'page' : undefined}
        href="about">about</a>
    </li>
  </ul>
</nav>
