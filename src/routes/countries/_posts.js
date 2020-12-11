// Ordinarily, you'd generate this data from markdown files in your
// repo, or fetch them from a database of some kind. But in order to
// avoid unnecessary dependencies in the starter template, and in the
// service of obviousness, we're just going to leave it here.

// This file is called `_posts.js` rather than `posts.js`, because
// we don't want to create an `/blog/posts` route — the leading
// underscore tells Sapper not to do that.

const posts = [
	{
		title: 'India',
		slug: 'india',
		html: `
			<h2>Metropolitan Cities</h2>
			<ul>
				<li><a href='#11.24/18.9869/72.872/41.2/56'>Mumbai</a></li>
				<li><a href='#11.79/23.0441/72.61814/-43.4/56'>Ahmedabad-Gandhinagar</a></li>
				<li><a href='#11.67/28.5957/77.1956/14.7/46'>Delhi-National Capital Region</a></li>
				<li><a href='#12.3/22.56665/88.34742/14.3/17'>Kolkata</a></li>
			</ul>
			`
	}
];

posts.forEach(post => {
	post.html = post.html.replace(/^\t{3}/gm, '');
});

export default posts;
