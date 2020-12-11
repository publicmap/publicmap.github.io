import countries from './_countries.js';

const contents = JSON.stringify(countries.map(country => {
	return {
		title: country.title,
		slug: country.slug
	};
}));

export function get(req, res) {
	res.writeHead(200, {
		'Content-Type': 'application/json'
	});

	res.end(contents);
}