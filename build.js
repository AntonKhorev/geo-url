import * as fs from "fs/promises"

await cleanupDirectory("pages")
await fs.copyFile("index.js", "pages/geo-url.js")
await fs.cp("demos", "pages/demos", { recursive: true })

async function cleanupDirectory(dir) {
	await fs.mkdir(dir, { recursive: true })
	for (const filename of await fs.readdir(dir)) { // delete contents instead of the whole dir because live server doesn't like the dir disappearing
		await fs.rm(`${dir}/${filename}`,{ recursive: true, force: true })
	}
}
