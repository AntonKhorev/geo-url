import { GeoParams, setGeoParamsBeforeSetHook } from "./geo-params.js"
import { GeoURL } from "./geo-url.js"

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
	 * @param {string|URL|GeoURL} [base] - base geo URI
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/URL/URL|MDN} for URL constructor
	 */
	constructor(url, base) {
		super(url, base)
		if (this.crs != "wgs84") {
			throw new TypeError(`Unexpected CRS ${this.crs}`)
		}
	}

	/**
	 * Create a WGS84GeoURL or return null on error
	 * @function parse
	 * @memberof WGS84GeoURL
	 * @param {string|URL|GeoURL} url - geo URI or relative reference
	 * @param {string|URL|GeoURL} [base] - base geo URI
	 * @returns {WGS84GeoURL|null}
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/URL/parse_static|MDN} for parse() static method
	 */

	/**
	 * Check if url is parsable as a valid WGS84 geo URI
	 * @function canParse
	 * @memberof WGS84GeoURL
	 * @param {string|URL|GeoURL} url - geo URI or relative reference
	 * @param {string|URL|GeoURL} [base] - base geo URI
	 * @returns {boolean}
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/URL/canParse_static|MDN} for canParse() static method
	 */

	/**
	 * geo URI parameters object
	 *
	 * The returned object will throw a TypeError if the "crs" parameter is updated to anything other than "wgs84", case-insensitively.
	 * @readonly
	 * @type {GeoParams}
	 */
	get geoParams() {
		const params = super.geoParams
		setGeoParamsBeforeSetHook(params, (name, value) => {
			if (name.toLowerCase() == "crs" && value.toLowerCase() != "wgs84") {
				throw new TypeError(`geoParams setter: ${value} is not a valid value for crs of WGS84GeoURL`)
			}
		})
		return params
	}

	/**
	 * Coordinates as a string of two or three comma-separated numbers, as they appear in the URL.
	 * @type {string}
	 * @example
	 * const url = new WGS84GeoURL("geo:60,30;u=10")
	 * console.log(url.coordinatesString) // outputs "60,30"
	 */
	/**
	 * Set coordinates to a string
	 * @method
	 * @instance
	 * @memberof WGS84GeoURL
	 * @name set coordinatesString
	 * @param {string} value - a string of two or three comma-separated numbers, as they appear in the URL
	 * @throws {TypeError} if coordinates are out of allowed range or if GeoURL's setter throws
	 * @example
	 * const url = new WGS84GeoURL("geo:60,30;u=10")
	 * url.coordinatesString = "61,31,5"
	 * console.log(url.toString()) // outputs "geo:61,31,5;u=10"
	 * url.coordinatesString = "0,181" // throws TypeError
	 * @see {@link WGS84GeoURL#coordinatesString} for the corresponding getter
	 */

	/**
	 * Coordinates array
	 * @type {number[]}
	 * @example
	 * const url = new WGS84GeoURL("geo:60,30;u=10")
	 * console.log(url.coordinates) // outputs "[ 60, 30 ]"
	 */
	/**
	 * Set coordinates to an array of numbers
	 * @method
	 * @instance
	 * @memberof WGS84GeoURL
	 * @name set coordinates
	 * @param {number[]} value - an array with two or three numbers
	 * @throws {TypeError} if coordinates are out of allowed range or if GeoURL's setter throws
	 * @example
	 * const url = new WGS84GeoURL("geo:60,30;u=10")
	 * url.coordinates = [61, 31, 5]
	 * console.log(url.toString()) // outputs "geo:61,31,5;u=10"
	 * @see {@link WGS84GeoURL#coordinates} for the corresponding getter
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
	 * const url = new WGS84GeoURL("geo:13.4125,103.8667")
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
	 * @example
	 * const url = new WGS84GeoURL("geo:13.4125,103.8667")
	 * console.log(url.lat) // outputs "13.4125"
	 */
	get lat() {
		return this.coordA
	}
	/**
	 * Set the latitude
	 * @method
	 * @instance
	 * @memberof WGS84GeoURL
	 * @name set lat
	 * @param {number} value - latitude in decimal degrees between -90 and 90
	 * @throws {TypeError} if the value is out of range
	 * @example
	 * const url = new WGS84GeoURL("geo:13.4125,103.8667")
	 * url.lat = 16.4321
	 * console.log(url.toString()) // outputs "geo:16.4321,103.8667"
	 * @see {@link WGS84GeoURL#lat} for the corresponding getter
	 */
	set lat(value) {
		this.coordA = value
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
	set latitude(value) {
		this.coordA = value
	}

	/**
	 * Longitude in decimal degrees between -180 and 180
	 * @type {number}
	 * @see {@link https://datatracker.ietf.org/doc/html/rfc5870#section-3.4.2|RFC 5870} for component description
	 * @example
	 * const url = new WGS84GeoURL("geo:13.4125,103.8667")
	 * console.log(url.lon) // outputs "103.8667"
	 */
	get lon() {
		return this.coordB
	}
	/**
	 * Set the longitude
	 * @method
	 * @instance
	 * @memberof WGS84GeoURL
	 * @name set lon
	 * @param {number} value - longitude in decimal degrees between -180 and 180
	 * @throws {TypeError} if the value is out of range
	 * @example
	 * const url = new WGS84GeoURL("geo:13.4125,103.8667")
	 * url.lon = 101.1001
	 * console.log(url.toString()) // outputs "geo:13.4125,101.1001"
	 * @see {@link WGS84GeoURL#lon} for the corresponding getter
	 */
	set lon(value) {
		this.coordB = value
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
	set lng(value) {
		this.coordB = value
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
	set longitude(value) {
		this.coordB = value
	}

	/**
	 * Altitude in meters
	 * @type {number|undefined}
	 * @see {@link https://datatracker.ietf.org/doc/html/rfc5870#section-3.4.2|RFC 5870} for component description
	 * @example
	 * const url = new WGS84GeoURL("geo:13.4125,103.8667")
	 * console.log(url.alt) // outputs "undefined"
	 * @example
	 * const url = new WGS84GeoURL("geo:48.201,16.3695,183")
	 * console.log(url.alt) // outputs "183"
	 */
	get alt() {
		return this.coordC
	}
	/**
	 * Set the altitude
	 * @method
	 * @instance
	 * @memberof WGS84GeoURL
	 * @name set alt
	 * @param {number|undefined} value - altitude in meters or undefined
	 * @throws {TypeError} if the value is neither a finite number nor undefined
	 * @example
	 * const url = new WGS84GeoURL("geo:13.4125,103.8667")
	 * url.alt = 65
	 * console.log(url.toString()) // outputs "geo:13.4125,103.8667,65"
	 * @example
	 * const url = new WGS84GeoURL("geo:48.201,16.3695,183")
	 * url.alt = undefined
	 * console.log(url.toString()) // outputs "geo:48.201,16.3695"
	 * @see {@link WGS84GeoURL#alt} for the corresponding getter
	 */
	set alt(value) {
		this.coordC = value
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
	set altitude(value) {
		this.coordC = value
	}

	_validateCoordinates(coordinates) {
		super._validateCoordinates(coordinates)
		const [lat, lon] = coordinates
		if (lat < -90 || lat > 90) {
			throw new TypeError(`Latitude ${lat} outside of the allowed range`)
		}
		if (lon < -180 || lon > 180) {
			throw new TypeError(`Longitude ${lon} outside of the allowed range`)
		}
	}
}
