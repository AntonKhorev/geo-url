"use strict"

let setGeoURLParamsURL

/**
 * Geo URI Parameters as defined in RFC 5870
 * 
 * Intended to be similar to {@link https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams|URLSearchParams},
 * with an {@link https://url.spec.whatwg.org/#concept-urlsearchparams-url-object|associated URL object}.
 */
export class GeoParams {
	#p
	#url

	// see https://github.com/nodejs/node/blob/0c6e16bc849450a450a9d2dbfbf6244c04f90642/lib/internal/url.js#L319 for a similar approach
	static {
		setGeoURLParamsURL = (obj, url) => {
			obj.#url = url
		}
	}

	/**
	 * @param {string} p
	 * @see {@link https://datatracker.ietf.org/doc/html/rfc5870#section-3.3|RFC 5870} for p syntax
	 */
	constructor(p) {
		this.#p = String(p)
	}

	/**
	 * Get the value associated to the given parameter
	 * @param {string} name
	 * @returns {string|null} - parameter value or null for a missing parameter
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/get|MDN} for the similar method of URLSearchParams
	 */
	get(name) {
		const [, kvs] = this.#readCoordsAndKvs()

		for (const kv of kvs) {
			const [k, v] = kv.split("=")
			if (k.toLowerCase() == name.toLowerCase()) {
				return decodeURIComponent(v || "")
			}
		}
		return null
	}

	/**
	 * Set the value associated with a given parameter to the given value
	 * @param {string} name
	 * @param {string} value
	 * @returns {void}
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/set|MDN} for the similar method of URLSearchParams
	 */
	set(name, value) {
		const [coordinatesString, kvs] = this.#readCoordsAndKvs()

		this.#setKvs(kvs, name, value)

		if (this.#url) {
			this.#url.href = `${this.#url.protocol}${coordinatesString};${kvs.join(";")}${this.#url.search}${this.#url.hash}`
		} else {
			this.#p = kvs.join(";")
		}
	}

	/**
	 * Convert the parameters to a string
	 * @returns {string} - a semicolon-separated list of parameters, the part of RFC 5870 geo URI that comes after the coordinates
	 */
	toString() {
		if (this.#url) {
			[, paramsString] = this.#url.pathname.split(/;(.*)/)
			return paramsString
		} else {
			return this.#p
		}
	}

	#readCoordsAndKvs() {
		if (this.#url) {
			const [coordinatesString, ...kvs] = this.#url.pathname.split(";")
			return [coordinatesString, kvs]
		} else if (this.#p == "") {
			return [null, []]
		} else {
			const kvs = this.#p.split(";")
			return [null, kvs]
		}
	}

	#setKvs(kvs, name, value) {
		for (const [i, kv] of kvs.entries()) {
			const [k] = kv.split("=")
			if (k.toLowerCase() == name.toLowerCase()) {
				kvs[i] = this.#makeKv(name, value)
				return
			}
		}

		if (name == "crs" || name.toLowerCase() == "u") {
			kvs.unshift(this.#makeKv(name, value))
		} else {
			kvs.push(this.#makeKv(name, value))
		}
	}

	#makeKv(name, value) {
		if (value == "") return name

		const pUnreservedChars = "[]:&+$"
		let encodedValue = encodeURIComponent(value)
		for (const c of pUnreservedChars) {
			encodedValue = encodedValue.replaceAll(encodeURIComponent(c), c)
		}
		return `${name}=${encodedValue}`
	}
}

/**
 * URL interface for geo URI with an arbitrary CRS
 */
export class GeoURL {
	#url
	#coordinates

