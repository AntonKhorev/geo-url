import * as fs from "fs/promises"
import { spawn } from "child_process"
import { rollup } from "rollup"
import alias from "@rollup/plugin-alias"
import { nodeResolve } from "@rollup/plugin-node-resolve"

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
	const child = spawn("npx", ["jsdoc", "index.js", "README.md", "-c", "jsdoc/conf.json", "-d", dir])
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
	await fs.copyFile("demos/index.html", "pages/demos/index.html")
	await fs.copyFile("demos/style.css", "pages/demos/style.css")

	for (const dirEntry of await fs.readdir("demos", { withFileTypes: true })) {
		if (!dirEntry.isDirectory()) continue

		await fs.mkdir(`pages/demos/${dirEntry.name}`)

		const sourceJavascript = await fs.readFile(`demos/${dirEntry.name}/index.js`, "utf-8")
		const sourceHtml = await fs.readFile(`demos/${dirEntry.name}/index.html`, "utf-8")
		const transformedHtml = sourceHtml.replace("</body>",
			`<details class="js">` +
			`<summary>javascript code</summary>` +
			`<pre><code>${escapeHtml(sourceJavascript)}</code></pre>` +
			`</details>` +
			`</body>`
		)
		await fs.writeFile(`pages/demos/${dirEntry.name}/index.html`, transformedHtml)

		const bundle = await rollup({
			input: `demos/${dirEntry.name}/index.js`,
			plugins: [
				alias({
					entries: [
						{ find: "@antonkhorev/geo-url", replacement: `${import.meta.dirname}/index.js` }
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
