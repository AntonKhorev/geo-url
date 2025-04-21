"use strict"

export class GeoURL {
	#coordinates

	constructor(urlString) {
		this.url = new URL(urlString)
		if (this.url.protocol != "geo:") {
			throw new TypeError(`Invalid protocol ${this.url.protocol}`)
		}
		if (this.coordinates.length < 2) {
			throw new TypeError(`Invalid number of coordinates`)
		}
		if (typeof this.coordA != 'number' || typeof this.coordB != 'number') {
			throw new TypeError(`Invalid coordinate value`)
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

	get z() {
		return parseNumber(this.searchParams.get("z"))
	}

	get geoParams() {
		const [_coordinatesString, ...paramStrings] = this.pathname.split(";")
		const processedParamStrings = paramStrings.map(paramString => {
			const [name, value] = paramString.split("=")
			return [name.toLowerCase(), decodeURIComponent(value)]
		})
		const paramsMap = new Map(processedParamStrings)

		return {
			get: name => {
				const value = paramsMap.get(name.toLowerCase())
				if (value == null) return null // Map returns undefined, but URLSearchParams returns null
				return value
			}
		}
	}

	get crs() {
		const crsWithPreservedCase = this.geoParams.get("crs") || "wgs84"
		return crsWithPreservedCase.toLowerCase()
	}
	get CRS() {
		return this.crs
	}

	get coordinatesString() {
		const [coordinatesString] = this.pathname.split(";")
		return coordinatesString
	}
	get coordinates() {
		if (this.#coordinates) {
			return this.#coordinates
		}

		const coordinateStrings = this.coordinatesString.split(",")
		this.#coordinates = coordinateStrings.map(parseNumber)
		return this.#coordinates
	}
	get coordA() {
		return this.coordinates[0]
	}
	get coordB() {
		return this.coordinates[1]
	}
	get coordC() {
		return this.coordinates[2]
	}

	get u() {
		return parseNumber(this.geoParams.get("u"))
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
		return this.coordA
	}
	get latitude() {
		return this.coordA
	}
	get lon() {
		return this.coordB
	}
	get lng() {
		return this.coordB
	}
	get longitude() {
		return this.coordB
	}
	get alt() {
		return this.coordC
	}
	get altitude() {
		return this.coordC
	}
}

function parseNumber(s) {
	const v = parseFloat(s)
	return isNaN(v) ? undefined : v
}
