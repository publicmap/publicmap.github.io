<script>
  export let segment;
</script>

<style>
  nav{
		background-color: rgb(232, 232, 232);
	}
</style>

<nav class="uk-padding-small uk-background-muted">
  <ul class="uk-subnav uk-margin-remove">
    <li><span uk-icon="icon: world" /></li>
    <li class={segment === undefined ? 'uk-active' : ''}>
      <a aria-current={segment === undefined ? 'page' : undefined} href=".">Atlas</a>
    </li>

    <!-- for the blog link, we're using rel=prefetch so that Sapper prefetches
		     the blog data when we hover over the link or tap it on a touchscreen -->
    <li class={segment === 'blog' ? 'uk-active' : ''}>
      <a
        rel="prefetch"
        aria-current={segment === 'blog' ? 'page' : undefined}
        href="blog">news</a>
    </li>
    <li class={segment === 'about' ? 'uk-active' : ''}>
      <a
        aria-current={segment === 'about' ? 'page' : undefined}
        href="about">about</a>
    </li>
  </ul>
</nav>
