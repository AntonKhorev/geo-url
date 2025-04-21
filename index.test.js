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
})

describe("WGS84GeoURL", () => {
	test("Fails when no parameters given", () => {
		expect(
			() => new WGS84GeoURL()
		).toThrow(TypeError)
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
})
