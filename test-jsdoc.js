import vm from "node:vm"
import assert from "node:assert"
import { describe, test } from "node:test"
import jsdoc from "jsdoc-api"

import { GeoURL, WGS84GeoURL } from "./dist/index.js"

await testSuite(
	["dist/index.js"],
	{
		GeoURL, WGS84GeoURL,
		L: { marker: () => {} }, // skip Leaflet code
	}
)

async function testSuite(files, context) {
	const data = await jsdoc.explain({ files })

	for (const item of data) {
		if (!item.examples) continue

		if (item.examples.length == 1 ) {
			test(item.longname, () => {
				testExample(item.examples[0], context)
			})
		} else {
			describe(item.longname, () => {
				for (const [i, example] of item.examples.entries()) {
					test(`Example ${i}`, () => {
						testExample(example, context)
					})
				}
			})
		}
	}
}

function testExample(example, context) {
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
	const augmentedContext = {
		...context,
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
	vm.createContext(augmentedContext)
	vm.runInContext(code, augmentedContext)
}
