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

	test("Provides href getter", () => {
		const url = new GeoURL("geo:47.6,-122.3?z=11")
		expect(url.href).toBe("geo:47.6,-122.3?z=11")
	})
	test("Provides pathname getter", () => {
		const url = new GeoURL("geo:47.6,-122.3?z=11")
		expect(url.pathname).toBe("47.6,-122.3")
	})
	test("Provides protocol getter", () => {
		const url = new GeoURL("geo:13.4125,103.8667")
		expect(url.protocol).toBe("geo:")
	})
	test("Provides search getter", () => {
		const url = new GeoURL("geo:47.6,-122.3?z=11")
		expect(url.search).toBe("?z=11")
	})
	test("Provides searchParams getter", () => {
		const url = new GeoURL("geo:47.6,-122.3?z=11")
		expect(url.searchParams).toStrictEqual(new URLSearchParams({ z: 11 }))
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
	test("Provides z getter when also has z geo parameter", () => {
		const url = new GeoURL("geo:47.6,-122.3;z=16?z=12")
		expect(url.z).toBe(12)
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
	test("Succeeds on mixed-case crs", () => {
		const url = new WGS84GeoURL("geo:0,0;CrS=WgS84")
		expect(url.crs).toBe("wgs84")
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
