import { describe, test, expect } from "vitest"

import { GeoURL, WGS84GeoURL } from "./index.js"

describe("GeoURL", () => {
	test("Fails when no parameters given", () => {
		expect(
			() => new GeoURL()
		).toThrow(TypeError)
	})
	test("Fails on empty string", () => {
		expect(
			() => new GeoURL("")
		).toThrow(TypeError)
	})
	test("Fails on normal url", () => {
		expect(
			() => new GeoURL("https://www.example.com/")
		).toThrow(TypeError)
	})
	test("Fails when provided no coordinates", () => {
		expect(
			() => new GeoURL("geo:")
		).toThrow(TypeError)
	})
	test("Fails when provided one coordinate", () => {
		expect(
			() => new GeoURL("geo:0")
		).toThrow(TypeError)
	})
	test("Fails when provided 2 empty coordinates", () => {
		expect(
			() => new GeoURL("geo:,")
		).toThrow(TypeError)
	})
	test("Fails when provided 3 empty coordinates", () => {
		expect(
			() => new GeoURL("geo:,,")
		).toThrow(TypeError)
	})
	test("Fails when provided 2 NaN coordinates", () => {
		expect(
			() => new GeoURL("geo:no,nope")
		).toThrow(TypeError)
	})

	test("Converts to json", () => {
		const url = new GeoURL("geo:47.6,-122.3?z=11")
		expect(url.toJSON()).toBe("geo:47.6,-122.3?z=11")
	})
	test("Converts to string", () => {
		const url = new GeoURL("geo:47.6,-122.3?z=11")
		expect(url.toString()).toBe("geo:47.6,-122.3?z=11")
	})
	test("Converts to string when constructed from URL object", () => {
		const sourceUrl = new URL("geo:12,34;u=56?z=78#id9")
		const url = new GeoURL(sourceUrl)
		expect(url.toString()).toBe("geo:12,34;u=56?z=78#id9")
	})
	test("Converts to string when constructed from GeoURL object", () => {
		const sourceUrl = new GeoURL("geo:12,34;u=56?z=78#id9")
		const url = new GeoURL(sourceUrl)
		expect(url.toString()).toBe("geo:12,34;u=56?z=78#id9")
	})
	test("Allows to add hash to base geo uri", () => {
		const url = new GeoURL("#hash", "geo:12,34")
		expect(url.toString()).toBe("geo:12,34#hash")
	})

	test("Parses valid geo URI", () => {
		const url = GeoURL.parse("geo:12,34")
		expect(url).toBeInstanceOf(GeoURL)
		expect(url.toString()).toBe("geo:12,34")
	})
	test("Parses invalid geo URI but valid URL", () => {
		const url = GeoURL.parse("geo:12")
		expect(url).toBeNull()
	})
	test("Parses invalid URL", () => {
		const url = GeoURL.parse("xz")
		expect(url).toBeNull()
	})
	test("Parses valid relative geo URI", () => {
		const url = GeoURL.parse("#hash", "geo:12,34")
		expect(url).toBeInstanceOf(GeoURL)
		expect(url.toString()).toBe("geo:12,34#hash")
	})

	test("Checks if can parse valid geo URI", () => {
		expect(GeoURL.canParse("geo:12,34")).toBe(true)
	})
	test("Checks if can parse invalid geo URI but valid URL", () => {
		expect(GeoURL.canParse("geo:12")).toBe(false)
	})
	test("Checks if can parse invalid URL", () => {
		expect(GeoURL.canParse("xz")).toBe(false)
	})
	test("Checks if can parse valid relative geo URI", () => {
		expect(GeoURL.canParse("#hash", "geo:12,34")).toBe(true)
	})

	test("Provides protocol getter", () => {
		const url = new GeoURL("geo:13.4125,103.8667")
		expect(url.protocol).toBe("geo:")
	})
	test("Ensures that protocol is case-insensitive", () => {
		const url = new GeoURL("GeO:1,2")
		expect(url.protocol).toBe("geo:")
	})

	test("Provides href getter", () => {
		const url = new GeoURL("geo:47.6,-122.3?z=11")
		expect(url.href).toBe("geo:47.6,-122.3?z=11")
	})
	test("Provides origin getter", () => {
		const url = new GeoURL("geo:47.6,-122.3?z=11")
		expect(url.origin).toBe("null")
	})
	test("Provides username getter", () => {
		const url = new GeoURL("geo:47.6,-122.3?z=11")
		expect(url.username).toBe("")
	})
	test("Provides password getter", () => {
		const url = new GeoURL("geo:47.6,-122.3?z=11")
		expect(url.password).toBe("")
	})
	test("Provides host getter", () => {
		const url = new GeoURL("geo:47.6,-122.3?z=11")
		expect(url.host).toBe("")
	})
	test("Provides hostname getter", () => {
		const url = new GeoURL("geo:47.6,-122.3?z=11")
		expect(url.hostname).toBe("")
	})
	test("Provides port getter", () => {
		const url = new GeoURL("geo:47.6,-122.3?z=11")
		expect(url.port).toBe("")
	})
	test("Provides pathname getter", () => {
		const url = new GeoURL("geo:47.6,-122.3?z=11")
		expect(url.pathname).toBe("47.6,-122.3")
	})

	test("Gets search property", () => {
		const url = new GeoURL("geo:47.6,-122.3?z=11")
		expect(url.search).toBe("?z=11")
	})
	test("Sets search property", () => {
		const url = new GeoURL("geo:47.6,-122.3?z=11")
		const searchParams = url.searchParams
		url.search = "x=12"
		expect(url.search).toBe("?x=12")
		expect(url.toString()).toBe("geo:47.6,-122.3?x=12")
		expect(url.z).toBeUndefined()
		expect(searchParams).toStrictEqual(new URLSearchParams({ x: 12 }))
	})
	test("Sets search property with leading '?'", () => {
		const url = new GeoURL("geo:47.6,-122.3?z=11")
		const searchParams = url.searchParams
		url.search = "?x=12"
		expect(url.search).toBe("?x=12")
		expect(url.toString()).toBe("geo:47.6,-122.3?x=12")
		expect(url.z).toBeUndefined()
		expect(searchParams).toStrictEqual(new URLSearchParams({ x: 12 }))
	})
	test("Sets search property to empty string", () => {
		const url = new GeoURL("geo:47.6,-122.3?z=11")
		const searchParams = url.searchParams
		url.search = ""
		expect(url.search).toBe("")
		expect(url.toString()).toBe("geo:47.6,-122.3")
		expect(url.z).toBeUndefined()
		expect(searchParams).toStrictEqual(new URLSearchParams())
	})
	test("Sets search property to '?'", () => {
		const url = new GeoURL("geo:47.6,-122.3?z=11")
		const searchParams = url.searchParams
		url.search = "?"
		expect(url.search).toBe("")
		expect(url.toString()).toBe("geo:47.6,-122.3?")
		expect(url.z).toBeUndefined()
		expect(searchParams).toStrictEqual(new URLSearchParams())
	})
	test("Sets search property to a new z value", () => {
		const url = new GeoURL("geo:47.6,-122.3?z=11")
		const searchParams = url.searchParams
		url.search = "z=12"
		expect(url.search).toBe("?z=12")
		expect(url.toString()).toBe("geo:47.6,-122.3?z=12")
		expect(url.z).toBe(12)
		expect(searchParams).toStrictEqual(new URLSearchParams({ z: 12 }))
	})

	test("Provides searchParams getter", () => {
		const url = new GeoURL("geo:47.6,-122.3?z=11")
		expect(url.searchParams).toStrictEqual(new URLSearchParams({ z: 11 }))
	})
	test("Provides hash getter", () => {
		const url = new GeoURL("geo:12,34#some-id")
		expect(url.hash).toBe("#some-id")
	})

	test("Provides z getter for undefined name and value", () => {
		const url = new GeoURL("geo:47.6,-122.3")
		expect(url.z).toBeUndefined()
	})
	test("Provides z getter for name without value", () => {
		const url = new GeoURL("geo:47.6,-122.3?z")
		expect(url.z).toBeUndefined()
	})
	test("Provides z getter for name with empty value", () => {
		const url = new GeoURL("geo:47.6,-122.3?z=")
		expect(url.z).toBeUndefined()
	})
	test("Provides z getter", () => {
		const url = new GeoURL("geo:47.6,-122.3?z=11")
		expect(url.z).toBe(11)
	})
	test("Ignores uppercase z parameter", () => {
		const url = new GeoURL("geo:1,2?Z=12")
		expect(url.z).toBeUndefined()
	})
	test("Ignores uppercase z parameter before lowercase z parameter", () => {
		const url = new GeoURL("geo:1,2?Z=12&z=9")
		expect(url.z).toBe(9)
	})
	test("Ignores uppercase z parameter after lowercase z parameter", () => {
		const url = new GeoURL("geo:1,2?z=7&Z=12")
		expect(url.z).toBe(7)
	})
	test("Ignores z geo parameter", () => {
		const url = new GeoURL("geo:47.6,-122.3;z=16?z=12")
		expect(url.z).toBe(12)
	})
	test("Ignores false z geo parameter", () => {
		const url = new GeoURL("geo:48.858249,2.294541;skip=lol&z?z=19")
		expect(url.z).toBe(19)
	})
	test("Provides zoom alias getter", () => {
		const url = new GeoURL("geo:47.6,-122.3?z=10")
		expect(url.zoom).toBe(10)
	})

	test("Provides geoParams.get() for missing values", () => {
		const url = new GeoURL("geo:0,0")
		expect(url.geoParams.get("foo")).toBeNull()
	})
	test("Provides geoParams.get() for regular values", () => {
		const url = new GeoURL("geo:0,0;foo=bar")
		expect(url.geoParams.get("foo")).toBe("bar")
	})
	test("Provides geoParams.get() for values with '&'", () => {
		const url = new GeoURL("geo:0,0;foo=bar&baz")
		expect(url.geoParams.get("foo")).toBe("bar&baz")
		expect(url.geoParams.get("baz")).toBeNull()
	})
	test("Provides geoParams.get() for values with multiple '&'", () => {
		const url = new GeoURL("geo:0,0;foo=bar&baz&zab&rab")
		expect(url.geoParams.get("foo")).toBe("bar&baz&zab&rab")
		expect(url.geoParams.get("baz")).toBeNull()
		expect(url.geoParams.get("zab")).toBeNull()
		expect(url.geoParams.get("rab")).toBeNull()
	})
	test("Provides geoParams.get() preserving value case", () => {
		const url = new GeoURL("geo:0,0;foo=BaR")
		expect(url.geoParams.get("foo")).toBe("BaR")
	})
	test("Provides geoParams.get() preserving value case of crs param", () => {
		const url = new GeoURL("geo:0,0;crs=WGS84")
		expect(url.geoParams.get("crs")).toBe("WGS84")
	})
	test("Provides geoParams.get() for mixed-case names", () => {
		const url = new GeoURL("geo:0,0;FoO=bar")
		expect(url.geoParams.get("foo")).toBe("bar")
	})
	test("Provides geoParams.get() for mixed-case names when requesting uppercase name", () => {
		const url = new GeoURL("geo:0,0;FoO=bar")
		expect(url.geoParams.get("FOO")).toBe("bar")
	})
	test("Provides geoParams.get() for flags", () => {
		const url = new GeoURL("geo:0,0;flag")
		expect(url.geoParams.get("flag")).toBe("")
	})
	test("Doesn't decode '+' in geo params", () => {
		const url = new GeoURL("geo:0,0;plus=+")
		expect(url.geoParams.get("plus")).toBe("+")
	})
	test("Percent-decodes geo params", () => {
		const url = new GeoURL("geo:0,0;decode=%31%32%33")
		expect(url.geoParams.get("decode")).toBe("123")
	})

	test("Has crs property with default value for missing crs", () => {
		const url = new GeoURL("geo:0,0")
		expect(url.crs).toBe("wgs84")
	})
	test("Has crs property for typical wgs84 crs", () => {
		const url = new GeoURL("geo:0,0;crs=wgs84")
		expect(url.crs).toBe("wgs84")
	})
	test("Has crs property for uppercase value", () => {
		const url = new GeoURL("geo:0,0;crs=WGS84")
		expect(url.crs).toBe("wgs84")
	})
	test("Has crs property for value '0'", () => {
		const url = new GeoURL("geo:0,0;crs=0")
		expect(url.crs).toBe("0")
	})
	test("Has crs property for unknown crs", () => {
		const url = new GeoURL("geo:0,0;crs=whatever123")
		expect(url.crs).toBe("whatever123")
	})
	test("Has CRS property", () => {
		const url = new GeoURL("geo:0,0;crs=whatever123")
		expect(url.CRS).toBe("whatever123")
	})

	test("Has coordinatesString property for simple 2-coordinate url", () => {
		const url = new GeoURL("geo:13.4125,103.8667")
		expect(url.coordinatesString).toBe("13.4125,103.8667")
	})
	test("Has coordinatesString property for simple 3-coordinate url", () => {
		const url = new GeoURL("geo:48.2010,16.3695,183")
		expect(url.coordinatesString).toBe("48.2010,16.3695,183")
	})
	test("Has coordinatesString property for 2-coordinate url with geo parameters", () => {
		const url = new GeoURL("geo:48.198634,16.371648;crs=wgs84;u=40")
		expect(url.coordinatesString).toBe("48.198634,16.371648")
	})

	test("Has coordinates property for simple 2-coordinate url", () => {
		const url = new GeoURL("geo:13.4125,103.8667")
		expect(url.coordinates).toStrictEqual([13.4125, 103.8667])
	})
	test("Has coordinates property for simple 3-coordinate url", () => {
		const url = new GeoURL("geo:48.2010,16.3695,183")
		expect(url.coordinates).toStrictEqual([48.2010, 16.3695, 183])
	})
	test("Has coordinates property for 2-coordinate url with geo parameters", () => {
		const url = new GeoURL("geo:48.198634,16.371648;crs=wgs84;u=40")
		expect(url.coordinates).toStrictEqual([48.198634, 16.371648])
	})
	test("Allows coord-a that would be below the allowed range in WGS84", () => {
		const url = new GeoURL("geo:-91,0;crs=unknown")
		expect(url.coordinates).toStrictEqual([-91, 0])
	})
	test("Allows coord-a that would be above the allowed range in WGS84", () => {
		const url = new GeoURL("geo:91,0;crs=unknown")
		expect(url.coordinates).toStrictEqual([91, 0])
	})
	test("Allows coord-b that would be below the allowed range in WGS84", () => {
		const url = new GeoURL("geo:0,-181;crs=unknown")
		expect(url.coordinates).toStrictEqual([0, -181])
	})
	test("Allows coord-b that would be above the allowed range in WGS84", () => {
		const url = new GeoURL("geo:0,181;crs=unknown")
		expect(url.coordinates).toStrictEqual([0, 181])
	})

	test("Has individual coord properties for simple 2-coordinate url", () => {
		const url = new GeoURL("geo:22.3,-118.44")
		expect(url.coordA).toBe(22.3)
		expect(url.coordB).toBe(-118.44)
		expect(url.coordC).toBeUndefined()
	})
	test("Has individual coord properties for simple 3-coordinate url", () => {
		const url = new GeoURL("geo:22.3,-118.44,43.21")
		expect(url.coordA).toBe(22.3)
		expect(url.coordB).toBe(-118.44)
		expect(url.coordC).toBe(43.21)
	})

	test("Has u property for missing uncertainty param", () => {
		const url = new GeoURL("geo:0,0")
		expect(url.u).toBeUndefined()
	})
	test("Has u property", () => {
		const url = new GeoURL("geo:0,0;u=12.34")
		expect(url.u).toBe(12.34)
	})
	test("Ignores false u geo parameter", () => {
		const url = new GeoURL("geo:60,30;u=1000;v=&u")
		expect(url.u).toBe(1000)
	})
	test("Has uncertainty property alias", () => {
		const url = new GeoURL("geo:0,0;u=23.45")
		expect(url.uncertainty).toBe(23.45)
	})
})

