import { describe, test, expect } from "vitest"

import { GeoURL } from "./index.js"

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
	test("Has coordinatesString property for 2-coordinate url with geo parameters", () => {
		const url = new GeoURL("geo:48.198634,16.371648;crs=wgs84;u=40")
		expect(url.coordinatesString).toBe("48.198634,16.371648")
	})

	test("Has coordinates property for simple 2-coordinate url", () => {
		const url = new GeoURL("geo:13.4125,103.8667")
		expect(url.coordinates).toStrictEqual([13.4125, 103.8667])
	})
	test("Has coordinates property for 2-coordinate url with geo parameters", () => {
		const url = new GeoURL("geo:48.198634,16.371648;crs=wgs84;u=40")
		expect(url.coordinates).toStrictEqual([48.198634, 16.371648])
	})
})
