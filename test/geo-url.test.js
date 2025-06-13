import { describe, test, expect } from "vitest"

import { GeoURL } from "../src/index.js"

describe("GeoURL", () => {
	describe("constructor", () => {
		test("fails when no parameters given", () => {
			expect(
				() => new GeoURL()
			).toThrow(TypeError)
		})
		test("fails on empty string", () => {
			expect(
				() => new GeoURL("")
			).toThrow(TypeError)
		})
		test("fails on normal url", () => {
			expect(
				() => new GeoURL("https://www.example.com/")
			).toThrow(TypeError)
		})
		test("fails when provided no coordinates", () => {
			expect(
				() => new GeoURL("geo:")
			).toThrow(TypeError)
		})
		test("fails when provided one coordinate", () => {
			expect(
				() => new GeoURL("geo:0")
			).toThrow(TypeError)
		})
		test("fails when provided 2 empty coordinates", () => {
			expect(
				() => new GeoURL("geo:,")
			).toThrow(TypeError)
		})
		test("fails when provided 3 empty coordinates", () => {
			expect(
				() => new GeoURL("geo:,,")
			).toThrow(TypeError)
		})
		test("fails when provided 2 NaN coordinates", () => {
			expect(
				() => new GeoURL("geo:no,nope")
			).toThrow(TypeError)
		})

		test("initializes with a string", () => {
			const url = new GeoURL("geo:47.6,-122.3?z=11")
			expect(url.toString()).toBe("geo:47.6,-122.3?z=11")
		})
		test("initializes with a URL object", () => {
			const sourceUrl = new URL("geo:12,34;u=56?z=78#id9")
			const url = new GeoURL(sourceUrl)
			expect(url.toString()).toBe("geo:12,34;u=56?z=78#id9")
		})
		test("initializes with a GeoURL object", () => {
			const sourceUrl = new GeoURL("geo:12,34;u=56?z=78#id9")
			const url = new GeoURL(sourceUrl)
			expect(url.toString()).toBe("geo:12,34;u=56?z=78#id9")
		})
		test("adds a hash to a base geo uri", () => {
			const url = new GeoURL("#hash", "geo:12,34")
			expect(url.toString()).toBe("geo:12,34#hash")
		})
	})

	describe("toJSON", () => {
		test("converts to string", () => {
			const url = new GeoURL("geo:47.6,-122.3?z=11")
			expect(url.toJSON()).toBe("geo:47.6,-122.3?z=11")
		})
	})

	describe("parse", () => {
		test("parses valid geo URI", () => {
			const url = GeoURL.parse("geo:12,34")
			expect(url).toBeInstanceOf(GeoURL)
			expect(url.toString()).toBe("geo:12,34")
		})
		test("parses invalid geo URI but valid URL", () => {
			const url = GeoURL.parse("geo:12")
			expect(url).toBeNull()
		})
		test("parses invalid URL", () => {
			const url = GeoURL.parse("xz")
			expect(url).toBeNull()
		})
		test("parses valid relative geo URI", () => {
			const url = GeoURL.parse("#hash", "geo:12,34")
			expect(url).toBeInstanceOf(GeoURL)
			expect(url.toString()).toBe("geo:12,34#hash")
		})
	})

	describe("canParse", () => {
		test("returns true on a valid geo URI", () => {
			expect(GeoURL.canParse("geo:12,34")).toBe(true)
		})
		test("returns false on an invalid geo URI but a valid URL", () => {
			expect(GeoURL.canParse("geo:12")).toBe(false)
		})
		test("returns false on an invalid URL", () => {
			expect(GeoURL.canParse("xz")).toBe(false)
		})
		test("returns true on a valid relative geo URI", () => {
			expect(GeoURL.canParse("#hash", "geo:12,34")).toBe(true)
		})
	})

	describe("protocol", () => {
		test("gets the value", () => {
			const url = new GeoURL("geo:13.4125,103.8667")
			expect(url.protocol).toBe("geo:")
		})
		test("ensures that the protocol is case-insensitive", () => {
			const url = new GeoURL("GeO:1,2")
			expect(url.protocol).toBe("geo:")
		})
	})

	describe("href", () => {
		test("gets the value", () => {
			const url = new GeoURL("geo:47.6,-122.3?z=11")
			expect(url.href).toBe("geo:47.6,-122.3?z=11")
		})
	})

	describe("origin", () => {
		test("gets a null value", () => {
			const url = new GeoURL("geo:47.6,-122.3?z=11")
			expect(url.origin).toBe("null")
		})
	})

	describe("username", () => {
		test("gets an empty string", () => {
			const url = new GeoURL("geo:47.6,-122.3?z=11")
			expect(url.username).toBe("")
		})
	})

	describe("password", () => {
		test("gets an empty string", () => {
			const url = new GeoURL("geo:47.6,-122.3?z=11")
			expect(url.password).toBe("")
		})
	})

	describe("host", () => {
		test("gets an empty string", () => {
			const url = new GeoURL("geo:47.6,-122.3?z=11")
			expect(url.host).toBe("")
		})
	})

	describe("hostname", () => {
		test("gets an empty string", () => {
			const url = new GeoURL("geo:47.6,-122.3?z=11")
			expect(url.hostname).toBe("")
		})
	})

	describe("port", () => {
		test("gets an empty string", () => {
			const url = new GeoURL("geo:47.6,-122.3?z=11")
			expect(url.port).toBe("")
		})
	})

	describe("pathname", () => {
		test("gets the value", () => {
			const url = new GeoURL("geo:47.6,-122.3?z=11")
			expect(url.pathname).toBe("47.6,-122.3")
		})
	})

	describe("search", () => {
		test("gets the value", () => {
			const url = new GeoURL("geo:47.6,-122.3?z=11")
			expect(url.search).toBe("?z=11")
		})
		test("sets the value", () => {
			const url = new GeoURL("geo:47.6,-122.3?z=11")
			const searchParams = url.searchParams
			url.search = "x=12"
			expect(url.search).toBe("?x=12")
			expect(url.toString()).toBe("geo:47.6,-122.3?x=12")
			expect(url.z).toBeUndefined()
			expect(searchParams).toStrictEqual(new URLSearchParams({ x: 12 }))
		})
		test("sets the value with a leading '?'", () => {
			const url = new GeoURL("geo:47.6,-122.3?z=11")
			const searchParams = url.searchParams
			url.search = "?x=12"
			expect(url.search).toBe("?x=12")
			expect(url.toString()).toBe("geo:47.6,-122.3?x=12")
			expect(url.z).toBeUndefined()
			expect(searchParams).toStrictEqual(new URLSearchParams({ x: 12 }))
		})
		test("sets the value to an empty string", () => {
			const url = new GeoURL("geo:47.6,-122.3?z=11")
			const searchParams = url.searchParams
			url.search = ""
			expect(url.search).toBe("")
			expect(url.toString()).toBe("geo:47.6,-122.3")
			expect(url.z).toBeUndefined()
			expect(searchParams).toStrictEqual(new URLSearchParams())
		})
		test("sets the value to '?'", () => {
			const url = new GeoURL("geo:47.6,-122.3?z=11")
			const searchParams = url.searchParams
			url.search = "?"
			expect(url.search).toBe("")
			expect(url.toString()).toBe("geo:47.6,-122.3?")
			expect(url.z).toBeUndefined()
			expect(searchParams).toStrictEqual(new URLSearchParams())
		})
		test("updates the z parameter", () => {
			const url = new GeoURL("geo:47.6,-122.3?z=11")
			const searchParams = url.searchParams
			url.search = "z=12"
			expect(url.search).toBe("?z=12")
			expect(url.toString()).toBe("geo:47.6,-122.3?z=12")
			expect(url.z).toBe(12)
			expect(searchParams).toStrictEqual(new URLSearchParams({ z: 12 }))
		})
	})

	describe("searchParams", () => {
		test("gets the object", () => {
			const url = new GeoURL("geo:47.6,-122.3?z=11")
			expect(url.searchParams).toStrictEqual(new URLSearchParams({ z: 11 }))
		})
		test("updates z", () => {
			const url = new GeoURL("geo:47.6,-122.3?z=11")
			url.searchParams.set("z", 15)
			expect(url.z).toBe(15)
		})
	})

	describe("hash", () => {
		test("gets the value", () => {
			const url = new GeoURL("geo:12,34#some-id")
			expect(url.hash).toBe("#some-id")
		})
		test("sets the value", () => {
			const url = new GeoURL("geo:12,34#some-id")
			url.hash = "other-id"
			expect(url.hash).toBe("#other-id")
			expect(url.toString()).toBe("geo:12,34#other-id")
		})
		test("sets the value with a leading '#'", () => {
			const url = new GeoURL("geo:12,34#some-id")
			url.hash = "#other-id"
			expect(url.hash).toBe("#other-id")
			expect(url.toString()).toBe("geo:12,34#other-id")
		})
		test("sets the value to an empty string", () => {
			const url = new GeoURL("geo:12,34#some-id")
			url.hash = ""
			expect(url.hash).toBe("")
			expect(url.toString()).toBe("geo:12,34")
		})
		test("sets the value to '#'", () => {
			const url = new GeoURL("geo:12,34#some-id")
			url.hash = "#"
			expect(url.hash).toBe("")
			expect(url.toString()).toBe("geo:12,34#")
		})
	})

	describe("z", () => {
		test("returns undefined for a missing z parameter", () => {
			const url = new GeoURL("geo:47.6,-122.3")
			expect(url.z).toBeUndefined()
		})
		test("returns undefined for a z parameter without a value", () => {
			const url = new GeoURL("geo:47.6,-122.3?z")
			expect(url.z).toBeUndefined()
		})
		test("returns undefined for a z parameter with an empty value", () => {
			const url = new GeoURL("geo:47.6,-122.3?z=")
			expect(url.z).toBeUndefined()
		})
		test("gets the value", () => {
			const url = new GeoURL("geo:47.6,-122.3?z=11")
			expect(url.z).toBe(11)
		})
		test("ignores an uppercase z parameter", () => {
			const url = new GeoURL("geo:1,2?Z=12")
			expect(url.z).toBeUndefined()
		})
		test("ignores an uppercase z parameter before a lowercase z parameter", () => {
			const url = new GeoURL("geo:1,2?Z=12&z=9")
			expect(url.z).toBe(9)
		})
		test("ignores an uppercase z parameter after a lowercase z parameter", () => {
			const url = new GeoURL("geo:1,2?z=7&Z=12")
			expect(url.z).toBe(7)
		})
		test("ignores a z geo parameter", () => {
			const url = new GeoURL("geo:47.6,-122.3;z=16?z=12")
			expect(url.z).toBe(12)
		})
		test("ignores '&z' inside geo parameters", () => {
			const url = new GeoURL("geo:48.858249,2.294541;skip=lol&z?z=19")
			expect(url.z).toBe(19)
		})
		test("sets the value", () => {
			const url = new GeoURL("geo:47.6,-122.3?z=11")
			const searchParams = url.searchParams
			url.z = 13
			expect(searchParams).toStrictEqual(new URLSearchParams({ z: 13 }))
			expect(url.toString()).toBe("geo:47.6,-122.3?z=13")
			expect(url.z).toBe(13)
		})
		test("deletes the z search param", () => {
			const url = new GeoURL("geo:47.6,-122.3?z=11")
			const searchParams = url.searchParams
			url.z = undefined
			expect(searchParams).toStrictEqual(new URLSearchParams({}))
			expect(url.toString()).toBe("geo:47.6,-122.3")
			expect(url.z).toBeUndefined()
		})
		test("deletes multiple z search params", () => {
			const url = new GeoURL("geo:47.6,-122.3?z=11&z=12")
			const searchParams = url.searchParams
			url.z = undefined
			expect(searchParams).toStrictEqual(new URLSearchParams({}))
			expect(url.toString()).toBe("geo:47.6,-122.3")
			expect(url.z).toBeUndefined()
		})
		test("formats the value in fixed-point notation with a reasonable precision for arithmetic", () => {
			const url = new GeoURL("geo:1,2")
			url.z = 0.1 + 0.2
			expect(url.searchParams.get("z")).toBe("0.3")
		})
	})

	describe("zoom", () => {
		test("gets the z value", () => {
			const url = new GeoURL("geo:47.6,-122.3?z=10")
			expect(url.zoom).toBe(10)
		})
		test("sets the z value", () => {
			const url = new GeoURL("geo:47.6,-122.3?z=10")
			url.zoom = 13
			expect(url.z).toBe(13)
		})
	})

	describe("geoParams", () => {
		test("supports empty params", () => {
			const url = new GeoURL("geo:0,0")
			expect(url.geoParams.get("foo")).toBeNull()
		})
		test("supports a single param", () => {
			const url = new GeoURL("geo:0,0;foo=42")
			expect(url.geoParams.get("foo")).toBe("42")
			expect(url.geoParams.get("bar")).toBeNull()
		})
		test("supports a single flag param", () => {
			const url = new GeoURL("geo:0,0;flag")
			expect(url.geoParams.get("flag")).toBe("")
		})
		test("updates an existing param", () => {
			const url = new GeoURL("geo:0,0;foo=bar")
			url.geoParams.set("foo", "baz")
			expect(url.geoParams.get("foo")).toBe("baz")
			expect(url.toString()).toBe("geo:0,0;foo=baz")
		})
		test("keeps other url parts when setting a param", () => {
			const url = new GeoURL("geo:12,34;key=test?z=78#id9")
			url.geoParams.set("key", "toast")
			expect(url.toString()).toBe("geo:12,34;key=toast?z=78#id9")
			expect(url.search).toBe("?z=78")
			expect(url.hash).toBe("#id9")
		})
		test("adds a new param to empty params", () => {
			const url = new GeoURL("geo:12,34")
			url.geoParams.set("hello", "world")
			expect(url.geoParams.get("hello")).toBe("world")
			expect(url.toString()).toBe("geo:12,34;hello=world")
		})
		test("adds a new geo param to nonempty params", () => {
			const url = new GeoURL("geo:12,34;foo=qwe")
			url.geoParams.set("hello", "world")
			expect(url.geoParams.get("hello")).toBe("world")
			expect(url.toString()).toBe("geo:12,34;foo=qwe;hello=world")
		})

		test("does nothing when deleting from empty params", () => {
			const url = new GeoURL("geo:12,34")
			url.geoParams.delete("hello")
			expect(url.geoParams.get("hello")).toBeNull()
			expect(url.toString()).toBe("geo:12,34")
		})
		test("does nothing when deleting a nonexisting param", () => {
			const url = new GeoURL("geo:12,34;goodbye=world")
			url.geoParams.delete("hello")
			expect(url.geoParams.get("hello")).toBeNull()
			expect(url.toString()).toBe("geo:12,34;goodbye=world")
		})
		test("deletes the only param", () => {
			const url = new GeoURL("geo:12,34;hello=world")
			url.geoParams.delete("hello")
			expect(url.geoParams.get("hello")).toBeNull()
			expect(url.toString()).toBe("geo:12,34")
		})
		test("deletes a param", () => {
			const url = new GeoURL("geo:12,34;foo=42;bar=23")
			url.geoParams.delete("foo")
			expect(url.geoParams.get("foo")).toBeNull()
			expect(url.toString()).toBe("geo:12,34;bar=23")
		})

		test("updates the crs param", () => {
			const url = new GeoURL("geo:0,0;crs=ABC12")
			url.geoParams.set("crs", "DEF34")
			expect(url.toString()).toBe("geo:0,0;crs=DEF34")
			expect(url.geoParams.get("crs")).toBe("DEF34")
			expect(url.crs).toBe("def34")
		})
		test("adds the crs param to empty params", () => {
			const url = new GeoURL("geo:0,0")
			url.geoParams.set("crs", "DEF34")
			expect(url.toString()).toBe("geo:0,0;crs=DEF34")
			expect(url.geoParams.get("crs")).toBe("DEF34")
			expect(url.crs).toBe("def34")
		})
		test("adds the crs param to nonempty params", () => {
			const url = new GeoURL("geo:0,0;foo=bar")
			url.geoParams.set("crs", "DEF34")
			expect(url.toString()).toBe("geo:0,0;crs=DEF34;foo=bar")
			expect(url.geoParams.get("crs")).toBe("DEF34")
			expect(url.crs).toBe("def34")
		})
		test("deleted the crs param", () => {
			const url = new GeoURL("geo:0,0;crs=UNK")
			url.geoParams.delete("crs")
			expect(url.toString()).toBe("geo:0,0")
			expect(url.geoParams.get("crs")).toBeNull()
			expect(url.crs).toBe("wgs84")
		})

		test("updates the u param", () => {
			const url = new GeoURL("geo:0,0;u=12.34")
			url.geoParams.set("u", "43.21")
			expect(url.toString()).toBe("geo:0,0;u=43.21")
			expect(url.geoParams.get("u")).toBe("43.21")
			expect(url.u).toBe(43.21)
		})
		test("adds the u param to empty params", () => {
			const url = new GeoURL("geo:0,0")
			url.geoParams.set("u", "43.21")
			expect(url.toString()).toBe("geo:0,0;u=43.21")
			expect(url.geoParams.get("u")).toBe("43.21")
			expect(url.u).toBe(43.21)
		})
		test("adds the u param to nonempty params", () => {
			const url = new GeoURL("geo:0,0;foo=bar")
			url.geoParams.set("u", "15.16")
			expect(url.toString()).toBe("geo:0,0;u=15.16;foo=bar")
			expect(url.geoParams.get("u")).toBe("15.16")
			expect(url.u).toBe(15.16)
		})
		test("deleted the u param", () => {
			const url = new GeoURL("geo:0,0;u=12.34")
			url.geoParams.delete("u")
			expect(url.toString()).toBe("geo:0,0")
			expect(url.geoParams.get("u")).toBeNull()
			expect(url.u).toBeUndefined()
		})
	})

	describe("crs", () => {
		test("gets the default value for missing crs", () => {
			const url = new GeoURL("geo:0,0")
			expect(url.crs).toBe("wgs84")
		})
		test("gets the typical 'wgs84' value", () => {
			const url = new GeoURL("geo:0,0;crs=wgs84")
			expect(url.crs).toBe("wgs84")
		})
		test("converts an uppercase value to lowercase", () => {
			const url = new GeoURL("geo:0,0;crs=WGS84")
			expect(url.crs).toBe("wgs84")
		})
		test("gets '0'", () => {
			const url = new GeoURL("geo:0,0;crs=0")
			expect(url.crs).toBe("0")
		})
		test("gets an unknown crs value", () => {
			const url = new GeoURL("geo:0,0;crs=whatever123")
			expect(url.crs).toBe("whatever123")
		})
	})

	describe("CRS", () => {
		test("gets the crs value", () => {
			const url = new GeoURL("geo:0,0;crs=whatever123")
			expect(url.CRS).toBe("whatever123")
		})
	})

	describe("coordinatesString", () => {
		test("gets the value for a simple 2-coordinate url", () => {
			const url = new GeoURL("geo:13.4125,103.8667")
			expect(url.coordinatesString).toBe("13.4125,103.8667")
		})
		test("gets the value for a simple 3-coordinate url", () => {
			const url = new GeoURL("geo:48.2010,16.3695,183")
			expect(url.coordinatesString).toBe("48.2010,16.3695,183")
		})
		test("gets the value for a 2-coordinate url with geo parameters", () => {
			const url = new GeoURL("geo:48.198634,16.371648;crs=wgs84;u=40")
			expect(url.coordinatesString).toBe("48.198634,16.371648")
		})
	})

	describe("coordinates", () => {
		test("gets the value for a simple 2-coordinate url", () => {
			const url = new GeoURL("geo:13.4125,103.8667")
			expect(url.coordinates).toStrictEqual([13.4125, 103.8667])
		})
		test("gets the value for a simple 3-coordinate url", () => {
			const url = new GeoURL("geo:48.2010,16.3695,183")
			expect(url.coordinates).toStrictEqual([48.2010, 16.3695, 183])
		})
		test("gets the value for a 2-coordinate url with geo parameters", () => {
			const url = new GeoURL("geo:48.198634,16.371648;crs=wgs84;u=40")
			expect(url.coordinates).toStrictEqual([48.198634, 16.371648])
		})
		test("allows coord-a that would be below the allowed range in WGS84", () => {
			const url = new GeoURL("geo:-91,0;crs=unknown")
			expect(url.coordinates).toStrictEqual([-91, 0])
		})
		test("allows coord-a that would be above the allowed range in WGS84", () => {
			const url = new GeoURL("geo:91,0;crs=unknown")
			expect(url.coordinates).toStrictEqual([91, 0])
		})
		test("allows coord-b that would be below the allowed range in WGS84", () => {
			const url = new GeoURL("geo:0,-181;crs=unknown")
			expect(url.coordinates).toStrictEqual([0, -181])
		})
		test("allows coord-b that would be above the allowed range in WGS84", () => {
			const url = new GeoURL("geo:0,181;crs=unknown")
			expect(url.coordinates).toStrictEqual([0, 181])
		})
	})

	test("has individual coord properties for a simple 2-coordinate url", () => {
		const url = new GeoURL("geo:22.3,-118.44")
		expect(url.coordA).toBe(22.3)
		expect(url.coordB).toBe(-118.44)
		expect(url.coordC).toBeUndefined()
	})
	test("has individual coord properties for a simple 3-coordinate url", () => {
		const url = new GeoURL("geo:22.3,-118.44,43.21")
		expect(url.coordA).toBe(22.3)
		expect(url.coordB).toBe(-118.44)
		expect(url.coordC).toBe(43.21)
	})

	describe("u", () => {
		test("returns undefined for a missing uncertainty param", () => {
			const url = new GeoURL("geo:0,0")
			expect(url.u).toBeUndefined()
		})
		test("gets the value", () => {
			const url = new GeoURL("geo:0,0;u=12.34")
			expect(url.u).toBe(12.34)
		})
		test("ignores '&u' in geo parameters", () => {
			const url = new GeoURL("geo:60,30;u=1000;v=&u")
			expect(url.u).toBe(1000)
		})

		test("adds the u geo parameter", () => {
			const url = new GeoURL("geo:1,2")
			const params = url.geoParams
			url.u = 3
			expect(url.toString()).toBe("geo:1,2;u=3")
			expect(params.get("u")).toBe("3")
			expect(url.u).toBe(3)
		})
		test("updates the u geo parameter", () => {
			const url = new GeoURL("geo:1,2;u=3")
			const params = url.geoParams
			url.u = 4
			expect(url.toString()).toBe("geo:1,2;u=4")
			expect(params.get("u")).toBe("4")
			expect(url.u).toBe(4)
		})
		test("does nothing when setting to undefined if the u geo parameter is missing", () => {
			const url = new GeoURL("geo:1,2")
			const params = url.geoParams
			url.u = undefined
			expect(url.toString()).toBe("geo:1,2")
			expect(params.get("u")).toBeNull()
			expect(url.u).toBeUndefined()
		})
		test("formats the value in fixed-point notation", () => {
			const url = new GeoURL("geo:1,2")
			url.u = 0.0000001
			expect(url.geoParams.get("u")).toBe("0.0000001")
		})
		test("formats the value in fixed-point notation up to a nanometer precision", () => {
			const url = new GeoURL("geo:1,2")
			url.u = 0.000000001
			expect(url.geoParams.get("u")).toBe("0.000000001")
		})
		test("formats the value in fixed-point notation up to a nanometer precision but not beyond", () => {
			const url = new GeoURL("geo:1,2")
			url.u = 0.0000000001
			expect(url.geoParams.get("u")).toBe("0")
		})
		test("formats the value in fixed-point notation with a reasonable precision for arithmetic", () => {
			const url = new GeoURL("geo:1,2")
			url.u = 0.1 + 0.2
			expect(url.geoParams.get("u")).toBe("0.3")
		})
		test("formats the value keeping trailing zeros for integer values", () => {
			const url = new GeoURL("geo:1,2")
			url.u = 1000
			expect(url.geoParams.get("u")).toBe("1000")
		})
		test("deletes the u geo parameter", () => {
			const url = new GeoURL("geo:1,2;u=3")
			const params = url.geoParams
			url.u = undefined
			expect(url.toString()).toBe("geo:1,2")
			expect(params.get("u")).toBeNull()
			expect(url.u).toBeUndefined()
		})
	})

	describe("uncertainty", () => {
		test("gets the u value", () => {
			const url = new GeoURL("geo:0,0;u=23.45")
			expect(url.uncertainty).toBe(23.45)
		})
		test("sets the u value", () => {
			const url = new GeoURL("geo:1,2;u=3")
			const params = url.geoParams
			url.uncertainty = 4
			expect(url.toString()).toBe("geo:1,2;u=4")
			expect(params.get("u")).toBe("4")
			expect(url.u).toBe(4)
			expect(url.uncertainty).toBe(4)
		})
	})
})
