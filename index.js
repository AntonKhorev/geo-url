"use strict"

/**
 * URL interface for geo URI with an arbitrary CRS
 */
export class GeoURL {
	#url
	#coordinates

	constructor(urlString) {
		this.#url = new URL(urlString)
		if (this.#url.protocol != "geo:") {
			throw new TypeError(`Invalid protocol ${this.#url.protocol}`)
		}
		if (this.coordinates.length < 2) {
			throw new TypeError(`Invalid number of coordinates`)
		}
		if (typeof this.coordA != 'number' || typeof this.coordB != 'number') {
			throw new TypeError(`Invalid coordinate value`)
		}
	}

	toJSON() {
		return this.#url.toJSON()
	}
	toString() {
		return this.#url.toString()
	}

	get href() {
		return this.#url.href
	}
	get pathname() {
		return this.#url.pathname
	}
	get protocol() {
		return this.#url.protocol
	}
	get search() {
		return this.#url.search
	}
	get searchParams() {
		return this.#url.searchParams
	}

	get z() {
		return parseNumber(this.searchParams.get("z"))
	}
	get zoom() {
		return this.z
	}

	get geoParams() {
		const [_coordinatesString, ...paramStrings] = this.pathname.split(";")
		const processedParamStrings = paramStrings.map(paramString => {
			const [name, value] = paramString.split("=")
			return [name.toLowerCase(), decodeURIComponent(value || "")]
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

	/**
	 * Uncertainty in meters
	 * @type {number|undefined}
	 * @see {@link https://datatracker.ietf.org/doc/html/rfc5870#section-3.4.3|RFC 5870} for parameter description
	 */
	get u() {
		return parseNumber(this.geoParams.get("u"))
	}
	/**
	 * Uncertainty in meters
	 *
	 * A longer name for {@link GeoURL#u}
	 * @type {number|undefined}
	 */
	get uncertainty() {
		return this.u
	}
}

/**
 * URL interface for WGS84 geo URI with latitude, longitude and possibly altitude
 */
export class WGS84GeoURL extends GeoURL {
	constructor(urlString) {
		super(urlString)
		if (this.crs != "wgs84") {
			throw new TypeError(`Unexpected CRS ${this.crs}`)
		}
		if (this.lat < -90 || this.lat > 90) {
			throw new TypeError(`Latitude ${this.lat} outside of the allowed range`)
		}
		if (this.lon < -180 || this.lon > 180) {
			throw new TypeError(`Longitude ${this.lon} outside of the allowed range`)
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

	/**
	 * Latitude in decimal degrees between -90 and 90
	 * @type {number}
	 * @see {@link https://datatracker.ietf.org/doc/html/rfc5870#section-3.4.2|RFC 5870} for component description
	 */
	get lat() {
		return this.coordA
	}
	/**
	 * Latitude in decimal degrees between -90 and 90
	 *
	 * A longer name for {@link WGS84GeoURL#lat}
	 * @type {number}
	 */
	get latitude() {
		return this.coordA
	}
	/**
	 * Longitude in decimal degrees between -180 and 180
	 * @type {number}
	 * @see {@link https://datatracker.ietf.org/doc/html/rfc5870#section-3.4.2|RFC 5870} for component description
	 */
	get lon() {
		return this.coordB
	}
	/**
	 * Longitude in decimal degrees between -180 and 180
	 *
	 * An alternative name for {@link WGS84GeoURL#lon}, as used for example in Leaflet
	 * @type {number}
	 */
	get lng() {
		return this.coordB
	}
	/**
	 * Longitude in decimal degrees between -180 and 180
	 *
	 * A longer name for {@link WGS84GeoURL#lon}
	 * @type {number}
	 */
	get longitude() {
		return this.coordB
	}
	/**
	 * Altitude in meters
	 * @type {number|undefined}
	 * @see {@link https://datatracker.ietf.org/doc/html/rfc5870#section-3.4.2|RFC 5870} for component description
	 */
	get alt() {
		return this.coordC
	}
	/**
	 * Altitude in meters
	 *
	 * A longer name for {@link WGS84GeoURL#alt}
	 * @type {number|undefined}
	 */
	get altitude() {
		return this.coordC
	}
}

function parseNumber(s) {
	const v = parseFloat(s)
	return isNaN(v) ? undefined : v
}
