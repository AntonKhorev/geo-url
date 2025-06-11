import { describe, test, expect } from "vitest"

import { writeParam } from "../src/param.js"

describe("writeParam", () => {
	test("encodes '%'", () => {
		const param = writeParam("foo", "%")
		expect(param).toBe("foo=%25")
	})
	test("encodes multiple '%'", () => {
		const param = writeParam("foo", "%%")
		expect(param).toBe("foo=%25%25")
	})
	test("encodes parameter-reserved chars", () => {
		const param = writeParam("foo", ` "#%,/;<=>?@\\^\`{|}`)
		expect(param).toBe("foo=%20%22%23%25%2C%2F%3B%3C%3D%3E%3F%40%5C%5E%60%7B%7C%7D")
	})
	test("doesn't encode allowed chars", () => {
		const param = writeParam("foo",
			"[]:&+$" + // p-unreserved
			"-_.!~*'()" // mark
		)
		expect(param).toBe("foo=[]:&+$-_.!~*'()")
	})
	test("doesn't encode repeated allowed chars", () => {
		const param = writeParam("foo", "$$")
		expect(param).toBe("foo=$$")
	})
	test("encodes non-Latin chars", () => {
		const param = writeParam("foo", "проверка")
		expect(param).toBe("foo=%D0%BF%D1%80%D0%BE%D0%B2%D0%B5%D1%80%D0%BA%D0%B0")
	})
})
