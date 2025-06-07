import { describe, test, expect } from "vitest"

import { WGS84GeoURL } from "../index.js"

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

	test("Allows updating crs to a matching value through geo params", () => {
		const url = new WGS84GeoURL("geo:0,0")
		url.geoParams.set("crs", "wgs84")
		expect(url.toString()).toBe("geo:0,0;crs=wgs84")
	})
	test("Allows updating crs to a matching value through geo params ignoring case", () => {
		const url = new WGS84GeoURL("geo:0,0")
		url.geoParams.set("cRs", "wGs84")
		expect(url.toString()).toBe("geo:0,0;cRs=wGs84")
	})
	test("Rejects updating crs to a non-matching value through geo params", () => {
		const url = new WGS84GeoURL("geo:0,0")
		expect(
			() => url.geoParams.set("crs", "oops")
		).toThrow(TypeError)
		expect(url.toString()).toBe("geo:0,0")
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
