import * as fs from "fs/promises"
import { spawn } from "child_process"

await cleanupDirectory("pages")
await generateJsdoc("pages")
await fs.copyFile("node_modules/leaflet/dist/leaflet.css", "pages/leaflet.css")
await fs.copyFile("node_modules/leaflet/dist/leaflet.js", "pages/leaflet.js")
await fs.cp("node_modules/leaflet/dist/images", "pages/images", { recursive: true })
await fs.copyFile("index.js", "pages/geo-url.js")
await fs.cp("demos", "pages/demos", { recursive: true })

async function cleanupDirectory(dir) {
	await fs.mkdir(dir, { recursive: true })
	for (const filename of await fs.readdir(dir)) { // delete contents instead of the whole dir because live server doesn't like the dir disappearing
		await fs.rm(`${dir}/${filename}`, { recursive: true, force: true })
	}
}

function generateJsdoc(dir) {
	const child = spawn("npx", ["jsdoc", "index.js", "jsdoc.md", "-d", dir])
	return new Promise((resolve, reject) => {
		child.on('error', reject)
		child.on('close', code => code == 0 ? resolve() : reject())
	})
}
