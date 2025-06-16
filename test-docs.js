import vm from "node:vm"
import assert from "node:assert"
import jsdoc from "jsdoc-api"

import { GeoURL, WGS84GeoURL } from "./dist/index.js"

const data = await jsdoc.explain({ files: ["dist/index.js"] })

for (const item of data) {
	if (!item.examples) continue

	for (const [i, example] of item.examples.entries()) {
		console.log(`[ ] ${item.longname} > Example ${i}`)

		let code = ""
		for (const line of example.split("\n")) {
			let match
			if (match = line.match(new RegExp(`//\\s*outputs\\s+"(.*)"\s*$`))) {
				const [, expectedString] = match
				code += line + "\n"
				code += `_assertLastConsoleArg("${expectedString}")\n`
			} else if (match = line.match(new RegExp(`//\\s*throws.*$`))) {
				code += `_assertThrows(() => {\n`
				code += line + "\n"
				code += `})\n`
			} else {
				code += line + "\n"
			}
		}

		let lastConsoleArg
		const context = {
			GeoURL, WGS84GeoURL,
			L: { marker: () => {} }, // skip Leaflet code
			console: {
				log: arg => { lastConsoleArg = arg }
			},
			_assertLastConsoleArg: expectedOutput => {
				if (expectedOutput == "undefined") {
					assert.equal(lastConsoleArg, undefined)
				} else if (expectedOutput[0] == "[") {
					assert.deepEqual(lastConsoleArg, JSON.parse(expectedOutput))
				} else {
					assert.equal(lastConsoleArg, expectedOutput)
				}
			},
			_assertThrows: fn => assert.throws(fn)
		}
		vm.createContext(context)

		try {
			vm.runInContext(code, context)
		} catch (ex) {
			console.log(example)
			console.log("\n* caught exception", ex)
		}
	}
}
