// Ordinarily, you'd generate this data from markdown files in your
// repo, or fetch them from a database of some kind. But in order to
// avoid unnecessary dependencies in the starter template, and in the
// service of obviousness, we're just going to leave it here.

// This file is called `_posts.js` rather than `posts.js`, because
// we don't want to create an `/blog/posts` route — the leading
// underscore tells Sapper not to do that.

const countries = [
	{
		title: 'India',
		slug: 'in',
		html: `
			<h2>Metropolitan cities</h2>
			<ul><li><a href='#11.67/28.5957/77.1956/14.7/46'>Delhi-National Capital Region</a></li>
				<li><a href='#11.24/18.9869/72.872/41.2/56'>Mumbai</a></li>
				<li><a href='#11.14/12.9534/77.6072/13.5/29'>Bengaluru</a></li>
				<li><a href='#11.28/17.3607/78.4872/14.4/29'>Hyderabad</a></li>
				<li><a href='#11.26/13.0798/80.223/-70.7/39'>Chennai</a></li>
				<li><a href='#12.3/22.56665/88.34742/14.3/17'>Kolkata</a></li>
				<li><a href='#11.79/23.0441/72.61814/-43.4/56'>Ahmedabad-Gandhinagar</a></li>
			</ul>
		`
	}
];

countries.forEach(country => {
	country.html = country.html.replace(/^\t{3}/gm, '');
});

export default countries;
