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
		expect(params.get("foo")).toBe("new")
		expect(params.toString()).toBe("foo=new")
	})
	test("Encodes '%' when setting a parameter", () => {
		const params = new GeoParams("foo=old")
		params.set("foo", "%")
		expect(params.get("foo")).toBe("%")
		expect(params.toString()).toBe("foo=%25")
	})
	test("Doesn't encode allowed chars when setting a parameter", () => {
		const params = new GeoParams("foo=old")
		params.set("foo", 
			"[]:&+$" + // p-unreserved
			"-_.!~*'()" // mark
		)
		expect(params.get("foo")).toBe("[]:&+$-_.!~*'()")
		expect(params.toString()).toBe("foo=[]:&+$-_.!~*'()")
	})
})
