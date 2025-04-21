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
	get latLon() {
		return this.coordinates
	}
	get latLng() {
		return this.coordinates
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
}
