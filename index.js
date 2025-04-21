"use strict"

export class GeoURL {
	constructor(urlString) {
		this.url = new URL(urlString)
		if (this.url.protocol != "geo:") {
			throw new TypeError(`Invalid protocol ${this.url.protocol}`)
		}
	}

	toJSON() {
		return this.url.toJSON()
	}
	toString() {
		return this.url.toString()
	}

	get href() {
		return this.url.href
	}
	get pathname() {
		return this.url.pathname
	}
	get protocol() {
		return this.url.protocol
	}
	get search() {
		return this.url.search
	}
	get searchParams() {
		return this.url.searchParams
	}

	get geoParams() {
		const [_coordinatesString, ...paramStrings] = this.pathname.split(";")
		const escapedParamStrings = paramStrings.map(paramString => paramString.replaceAll("&", encodeURIComponent("&")))
		return new URLSearchParams(escapedParamStrings.join("&"))
	}

	get crs() {
		return this.geoParams.get("crs") || "wgs84"
	}
	get CRS() {
		return this.crs
	}

	get coordinatesString() {
		const [coordinatesString] = this.pathname.split(";")
		return coordinatesString
	}
	get coordinates() {
		const coordinates = this.coordinatesString.split(",")
		return coordinates.map(Number)
	}
}

export class WGS84GeoURL extends GeoURL {
	constructor(urlString) {
		super(urlString)
		if (this.crs != "wgs84") {
			throw new TypeError(`Unexpected CRS ${this.crs}`)
		}
	}

	get latLon() {
		return [this.lat, this.lon]
	}
	get latLng() {
		return this.latLon
	}
	get lonLat() {
		return [this.lon, this.lat]
	}
	get lngLat() {
		return this.lonLat
	}

	get lat() {
		return this.coordinates[0]
	}
	get latitude() {
		return this.lat
	}
	get lon() {
		return this.coordinates[1]
	}
	get lng() {
		return this.lon
	}
	get longitude() {
		return this.lon
	}
	get alt() {
		return this.coordinates[2]
	}
	get altitude() {
		return this.alt
	}
}
