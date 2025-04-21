"use strict"

export class GeoURL {
	constructor(urlString) {
		this.url = new URL(urlString)
		if (this.url.protocol != "geo:") {
			throw new TypeError(`Invalid protocol ${this.url.protocol}`)
		}
		if (this.coordinates.length < 2) {
			throw new TypeError(`Invalid number of coordinates`)
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
		const stringValue = this.searchParams.get("z")
		if (stringValue == null) return undefined
		const numberValue = parseFloat(stringValue)
		if (isNaN(numberValue)) return undefined
		return numberValue
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
