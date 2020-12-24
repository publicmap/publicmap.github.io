# public map

A public map for the world.

## URL options

**Page**

- `title` Title for the map
- `description` Description or caption for the map

**Mapbox API**

- `style` A mapbox style url. eg. `mapbox://styles/mapbox/satellite-streets-v11`
- `attribution` Text for map attribution
- `access_token` A mapbox access token to use for accessing the map style
- `worldview` A worldview to use for representation of disputed boundaries `US`=de facto), `CN`=China `IN`=India `JP`=Japan 

## Development

This is a [Sapper](https://github.com/sveltejs/sapper) project based on [sapper-template#webpack](sveltejs/sapper-template#webpack).

**Installation**

```
git clone https://github.com/publicmap/atlas.git
cd atlas
npm install
```

**Develop**

The page sources can be found in `src/routes`

```
npm run dev
```

Open `http://localhost:3000/atlas` in the browser

### Deployment

The `main` branch is automatically built to `gh-pages` branch and deployed to https://publicmap.github.io/ using .github/actions