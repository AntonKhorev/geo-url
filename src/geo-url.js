import { GeoParams, setGeoParamsURL } from "./geo-params.js"
import { setURLPathname } from "./url.js"
import { parseNumber, formatNumber } from "./number.js"

const formatZ = n => formatNumber(n, 9)
const formatU = n => formatNumber(n, 9)
const formatCoord = n => formatNumber(n, 12)

/**
 * URL interface for geo URI with an arbitrary CRS
 */
export class GeoURL {
	#url

	/**
	 * Create a GeoURL from a string or another URL object
	 *
	 * Expected to be almost always invoked with one parameter because there's not much use of relative references in case of geo URIs.
	 * At best you can add a hash to a base geo URI using a relative reference, but hashes in geo URIs a probably not widely used.
	 * @param {string|URL|GeoURL} url - geo URI or relative reference
	 * @param {string|URL|GeoURL} [base] - base geo URI
	 * @throws {TypeError} if the protocol is not `geo:`
	 * @throws {TypeError} if contains less than two or more than three coordinates, or if some coordinates aren't numbers
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/URL/URL|MDN} for URL constructor
	 */
	constructor(url, base) {
		this.#url = new URL(url, base)
		if (this.#url.protocol != "geo:") {
			throw new TypeError(`Invalid protocol ${this.#url.protocol}`)
		}
		this._parseCoordinatesString(this.coordinatesString)
	}