	/**
	 * Create a GeoURL from a string or another URL object
	 * 
	 * Expected to be almost always invoked with one parameter because there's not much use of relative references in case of geo URIs.
	 * At best you can add a hash to a base geo URI using a relative reference, but hashes in geo URIs a probably not widely used.
	 * @param {string|URL|GeoURL} url - geo URI or relative reference
	 * @param {string|URL|GeoURL} base - base geo URI
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/URL/URL|MDN} for URL constructor
	 */
	constructor(url, base) {
		this.#url = new URL(url, base)
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

	/**
	 * Create a GeoURL or return null on error
	 * @param {string|URL|GeoURL} url - geo URI or relative reference
	 * @param {string|URL|GeoURL} base - base geo URI
	 * @returns {GeoURL|null}
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/URL/parse_static|MDN} for parse() static method
	 */
	static parse(url, base) {
		try {
			return new this(url, base)
		} catch {
			return null
		}
	}

	/**
	 * Check if url is parsable as a valid geo URI
	 * @param {string|URL|GeoURL} url - geo URI or relative reference
	 * @param {string|URL|GeoURL} base - base geo URI
	 * @returns {boolean}
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/URL/canParse_static|MDN} for canParse() static method
	 */
	static canParse(url, base) {
		return this.parse(url, base) !== null
	}

	/**
	 * Serialize the URL, which is the same as converting it to a string
	 * @returns {string}
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/URL/toJSON|MDN} for toJSON() method
	 */
	toJSON() {
		return this.#url.toJSON()
	}
	/**
	 * Convert the URL to a string
	 * @returns {string}
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/URL/toString|MDN} for toString() method
	 */
	toString() {
		return this.#url.toString()
	}

	get href() {
		return this.#url.href
	}
	get origin() {
		return this.#url.origin
	}
	get protocol() {
		return this.#url.protocol
	}
	get username() {
		return this.#url.username
	}
	get password() {
		return this.#url.password
	}
	get host() {
		return this.#url.host
	}
	get hostname() {
		return this.#url.hostname
	}
	get port() {
		return this.#url.port
	}
	get pathname() {
		return this.#url.pathname
	}

	/**
	 * URL search/query string
	 * @type {string}
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/URL/search|MDN} for search property
	 */
	get search() {
		return this.#url.search
	}
	set search(value) {
		this.#url.search = value
	}

	/**
	 * URLSearchParams object
	 * @type {URLSearchParams}
	 * @readonly
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/URL/searchParams|MDN} for searchParams property
	 */
	get searchParams() {
		return this.#url.searchParams
	}

	/**
	 * URL hash property containing the fragment identifier
	 * @type {string}
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/URL/hash|MDN} for hash property
	 */
	get hash() {
		return this.#url.hash
	}
	set hash(value) {
		this.#url.hash = value
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
	set z(value) {
		this.#url.searchParams.set("z", value)
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
	set zoom(value) {
		this.z = value
	}

	/**
	 * geo URI parameters object
	 * @type {GeoParams}
	 */
	get geoParams() {
		const gp = new GeoParams("")
		setGeoURLParamsURL(gp, this.#url)
		return gp
	}

	/**
	 * Coordinate reference system
	 * 
	 * Converted to lowercase if present in the URL.
	 * Has the default value of "wgs84" if not present.
	 * @type {string}
	 */
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
	 * @param {string|URL|GeoURL} url - geo URI or relative reference
	 * @param {string|URL|GeoURL} base - base geo URI
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/URL/URL|MDN} for URL constructor
	 */
	constructor(url, base) {
		super(url, base)
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
	 * Create a WGS84GeoURL or return null on error
	 * @function parse
	 * @memberof WGS84GeoURL
	 * @param {string|URL|GeoURL} url - geo URI or relative reference
	 * @param {string|URL|GeoURL} base - base geo URI
	 * @returns {WGS84GeoURL|null}
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/URL/parse_static|MDN} for parse() static method
	 */

	/**
	 * Check if url is parsable as a valid WGS84 geo URI
	 * @function canParse
	 * @memberof WGS84GeoURL
	 * @param {string|URL|GeoURL} url - geo URI or relative reference
	 * @param {string|URL|GeoURL} base - base geo URI
	 * @returns {boolean}
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/URL/canParse_static|MDN} for canParse() static method
	 */

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
