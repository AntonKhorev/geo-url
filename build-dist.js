import * as fs from "fs/promises"
import { rollup } from "rollup"
import { nodeResolve } from "@rollup/plugin-node-resolve"

await cleanupDirectory("dist")
await buildPackage("dist")

async function cleanupDirectory(dir) {
	await fs.mkdir(dir, { recursive: true })
	for (const filename of await fs.readdir(dir)) { // delete contents instead of the whole dir because live server doesn't like the dir disappearing
		await fs.rm(`${dir}/${filename}`, { recursive: true, force: true })
	}
}

async function buildPackage(dir) {
	const bundle = await rollup({
		input: `src/index.js`,
		plugins: [
			nodeResolve()
		]
	})
	await bundle.write({
		file: `${dir}/index.js`
	})
	await bundle.close()
}
