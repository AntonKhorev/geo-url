import { describe, test, expect } from "vitest"

import { GeoParams } from "../index.js"

describe("GeoParams", () => {
	test("Converts empty params to a string", () => {
		const params = new GeoParams("")
		expect(params.toString()).toBe("")
	})
	test("Converts params to a string", () => {
		const params = new GeoParams("hello=world;yes;year=2025")
		expect(params.toString()).toBe("hello=world;yes;year=2025")
	})

	test("Gets a null value for a parameter from empty string", () => {
		const params = new GeoParams("")
		expect(params.get("foo")).toBeNull()
	})
	test("Gets a null value for a missing parameter from a single-parameter string", () => {
		const params = new GeoParams("foo=42")
		expect(params.get("bar")).toBeNull()
	})
	test("Gets a parameter value from a single-parameter string", () => {
		const params = new GeoParams("foo=42")
		expect(params.get("foo")).toBe("42")
	})
	test("Gets a value with '&'", () => {
		const params = new GeoParams("foo=bar&baz")
		expect(params.get("foo")).toBe("bar&baz")
		expect(params.get("baz")).toBeNull()
	})
	test("Gets a value with multiple '&'", () => {
		const params = new GeoParams("foo=bar&baz&zab&rab")
		expect(params.get("foo")).toBe("bar&baz&zab&rab")
		expect(params.get("baz")).toBeNull()
		expect(params.get("zab")).toBeNull()
		expect(params.get("rab")).toBeNull()
	})
	test("Preserves the value case", () => {
		const params = new GeoParams("foo=BaR")
		expect(params.get("foo")).toBe("BaR")
	})
	test("Preserves the value case of a crs param", () => {
		const params = new GeoParams("crs=WGS84")
		expect(params.get("crs")).toBe("WGS84")
	})
	test("Gets a value of a param with a mixed-case name when requesting in lowercase", () => {
		const params = new GeoParams("FoO=bar")
		expect(params.get("foo")).toBe("bar")
	})
	test("Gets a value of a param with a mixed-case name when requesting in uppercase", () => {
		const params = new GeoParams("FoO=bar")
		expect(params.get("FOO")).toBe("bar")
	})
	test("Gets a flag parameter", () => {
		const params = new GeoParams("flag")
		expect(params.get("flag")).toBe("")
	})
	test("Doesn't decode '+' in a value", () => {
		const params = new GeoParams("plus=+")
		expect(params.get("plus")).toBe("+")
	})
	test("Percent-decodes a value", () => {
		const params = new GeoParams("decode=%31%32%33")
		expect(params.get("decode")).toBe("123")
	})

	test("Sets an existing parameter", () => {
		const params = new GeoParams("foo=old")
		params.set("foo", "new")
		expect(params.toString()).toBe("foo=new")
		expect(params.get("foo")).toBe("new")
	})
	test("Sets an existing parameter to a flag", () => {
		const params = new GeoParams("foo=old")
		params.set("foo", "")
		expect(params.toString()).toBe("foo")
		expect(params.get("foo")).toBe("")
	})
	test("Updates the case of an existing parameter name", () => {
		const params = new GeoParams("FoO=value")
		params.set("fOo", "value")
		expect(params.toString()).toBe("fOo=value")
		expect(params.get("foo")).toBe("value")
	})
	test("Adds a new param by setting to empty params", () => {
		const params = new GeoParams("")
		params.set("hello", "world")
		expect(params.toString()).toBe("hello=world")
		expect(params.get("hello")).toBe("world")
	})
	test("Adds a new param by setting to nonempty params", () => {
		const params = new GeoParams("foo=qwe")
		params.set("hello", "world")
		expect(params.toString()).toBe("foo=qwe;hello=world")
		expect(params.get("hello")).toBe("world")
	})

	test("Updates crs param", () => {
		const params = new GeoParams("crs=ABC12")
		params.set("crs", "DEF34")
		expect(params.toString()).toBe("crs=DEF34")
		expect(params.get("crs")).toBe("DEF34")
	})
	test("Adds crs param", () => {
		const params = new GeoParams("")
		params.set("crs", "DEF34")
		expect(params.toString()).toBe("crs=DEF34")
		expect(params.get("crs")).toBe("DEF34")
	})
	test("Adds crs param to existing params", () => {
		const params = new GeoParams("foo=bar")
		params.set("crs", "DEF34")
		expect(params.toString()).toBe("crs=DEF34;foo=bar")
		expect(params.get("crs")).toBe("DEF34")
	})
	test("Adds crs param to existing params ignoring the name case", () => {
		const params = new GeoParams("foo=bar")
		params.set("cRS", "DEF34")
		expect(params.toString()).toBe("cRS=DEF34;foo=bar")
		expect(params.get("crs")).toBe("DEF34")
	})
	test("Adds crs param to an existing u param", () => {
		const params = new GeoParams("u=5")
		params.set("crs", "DEF34")
		expect(params.toString()).toBe("crs=DEF34;u=5")
		expect(params.get("crs")).toBe("DEF34")
	})

	test("Updates u param", () => {
		const params = new GeoParams("u=12.34")
		params.set("u", "43.21")
		expect(params.toString()).toBe("u=43.21")
		expect(params.get("u")).toBe("43.21")
	})
	test("Adds u param", () => {
		const params = new GeoParams("")
		params.set("u", "43.21")
		expect(params.toString()).toBe("u=43.21")
		expect(params.get("u")).toBe("43.21")
	})
	test("Adds u param to existing params", () => {
		const params = new GeoParams("foo=bar")
		params.set("u", "15.16")
		expect(params.toString()).toBe("u=15.16;foo=bar")
		expect(params.get("u")).toBe("15.16")
	})
	test("Adds U param to existing params", () => {
		const params = new GeoParams("foo=bar")
		params.set("U", "15.16")
		expect(params.toString()).toBe("U=15.16;foo=bar")
		expect(params.get("u")).toBe("15.16")
	})
	test("Adds u param to an existing crs param", () => {
		const params = new GeoParams("crs=ABC12")
		params.set("u", "15.16")
		expect(params.toString()).toBe("crs=ABC12;u=15.16")
		expect(params.get("u")).toBe("15.16")
	})

	test("Encodes '%' when setting a parameter", () => {
		const params = new GeoParams("foo=old")
		params.set("foo", "%")
		expect(params.toString()).toBe("foo=%25")
		expect(params.get("foo")).toBe("%")
	})
	test("Encodes multiple '%' when setting a parameter", () => {
		const params = new GeoParams("foo=old")
		params.set("foo", "%%")
		expect(params.toString()).toBe("foo=%25%25")
		expect(params.get("foo")).toBe("%%")
	})
	test("Encodes parameter-reserved chars when setting a parameter", () => {
		const params = new GeoParams("foo=old")
		params.set("foo", ` "#%,/;<=>?@\\^\`{|}`)
		expect(params.toString()).toBe("foo=%20%22%23%25%2C%2F%3B%3C%3D%3E%3F%40%5C%5E%60%7B%7C%7D")
		expect(params.get("foo")).toBe(` "#%,/;<=>?@\\^\`{|}`)
	})
	test("Doesn't encode allowed chars when setting a parameter", () => {
		const params = new GeoParams("foo=old")
		params.set("foo", 
			"[]:&+$" + // p-unreserved
			"-_.!~*'()" // mark
		)
		expect(params.toString()).toBe("foo=[]:&+$-_.!~*'()")
		expect(params.get("foo")).toBe("[]:&+$-_.!~*'()")
	})
	test("Doesn't encode repeated allowed chars when setting a parameter", () => {
		const params = new GeoParams("foo=old")
		params.set("foo", "$$")
		expect(params.toString()).toBe("foo=$$")
		expect(params.get("foo")).toBe("$$")
	})
	test("Encodes non-Latin chars", () => {
		const params = new GeoParams("foo=old")
		params.set("foo", "проверка")
		expect(params.toString()).toBe("foo=%D0%BF%D1%80%D0%BE%D0%B2%D0%B5%D1%80%D0%BA%D0%B0")
		expect(params.get("foo")).toBe("проверка")
	})
})
