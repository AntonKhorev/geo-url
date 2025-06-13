import * as fs from "fs/promises"
import { spawn } from "child_process"
import { rollup } from "rollup"
import alias from "@rollup/plugin-alias"
import { nodeResolve } from "@rollup/plugin-node-resolve"

const packageJson = JSON.parse(await fs.readFile("package.json", "utf-8"))

await cleanupDirectory("pages")
await generateJsdoc("pages")
await generateDemos()

async function cleanupDirectory(dir) {
	await fs.mkdir(dir, { recursive: true })
	for (const filename of await fs.readdir(dir)) { // delete contents instead of the whole dir because live server doesn't like the dir disappearing
		await fs.rm(`${dir}/${filename}`, { recursive: true, force: true })
	}
}

function generateJsdoc(dir) {
	const filenames = ["src/geo-params.js", "src/geo-url.js", "src/wgs84-geo-url.js", "README.md"]
	const child = spawn("npx", ["jsdoc", ...filenames, "-c", "jsdoc/conf.json", "-d", dir])
	return new Promise((resolve, reject) => {
		child.on('error', reject)
		child.on('close', code => code == 0 ? resolve() : reject())
	})
}

async function generateDemos() {
	await fs.copyFile("node_modules/leaflet/dist/leaflet.css", "pages/leaflet.css")
	await fs.cp("node_modules/leaflet/dist/images", "pages/images", { recursive: true })
	await fs.copyFile("node_modules/ol/ol.css", "pages/openlayers.css")
	await fs.copyFile("node_modules/maplibre-gl/dist/maplibre-gl.css", "pages/maplibre.css")
	await fs.mkdir("pages/demos", { recursive: true })
	await fs.copyFile("demos/style.css", "pages/demos/style.css")
	await fs.copyFile("demos/jsdoc.css", "pages/demos/jsdoc.css")

	{
		const sourceHtml = await fs.readFile("demos/index.html", "utf-8")
		const transformedHtml = sourceHtml.replace("</head>",
			`	<link rel="stylesheet" href="jsdoc.css">\n` +
			`</head>`
		).replace("<body>",
			`<body>\n` +
			`	<nav class="pages">\n` +
			`		<a href="..">Home</a> &gt; <strong>Demos</strong>\n` +
			`	</nav>\n`
		)
		await fs.writeFile(`pages/demos/index.html`, transformedHtml)
	}

	for (const dirEntry of await fs.readdir("demos", { withFileTypes: true })) {
		if (!dirEntry.isDirectory()) continue

		await fs.mkdir(`pages/demos/${dirEntry.name}`)

		const sourceJavascript = await fs.readFile(`demos/${dirEntry.name}/index.js`, "utf-8")
		const sourceHtml = await fs.readFile(`demos/${dirEntry.name}/index.html`, "utf-8")
		const transformedHtml = sourceHtml.replace("</head>",
			`	<link rel="stylesheet" href="../jsdoc.css">\n` +
			// https://github.com/googlearchive/code-prettify
			`	<link rel="stylesheet" href="../../styles/prettify.css">\n` +
			`	<script src="../../scripts/prettify/prettify.js"></script>\n` +
			`</head>`
		).replace("<body>",
			`<body>\n` +
			`	<nav class="pages">\n` +
			`		<a href="../..">Home</a> &gt; <a href="..">Demos</a> &gt; <strong>${dirEntry.name}</strong>\n` +
			`	</nav>\n`
		).replace("</body>",
			`<details class="js">\n` +
			`<summary>javascript code</summary>\n` +
			`<pre class="prettyprint source"><code>${escapeHtml(sourceJavascript)}</code></pre>\n` +
			`</details>\n` +
			`<script>prettyPrint()</script>\n` +
			`</body>`
		)
		await fs.writeFile(`pages/demos/${dirEntry.name}/index.html`, transformedHtml)

		const bundle = await rollup({
			input: `demos/${dirEntry.name}/index.js`,
			plugins: [
				alias({
					entries: [
						{ find: "@antonkhorev/geo-url", replacement: `${import.meta.dirname}/${packageJson.main}` }
					]
				}),
				nodeResolve()
			]
		})
		await bundle.write({
			file: `pages/demos/${dirEntry.name}/index.js`
		})
		await bundle.close()
	}
}

function escapeHtml(html) {
	return html
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#039;")
}
