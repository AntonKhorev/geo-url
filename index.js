"use strict"

/**
 * URL interface for geo URI with an arbitrary CRS
 */
export class GeoURL {
	#url
	#coordinates

	/**
	 * Create a GeoURL from a string
	 *
	 * Unlike URL, doesn't have `base` parameter because geo URIs can't be relative
	 * @param {string|URL|GeoURL} urlString - anything that URL constructor accepts as a first parameter
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/URL/URL|MDN} for URL constructor
	 */
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

	get hash() {
		return this.#url.hash
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

	/**
	 * Zoom level
	 * 
	 * Example values:
	 * - 0 is for the entire world in one map tile
	 * - 14 is when buildings become visible on OpenStreetMap standard map rendering
	 * @type {number|undefined}
	 * @see {@link https://developers.google.com/maps/documentation/urls/android-intents#display-a-map|Google Maps Intents} for parameter description
	 */
	get z() {
		return parseNumber(this.searchParams.get("z"))
	}
	/**
	 * Zoom level
	 * 
	 * A longer name for {@link GeoURL#z}
	 * @type {number|undefined}
	 */
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
 * @extends GeoURL
 */
export class WGS84GeoURL extends GeoURL {
	/**
	 * Create a WGS84GeoURL from a string
	 *
	 * Limited to WGS84 URIs, which lets interpret them as containing latitude/longitude/altitude.
	 * But that's almost all of the geo URIs because no other CRS is currently supported by RFC 5870.
	 * @param {string|URL|GeoURL} urlString - anything that URL constructor accepts as a first parameter
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/URL/URL|MDN} for URL constructor
	 */
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

	/**
	 * Latitude-longitude pair
	 * @type {number[]}
	 */
	get latLon() {
		return [this.lat, this.lon]
	}
	/**
	 * Latitude-longitude pair
	 *
	 * An alternative name for {@link WGS84GeoURL#latLon}, favored by Leaflet
	 * @type {number[]}
	 * @example
	 * L.marker(url.latLng)
	 */
	get latLng() {
		return this.latLon
	}
	/**
	 * Longitude-latitude pair
	 * 
	 * The order is swapped as compared with the URI and {@link WGS84GeoURL#latLon}
	 * @type {number[]}
	 */
	get lonLat() {
		return [this.lon, this.lat]
	}
	/**
	 * Longitude-latitude pair
	 * 
	 * An alternative name for {@link WGS84GeoURL#lonLat}
	 * @type {number[]}
	 */
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