	/**
	 * Create a GeoURL or return null on error
	 * @param {string|URL|GeoURL} url - geo URI or relative reference
	 * @param {string|URL|GeoURL} [base] - base geo URI
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
	 * @param {string|URL|GeoURL} [base] - base geo URI
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
	 * Search/query string
	 * @type {string}
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/URL/search|MDN} for search property
	 */
	get search() {
		return this.#url.search
	}
	/**
	 * Set search/query string
	 * @method
	 * @instance
	 * @memberof GeoURL
	 * @name set search
	 * @param {string} value
	 * @see {@link GeoURL#search} for the corresponding getter
	 */
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
	 * Hash property containing the fragment identifier
	 * @type {string}
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/URL/hash|MDN} for hash property
	 */
	get hash() {
		return this.#url.hash
	}
	/**
	 * Set hash property
	 * @method
	 * @instance
	 * @memberof GeoURL
	 * @name set hash
	 * @param {string} value - a string containing the URL fragment, with optional leading `#`
	 * @see {@link GeoURL#hash} for the corresponding getter
	 */
	set hash(value) {
		this.#url.hash = value
	}

	/**
	 * Zoom level
	 *
	 * Equals to undefined for missing `z` search parameter.
	 * Numeric precision is the same as when setting {@link GeoURL#u} because Google documentation doesn't specify it.
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
	 * Set zoom level
	 *
	 * Setting to undefined deletes the `z` search parameter.
	 * @method
	 * @instance
	 * @memberof GeoURL
	 * @name set z
	 * @param {number|undefined} value
	 * @see {@link GeoURL#z} for the corresponding getter
	 */
	set z(value) {
		if (value != null) {
			this.#url.searchParams.set("z", formatZ(value))
		} else {
			this.#url.searchParams.delete("z")
		}
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
	 * @readonly
	 * @type {GeoParams}
	 */
	get geoParams() {
		const gp = new GeoParams("")
		setGeoParamsURL(gp, this.#url)
		return gp
	}

	/**
	 * Coordinate reference system
	 *
	 * Converted to lowercase if present in the URL.
	 *
	 * Has the default value of `wgs84` if not present.
	 * @type {string}
	 */
	get crs() {
		const crsWithPreservedCase = this.geoParams.get("crs") || "wgs84"
		return crsWithPreservedCase.toLowerCase()
	}
	/**
	 * Set coordinate reference system
	 *
	 * The value is converted to lowercase on write.
	 *
	 * The `crs` geo parameter is deleted when setting to `wgs84`, ignoring the case.
	 * @method
	 * @instance
	 * @memberof GeoURL
	 * @name set crs
	 * @param {string} value
	 * @see {@link GeoURL#crs} for the corresponding getter
	 */
	set crs(value) {
		const lcValue = value.toLowerCase()
		if (lcValue != "wgs84") {
			this.geoParams.set("crs", lcValue)
		} else {
			this.geoParams.delete("crs")
		}
	}

	/**
	 * Coordinate reference system
	 *
	 * An alternative name for {@link GeoURL#crs}
	 * @type {string}
	 */
	get CRS() {
		return this.crs
	}
	set CRS(value) {
		this.crs = value
	}

	/**
	 * Coordinates as a string of two or three comma-separated numbers, as they appear in the URL.
	 * @type {string}
	 * @example
	 * const url = new GeoURL("geo:60,30;u=10")
	 * console.log(url.coordinatesString) // outputs "60,30"
	 */
	get coordinatesString() {
		const [coordinatesString] = this.pathname.split(";")
		return coordinatesString
	}
	/**
	 * Set coordinates to a string
	 * @method
	 * @instance
	 * @memberof GeoURL
	 * @name set coordinatesString
	 * @param {string} value - a string of two or three comma-separated numbers, as they appear in the URL
	 * @throws {TypeError} if set to a string that has less than two or more than three comma-separated values, or if some values aren't finite numbers
	 * @example
	 * const url = new GeoURL("geo:60,30;u=10")
	 * url.coordinatesString = "61,31,5"
	 * console.log(url.toString()) // outputs "geo:61,31,5;u=10"
	 * @see {@link GeoURL#coordinatesString} for the corresponding getter
	 */
	set coordinatesString(value) {
		this._parseCoordinatesString(value)
		const [, ...params] = this.pathname.split(";")
		setURLPathname(this.#url, [value, ...params].join(";"))
	}

	/**
	 * Coordinates array
	 * @type {number[]}
	 * @example
	 * const url = new GeoURL("geo:60,30;u=10")
	 * console.log(url.coordinates) // outputs "[ 60, 30 ]"
	 */
	get coordinates() {
		return this.coordinatesString.split(",").map(parseNumber)
	}
	/**
	 * Set coordinates to an array of numbers
	 * @method
	 * @instance
	 * @memberof GeoURL
	 * @name set coordinates
	 * @param {number[]} value - an array with two or three numbers
	 * @throws {TypeError} if set to an array with unexpected number of elements, or if some values aren't finite numbers
	 * @example
	 * const url = new GeoURL("geo:60,30;u=10")
	 * url.coordinates = [61, 31, 5]
	 * console.log(url.toString()) // outputs "geo:61,31,5;u=10"
	 * @see {@link GeoURL#coordinates} for the corresponding getter
	 */
	set coordinates(value) {
		this._validateCoordinates(value)
		const newCoordinatesString = value.map(formatCoord).join(",")
		const [, ...params] = this.pathname.split(";")
		setURLPathname(this.#url, [newCoordinatesString, ...params].join(";"))
	}

	/**
	 * 1st coordinate in an arbitrary CRS
	 * @type {number}
	 * @example
	 * const url = new GeoURL("geo:60,30")
	 * console.log(url.coordA) // outputs "60"
	 */
	get coordA() {
		return this.coordinates[0]
	}
	/**
	 * Set the 1st coordinate
	 * @method
	 * @instance
	 * @memberof GeoURL
	 * @name set coordA
	 * @param {number} value
	 * @throws {TypeError} if the value isn't a finite number
	 * @example
	 * const url = new GeoURL("geo:60,30")
	 * url.coordA = 61
	 * console.log(url.toString()) // outputs "geo:61,30"
	 * @see {@link GeoURL#coordA} for the corresponding getter
	 */
	set coordA(value) {
		const newCoordinates = this.coordinates
		newCoordinates[0] = value
		this.coordinates = newCoordinates
	}

	/**
	 * 2nd coordinate in an arbitrary CRS
	 * @type {number}
	 * @example
	 * const url = new GeoURL("geo:60,30")
	 * console.log(url.coordB) // outputs "30"
	 */
	get coordB() {
		return this.coordinates[1]
	}
	/**
	 * Set the 2st coordinate
	 * @method
	 * @instance
	 * @memberof GeoURL
	 * @name set coordB
	 * @param {number} value
	 * @throws {TypeError} if the value isn't a finite number
	 * @example
	 * const url = new GeoURL("geo:60,30")
	 * url.coordB = 31
	 * console.log(url.toString()) // outputs "geo:60,31"
	 * @see {@link GeoURL#coordB} for the corresponding getter
	 */
	set coordB(value) {
		const newCoordinates = this.coordinates
		newCoordinates[1] = value
		this.coordinates = newCoordinates
	}

	/**
	 * 3rd coordinate in an arbitrary CRS, possibly undefined
	 * @type {number|undefined}
	 * @example
	 * const url = new GeoURL("geo:60,30")
	 * console.log(url.coordC) // outputs "undefined"
	 * @example
	 * const url = new GeoURL("geo:60,30,5")
	 * console.log(url.coordC) // outputs "5"
	 */
	get coordC() {
		return this.coordinates[2]
	}
	/**
	 * Set the 3rd coordinate
	 * @method
	 * @instance
	 * @memberof GeoURL
	 * @name set coordC
	 * @param {number|undefined} value
	 * @throws {TypeError} if the value is neither a finite number nor undefined
	 * @example
	 * const url = new GeoURL("geo:60,30")
	 * url.coordC = 5
	 * console.log(url.toString()) // outputs "geo:60,30,5"
	 * @example
	 * const url = new GeoURL("geo:60,30,5")
	 * url.coordC = undefined
	 * console.log(url.toString()) // outputs "geo:60,30"
	 * @see {@link GeoURL#coordC} for the corresponding getter
	 */
	set coordC(value) {
		const [a, b] = this.coordinates
		const newCoordinates = value != null ? [a, b, value] : [a, b]
		this.coordinates = newCoordinates
	}

	/**
	 * Uncertainty in meters
	 *
	 * Equals to undefined for missing u geo parameter.
	 * Setting to undefined deletes the parameter.
	 * Setting keeps the number up to a nanometer precision.
	 * @type {number|undefined}
	 * @see {@link https://datatracker.ietf.org/doc/html/rfc5870#section-3.4.3|RFC 5870} for parameter description
	 */
	get u() {
		return parseNumber(this.geoParams.get("u"))
	}
	/**
	 * Set uncertainty
	 * @method
	 * @instance
	 * @memberof GeoURL
	 * @name set u
	 * @param {number|undefined} value - new uncertainty value in meters or undefined to remove the uncertainty
	 * @see {@link GeoURL#u} for the corresponding getter
	 */
	set u(value) {
		if (value != null) {
			this.geoParams.set("u", formatU(value))
		} else {
			this.geoParams.delete("u")
		}
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
	set uncertainty(value) {
		this.u = value
	}

	_parseCoordinatesString(value) {
		const coordinates = value.split(",").map(parseNumber)
		this._validateCoordinates(coordinates)
		return coordinates
	}

	_validateCoordinates(coordinates) {
		if (coordinates.length < 2 || coordinates.length > 3) {
			throw new TypeError(`Invalid number of coordinates`)
		}
		if (!coordinates.every(coordinate => typeof coordinate == "number")) {
			throw new TypeError(`Invalid coordinate value`)
		}
	}
}
