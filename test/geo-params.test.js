import { describe, test, expect } from "vitest"

import { GeoParams } from "../index.js"

describe("GeoParams", () => {
	describe("constructor", () => {
		test("converts empty params to a string", () => {
			const params = new GeoParams("")
			expect(params.toString()).toBe("")
		})
		test("converts params to a string", () => {
			const params = new GeoParams("hello=world;yes;year=2025")
			expect(params.toString()).toBe("hello=world;yes;year=2025")
		})
	})

	describe("size", () => {
		test("is 0 for empty params", () => {
			const params = new GeoParams("")
			expect(params.size).toBe(0)
		})
		test("is 1 for a single param", () => {
			const params = new GeoParams("one")
			expect(params.size).toBe(1)
		})
		test("counts multiple params", () => {
			const params = new GeoParams("one;two=2")
			expect(params.size).toBe(2)
		})
	})

	describe("get", () => {
		test("returns a null value for a parameter from empty string", () => {
			const params = new GeoParams("")
			expect(params.get("foo")).toBeNull()
		})
		test("returns a null value for a missing parameter from a single-parameter string", () => {
			const params = new GeoParams("foo=42")
			expect(params.get("bar")).toBeNull()
		})
		test("returns a parameter value from a single-parameter string", () => {
			const params = new GeoParams("foo=42")
			expect(params.get("foo")).toBe("42")
		})
		test("returns a value with '&'", () => {
			const params = new GeoParams("foo=bar&baz")
			expect(params.get("foo")).toBe("bar&baz")
			expect(params.get("baz")).toBeNull()
		})
		test("returns a value with multiple '&'", () => {
			const params = new GeoParams("foo=bar&baz&zab&rab")
			expect(params.get("foo")).toBe("bar&baz&zab&rab")
			expect(params.get("baz")).toBeNull()
			expect(params.get("zab")).toBeNull()
			expect(params.get("rab")).toBeNull()
		})
		test("preserves the value case", () => {
			const params = new GeoParams("foo=BaR")
			expect(params.get("foo")).toBe("BaR")
		})
		test("preserves the value case of a crs param", () => {
			const params = new GeoParams("crs=WGS84")
			expect(params.get("crs")).toBe("WGS84")
		})
		test("returns a value of a param with a mixed-case name when requesting in lowercase", () => {
			const params = new GeoParams("FoO=bar")
			expect(params.get("foo")).toBe("bar")
		})
		test("returns a value of a param with a mixed-case name when requesting in uppercase", () => {
			const params = new GeoParams("FoO=bar")
			expect(params.get("FOO")).toBe("bar")
		})
		test("returns an empty string for a flag parameter", () => {
			const params = new GeoParams("flag")
			expect(params.get("flag")).toBe("")
		})
		test("doesn't decode '+' in a value", () => {
			const params = new GeoParams("plus=+")
			expect(params.get("plus")).toBe("+")
		})
		test("percent-decodes a value", () => {
			const params = new GeoParams("decode=%31%32%33")
			expect(params.get("decode")).toBe("123")
		})
	})

	describe("set", () => {
		test("updates an existing parameter", () => {
			const params = new GeoParams("foo=old")
			params.set("foo", "new")
			expect(params.toString()).toBe("foo=new")
			expect(params.get("foo")).toBe("new")
			expect(params.size).toBe(1)
		})
		test("updates an existing parameter to a flag", () => {
			const params = new GeoParams("foo=old")
			params.set("foo", "")
			expect(params.toString()).toBe("foo")
			expect(params.get("foo")).toBe("")
			expect(params.size).toBe(1)
		})
		test("updates the case of an existing parameter name", () => {
			const params = new GeoParams("FoO=value")
			params.set("fOo", "value")
			expect(params.toString()).toBe("fOo=value")
			expect(params.get("foo")).toBe("value")
			expect(params.size).toBe(1)
		})
		test("adds a new param to empty params", () => {
			const params = new GeoParams("")
			params.set("hello", "world")
			expect(params.toString()).toBe("hello=world")
			expect(params.get("hello")).toBe("world")
			expect(params.size).toBe(1)
		})
		test("adds a new param to existing params", () => {
			const params = new GeoParams("foo=qwe")
			params.set("hello", "world")
			expect(params.toString()).toBe("foo=qwe;hello=world")
			expect(params.get("hello")).toBe("world")
			expect(params.size).toBe(2)
		})

		test("updates crs param", () => {
			const params = new GeoParams("crs=ABC12")
			params.set("crs", "DEF34")
			expect(params.toString()).toBe("crs=DEF34")
			expect(params.get("crs")).toBe("DEF34")
		})
		test("adds crs param", () => {
			const params = new GeoParams("")
			params.set("crs", "DEF34")
			expect(params.toString()).toBe("crs=DEF34")
			expect(params.get("crs")).toBe("DEF34")
		})
		test("adds crs param to existing params", () => {
			const params = new GeoParams("foo=bar")
			params.set("crs", "DEF34")
			expect(params.toString()).toBe("crs=DEF34;foo=bar")
			expect(params.get("crs")).toBe("DEF34")
		})
		test("adds crs param to existing params ignoring the name case", () => {
			const params = new GeoParams("foo=bar")
			params.set("cRS", "DEF34")
			expect(params.toString()).toBe("cRS=DEF34;foo=bar")
			expect(params.get("crs")).toBe("DEF34")
		})
		test("adds crs param to an existing u param", () => {
			const params = new GeoParams("u=5")
			params.set("crs", "DEF34")
			expect(params.toString()).toBe("crs=DEF34;u=5")
			expect(params.get("crs")).toBe("DEF34")
		})

		test("updates u param", () => {
			const params = new GeoParams("u=12.34")
			params.set("u", "43.21")
			expect(params.toString()).toBe("u=43.21")
			expect(params.get("u")).toBe("43.21")
		})
		test("adds u param to empty params", () => {
			const params = new GeoParams("")
			params.set("u", "43.21")
			expect(params.toString()).toBe("u=43.21")
			expect(params.get("u")).toBe("43.21")
		})
		test("adds u param to existing params", () => {
			const params = new GeoParams("foo=bar")
			params.set("u", "15.16")
			expect(params.toString()).toBe("u=15.16;foo=bar")
			expect(params.get("u")).toBe("15.16")
		})
		test("adds U param to existing params", () => {
			const params = new GeoParams("foo=bar")
			params.set("U", "15.16")
			expect(params.toString()).toBe("U=15.16;foo=bar")
			expect(params.get("u")).toBe("15.16")
		})
		test("adds u param to an existing crs param", () => {
			const params = new GeoParams("crs=ABC12")
			params.set("u", "15.16")
			expect(params.toString()).toBe("crs=ABC12;u=15.16")
			expect(params.get("u")).toBe("15.16")
		})
		test("adds u param to an existing crs and other param", () => {
			const params = new GeoParams("crs=ABC12;fizz=buzz")
			params.set("u", "15.16")
			expect(params.toString()).toBe("crs=ABC12;u=15.16;fizz=buzz")
			expect(params.get("u")).toBe("15.16")
		})
	})

	describe("delete", () => {
		test("does nothing for empty params", () => {
			const params = new GeoParams("")
			params.delete("hello")
			expect(params.toString()).toBe("")
			expect(params.get("hello")).toBeNull()
			expect(params.size).toBe(0)
		})
		test("does nothing when provided a nonexisting param", () => {
			const params = new GeoParams("goodbye=world")
			params.delete("hello")
			expect(params.toString()).toBe("goodbye=world")
			expect(params.get("hello")).toBeNull()
			expect(params.size).toBe(1)
		})
		test("deletes the only param", () => {
			const params = new GeoParams("foo=42")
			params.delete("foo")
			expect(params.toString()).toBe("")
			expect(params.get("foo")).toBeNull()
			expect(params.size).toBe(0)
		})
		test("deletes the first param", () => {
			const params = new GeoParams("foo=42;bar=23")
			params.delete("foo")
			expect(params.toString()).toBe("bar=23")
			expect(params.get("foo")).toBeNull()
			expect(params.size).toBe(1)
		})
		test("deletes the last param", () => {
			const params = new GeoParams("foo=42;bar=23")
			params.delete("bar")
			expect(params.toString()).toBe("foo=42")
			expect(params.get("bar")).toBeNull()
			expect(params.size).toBe(1)
		})
		test("deletes the middle param", () => {
			const params = new GeoParams("foo=42;bar=23;baz=12")
			params.delete("bar")
			expect(params.toString()).toBe("foo=42;baz=12")
			expect(params.get("bar")).toBeNull()
			expect(params.size).toBe(2)
		})
		test("deletes a param ignoring the name case", () => {
			const params = new GeoParams("foo=42")
			params.delete("FoO")
			expect(params.toString()).toBe("")
			expect(params.get("foo")).toBeNull()
			expect(params.size).toBe(0)
		})

		test("deletes a param if the value matches", () => {
			const params = new GeoParams("foo=42")
			params.delete("foo", "42")
			expect(params.toString()).toBe("")
			expect(params.get("foo")).toBeNull()
			expect(params.size).toBe(0)
		})
		test("keeps a param if the value doesn't match", () => {
			const params = new GeoParams("foo=42")
			params.delete("foo", "43")
			expect(params.toString()).toBe("foo=42")
			expect(params.get("foo")).toBe("42")
			expect(params.size).toBe(1)
		})
	})

	describe("has", () => {
		test("returns false for empty params", () => {
			const params = new GeoParams("")
			expect(params.has("foo")).toBe(false)
		})
		test("returns false for a missing parameter", () => {
			const params = new GeoParams("foo=42")
			expect(params.has("bar")).toBe(false)
		})
		test("returns true for an existing param", () => {
			const params = new GeoParams("foo=42")
			expect(params.has("foo")).toBe(true)
		})
		test("returns true for an existing param ignoring the name case", () => {
			const params = new GeoParams("FoO=42")
			expect(params.has("fOo")).toBe(true)
		})

		test("returns false if the value of existing parameter doesn't match", () => {
			const params = new GeoParams("foo=42")
			expect(params.has("foo", "43")).toBe(false)
		})
		test("returns true if the value of existing parameter matches", () => {
			const params = new GeoParams("foo=42")
			expect(params.has("foo", "42")).toBe(true)
		})
		test("returns false if the parameter exists but isn't a flag", () => {
			const params = new GeoParams("foo=42")
			expect(params.has("foo", "")).toBe(false)
		})
		test("returns false if the parameter doesn't exists when testing for a flag", () => {
			const params = new GeoParams("")
			expect(params.has("foo", "")).toBe(false)
		})
		test("returns true if the parameter exists and is a flag", () => {
			const params = new GeoParams("foo")
			expect(params.has("foo", "")).toBe(true)
		})
	})

	describe("value conversion", () => {
		test("encodes '%'", () => {
			const params = new GeoParams("foo=old")
			params.set("foo", "%")
			expect(params.toString()).toBe("foo=%25")
			expect(params.get("foo")).toBe("%")
		})
		test("encodes multiple '%'", () => {
			const params = new GeoParams("foo=old")
			params.set("foo", "%%")
			expect(params.toString()).toBe("foo=%25%25")
			expect(params.get("foo")).toBe("%%")
		})
		test("encodes parameter-reserved chars", () => {
			const params = new GeoParams("foo=old")
			params.set("foo", ` "#%,/;<=>?@\\^\`{|}`)
			expect(params.toString()).toBe("foo=%20%22%23%25%2C%2F%3B%3C%3D%3E%3F%40%5C%5E%60%7B%7C%7D")
			expect(params.get("foo")).toBe(` "#%,/;<=>?@\\^\`{|}`)
		})
		test("doesn't encode allowed chars", () => {
			const params = new GeoParams("foo=old")
			params.set("foo",
				"[]:&+$" + // p-unreserved
				"-_.!~*'()" // mark
			)
			expect(params.toString()).toBe("foo=[]:&+$-_.!~*'()")
			expect(params.get("foo")).toBe("[]:&+$-_.!~*'()")
		})
		test("doesn't encode repeated allowed chars", () => {
			const params = new GeoParams("foo=old")
			params.set("foo", "$$")
			expect(params.toString()).toBe("foo=$$")
			expect(params.get("foo")).toBe("$$")
		})
		test("encodes non-Latin chars", () => {
			const params = new GeoParams("foo=old")
			params.set("foo", "проверка")
			expect(params.toString()).toBe("foo=%D0%BF%D1%80%D0%BE%D0%B2%D0%B5%D1%80%D0%BA%D0%B0")
			expect(params.get("foo")).toBe("проверка")
		})
	})
})