describe("WGS84GeoURL", () => {
	test("Fails when no parameters given", () => {
		expect(
			() => new WGS84GeoURL()
		).toThrow(TypeError)
	})
	test("Fails on non-matching crs", () => {
		expect(
			() => new WGS84GeoURL("geo:0,0;crs=unknown")
		).toThrow(TypeError)
	})
	test("Rejects lat below the allowed range in WGS84", () => {
		expect(
			() => new WGS84GeoURL("geo:-91,0")
		).toThrow(TypeError)
	})
	test("Rejects lat above the allowed range in WGS84", () => {
		expect(
			() => new WGS84GeoURL("geo:91,0")
		).toThrow(TypeError)
	})
	test("Rejects lon below the allowed range in WGS84", () => {
		expect(
			() => new WGS84GeoURL("geo:0,-181")
		).toThrow(TypeError)
	})
	test("Rejects lon above the allowed range in WGS84", () => {
		expect(
			() => new WGS84GeoURL("geo:0,181")
		).toThrow(TypeError)
	})
	test("Succeeds on mixed-case crs", () => {
		const url = new WGS84GeoURL("geo:0,0;CrS=WgS84")
		expect(url.crs).toBe("wgs84")
	})
	test("Allows to add hash to base geo uri", () => {
		const url = new WGS84GeoURL("#hash", "geo:12,34")
		expect(url.toString()).toBe("geo:12,34#hash")
	})

	test("Parses valid geo URI", () => {
		const url = WGS84GeoURL.parse("geo:12,34")
		expect(url).toBeInstanceOf(WGS84GeoURL)
		expect(url.toString()).toBe("geo:12,34")
	})
	test("Parses valid non-WGS84 geo URL", () => {
		const url = WGS84GeoURL.parse("geo:0,0;crs=unknown")
		expect(url).toBeNull()
	})

	test("Checks if can parse valid geo URI", () => {
		expect(WGS84GeoURL.canParse("geo:12,34")).toBe(true)

	})
	test("Checks if can parse valid non-WGS84 geo URL", () => {
		expect(WGS84GeoURL.canParse("geo:0,0;crs=unknown")).toBe(false)
	})

	test("Has latLon/lonLat/*lng array properties for simple 2-coordinate url", () => {
		const url = new WGS84GeoURL("geo:13.4125,103.8667")
		expect(url.latLon).toStrictEqual([13.4125, 103.8667])
		expect(url.latLng).toStrictEqual([13.4125, 103.8667])
		expect(url.lonLat).toStrictEqual([103.8667, 13.4125])
		expect(url.lngLat).toStrictEqual([103.8667, 13.4125])
	})
	test("Has latLon/lonLat/*lng array properties for simple 3-coordinate url", () => {
		const url = new WGS84GeoURL("geo:48.2010,16.3695,183")
		expect(url.latLon).toStrictEqual([48.2010, 16.3695])
		expect(url.latLng).toStrictEqual([48.2010, 16.3695])
		expect(url.lonLat).toStrictEqual([16.3695, 48.2010])
		expect(url.lngLat).toStrictEqual([16.3695, 48.2010])
	})

	test("Has lat and lon/lng properties for simple 2-coordinate url", () => {
		const url = new WGS84GeoURL("geo:13.4125,103.8667")
		expect(url.lat).toBe(13.4125)
		expect(url.lon).toBe(103.8667)
		expect(url.lng).toBe(103.8667)
	})
	test("Has latitude and longitude properties for simple 2-coordinate url", () => {
		const url = new WGS84GeoURL("geo:13.4125,103.8667")
		expect(url.latitude).toBe(13.4125)
		expect(url.longitude).toBe(103.8667)
	})
	test("Has undefined alt property for simple 2-coordinate url", () => {
		const url = new WGS84GeoURL("geo:13.4125,103.8667")
		expect(url.alt).toBeUndefined()
	})
	test("Has undefined altitude property for simple 2-coordinate url", () => {
		const url = new WGS84GeoURL("geo:13.4125,103.8667")
		expect(url.altitude).toBeUndefined()
	})
	test("Has alt property for simple 3-coordinate url", () => {
		const url = new WGS84GeoURL("geo:48.2010,16.3695,183")
		expect(url.alt).toBe(183)
	})
	test("Has altitude property for simple 3-coordinate url", () => {
		const url = new WGS84GeoURL("geo:48.2010,16.3695,183")
		expect(url.altitude).toBe(183)
	})
	test("Has undefined alt property for empty alt value", () => {
		const url = new WGS84GeoURL("geo:0,0,")
		expect(url.alt).toBeUndefined()
	})
})
