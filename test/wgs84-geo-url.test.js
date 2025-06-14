import { describe, test, expect } from "vitest"

import { WGS84GeoURL } from "../src/index.js"

describe("WGS84GeoURL", () => {
	describe("constructor", () => {
		test("fails when no parameters given", () => {
			expect(
				() => new WGS84GeoURL()
			).toThrow(TypeError)
		})
		test("fails on non-matching crs", () => {
			expect(
				() => new WGS84GeoURL("geo:0,0;crs=unknown")
			).toThrow(TypeError)
		})
		test("rejects lat below the allowed range in WGS84", () => {
			expect(
				() => new WGS84GeoURL("geo:-91,0")
			).toThrow(TypeError)
		})
		test("rejects lat above the allowed range in WGS84", () => {
			expect(
				() => new WGS84GeoURL("geo:91,0")
			).toThrow(TypeError)
		})
		test("rejects lon below the allowed range in WGS84", () => {
			expect(
				() => new WGS84GeoURL("geo:0,-181")
			).toThrow(TypeError)
		})
		test("rejects lon above the allowed range in WGS84", () => {
			expect(
				() => new WGS84GeoURL("geo:0,181")
			).toThrow(TypeError)
		})
		test("succeeds on mixed-case crs", () => {
			const url = new WGS84GeoURL("geo:0,0;CrS=WgS84")
			expect(url.crs).toBe("wgs84")
		})
		test("adds a hash to a base geo uri", () => {
			const url = new WGS84GeoURL("#hash", "geo:12,34")
			expect(url.toString()).toBe("geo:12,34#hash")
		})
	})

	describe("geoParams", () => {
		test("updates crs to an allowed value", () => {
			const url = new WGS84GeoURL("geo:0,0")
			url.geoParams.set("crs", "wgs84")
			expect(url.toString()).toBe("geo:0,0;crs=wgs84")
		})
		test("updates crs to an allowed value ignoring its case", () => {
			const url = new WGS84GeoURL("geo:0,0")
			url.geoParams.set("cRs", "wGs84")
			expect(url.toString()).toBe("geo:0,0;cRs=wGs84")
		})
		test("rejects updating crs to a disallowed value", () => {
			const url = new WGS84GeoURL("geo:0,0")
			expect(
				() => url.geoParams.set("crs", "oops")
			).toThrow(TypeError)
			expect(url.toString()).toBe("geo:0,0")
		})
	})

	describe("crs", () => {
		describe("on an url without crs", () => {
			const urlString = "geo:0,0"
			for (const value of ["wgs84", "WGS84"]) test(`does nothing when setting to '${value}'`, () => {
				const url = new WGS84GeoURL(urlString)
				url.crs = value
				expect(url.crs).toBe("wgs84")
				expect(url.toString()).toBe("geo:0,0")
			})
		})
		for (const oldValue of ["wgs84", "WGS84"]) describe(`on an url with crs=${oldValue}`, () => {
			const urlString = `geo:0,0;crs=${oldValue}`
			for (const value of ["wgs84", "WGS84"]) test(`removes the crs geo param when setting to '${value}'`, () => {
				const url = new WGS84GeoURL(urlString)
				url.crs = value
				expect(url.crs).toBe("wgs84")
				expect(url.toString()).toBe("geo:0,0")
			})
		})
		test("rejects updating to a disallowed value", () => {
			const url = new WGS84GeoURL("geo:0,0")
			expect(
				() => url.crs = "oops"
			).toThrow(TypeError)
			expect(url.toString()).toBe("geo:0,0")
		})
	})

	describe("parse", () => {
		test("supports valid geo URIs", () => {
			const url = WGS84GeoURL.parse("geo:12,34")
			expect(url).toBeInstanceOf(WGS84GeoURL)
			expect(url.toString()).toBe("geo:12,34")
		})
		test("returns null on valid non-WGS84 geo URIs", () => {
			const url = WGS84GeoURL.parse("geo:0,0;crs=unknown")
			expect(url).toBeNull()
		})
	})

	describe("canParse", () => {
		test("returns true on valid geo URIs", () => {
			expect(WGS84GeoURL.canParse("geo:12,34")).toBe(true)
		})
		test("returns false on valid non-WGS84 geo URIs", () => {
			expect(WGS84GeoURL.canParse("geo:0,0;crs=unknown")).toBe(false)
		})
	})

	describe("coordinatesString", () => {
		for (const [value, title] of [
			["-91,0", "lat below"],
			["91,0", "lat above"],
			["0,-181", "lon below"],
			["0,181", "lon above"],
		]) test(`rejects ${title} the allowed range in WGS84`, () => {
			const url = new WGS84GeoURL("geo:0,0")
			expect(
				() => url.coordinatesString = value
			).toThrow(TypeError)
			expect(url.coordinatesString).toBe("0,0")
			expect(url.coordinates).toStrictEqual([0, 0])
			expect(url.toString()).toBe("geo:0,0")
		})
	})

	test("has latLon/lonLat/*lng array properties for a simple 2-coordinate url", () => {
		const url = new WGS84GeoURL("geo:13.4125,103.8667")
		expect(url.latLon).toStrictEqual([13.4125, 103.8667])
		expect(url.latLng).toStrictEqual([13.4125, 103.8667])
		expect(url.lonLat).toStrictEqual([103.8667, 13.4125])
		expect(url.lngLat).toStrictEqual([103.8667, 13.4125])
	})
	test("has latLon/lonLat/*lng array properties for a simple 3-coordinate url", () => {
		const url = new WGS84GeoURL("geo:48.2010,16.3695,183")
		expect(url.latLon).toStrictEqual([48.2010, 16.3695])
		expect(url.latLng).toStrictEqual([48.2010, 16.3695])
		expect(url.lonLat).toStrictEqual([16.3695, 48.2010])
		expect(url.lngLat).toStrictEqual([16.3695, 48.2010])
	})

	test("has lat and lon/lng properties for a simple 2-coordinate url", () => {
		const url = new WGS84GeoURL("geo:13.4125,103.8667")
		expect(url.lat).toBe(13.4125)
		expect(url.lon).toBe(103.8667)
		expect(url.lng).toBe(103.8667)
	})
	test("has latitude and longitude properties for a simple 2-coordinate url", () => {
		const url = new WGS84GeoURL("geo:13.4125,103.8667")
		expect(url.latitude).toBe(13.4125)
		expect(url.longitude).toBe(103.8667)
	})

	describe("alt", () => {
		test("returns undefined for a simple 2-coordinate url", () => {
			const url = new WGS84GeoURL("geo:13.4125,103.8667")
			expect(url.alt).toBeUndefined()
		})
		test("gets the altitude of simple 3-coordinate url", () => {
			const url = new WGS84GeoURL("geo:48.2010,16.3695,183")
			expect(url.alt).toBe(183)
		})
		test("returns undefined for an empty altitude", () => {
			const url = new WGS84GeoURL("geo:0,0,")
			expect(url.alt).toBeUndefined()
		})
	})

	describe("altitude", () => {
		test("returns undefined for a simple 2-coordinate url", () => {
			const url = new WGS84GeoURL("geo:13.4125,103.8667")
			expect(url.altitude).toBeUndefined()
		})
		test("gets the altitude of a simple 3-coordinate url", () => {
			const url = new WGS84GeoURL("geo:48.2010,16.3695,183")
			expect(url.altitude).toBe(183)
		})
	})
})
