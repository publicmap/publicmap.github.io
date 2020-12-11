<script>
  export let segment;
  export let queryString = null;
</script>

<style>
  nav {
    position: absolute;
    z-index: 20;
  }
</style>


  <nav class="uk-navbar uk-navbar-container uk-margin uk-navbar-transparent">
    <div class="uk-navbar-left">
        <a class="uk-navbar-toggle" uk-navbar-toggle-icon href="#" uk-toggle="target: #offcanvas-nav-primary"></a>
    </div>
</nav>

  <div id="offcanvas-nav-primary" uk-offcanvas="overlay: true">
    <div class="uk-offcanvas-bar uk-flex uk-flex-column" style="background:#222222d9">
      <ul class="uk-nav uk-nav-primary uk-nav-center uk-margin-auto-vertical">
        <li class={segment === undefined ? 'uk-active' : ''}>
          <a
            aria-current={segment === undefined ? 'page' : undefined}
            href={segment === undefined ? undefined: queryString ? '.?' + queryString : '.'}><span
              uk-icon="icon: world" />
            map</a>
        </li>
        <li class={segment === 'place' ? 'uk-active' : ''}>
          <a
            rel="prefetch"
            aria-current={segment === 'place' ? 'page' : undefined}
            href="place"><span uk-icon="icon: list" />
            places</a>
        </li>
        <li class={segment === 'about' ? 'uk-active' : ''}>
          <a
            aria-current={segment === 'about' ? 'page' : undefined}
            href="about">about</a>
        </li>
      </ul>
    </div>
  </div>
