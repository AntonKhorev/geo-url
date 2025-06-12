import { readParam, writeParam } from "./param.js"

export let setGeoParamsURL
export let setGeoParamsBeforeSetHook

/**
 * Geo URI Parameters as defined in RFC 5870
 *
 * Intended to be similar to {@link https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams|URLSearchParams},
 * with an {@link https://url.spec.whatwg.org/#concept-urlsearchparams-url-object|associated URL object}.
 *
 * The following methods of `URLSearchParams` are not implemented in `GeoParams` because they only make sense for repeated parameters:
 * - `append`
 * - `getAll`
 *
 * `crs` and `u` parameters can't be repeated according to the {@link https://datatracker.ietf.org/doc/html/rfc5870#section-3.3|URI Scheme Syntax}.
 * It's not so clear about other parameters
 * because RFC 5870 talks about sets of parameters and parameter names in the {@link https://datatracker.ietf.org/doc/html/rfc5870#section-3.4.4|URI Comparison section}.
 * `GeoParams` assumes that parameters can't be repeated.
 * Practically it doesn't matter much because the only commonly used parameter should be `u`.
 */
export class GeoParams {
	#p
	#url
	#beforeSetHook

	// see https://github.com/nodejs/node/blob/0c6e16bc849450a450a9d2dbfbf6244c04f90642/lib/internal/url.js#L319 for a similar approach
	static {
		setGeoParamsURL = (obj, url) => {
			obj.#url = url
		}
		setGeoParamsBeforeSetHook = (obj, beforeSetHook) => {
			obj.#beforeSetHook = beforeSetHook
		}
	}

	/**
	 * Create a new GeoParams object
	 *
	 * `options` is one of:
	 * - undefined to construct empty geo parameters
	 * - string to construct geo parameters according to geo URI parameters syntax,
	 *   which is a `p` rule in {@link https://datatracker.ietf.org/doc/html/rfc5870#section-3.3|URI Scheme Syntax}
	 *   except without the leading `;` separator
	 * - array of name-value string pairs
	 * - record of string keys and string values
	 * @param {string|string[][]|Object.<string, string>} [options]
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/URLSearchParams|MDN} for the similar URLSearchParams constructor
	 */
	constructor(options) {
		if (options == null) {
			this.#p = ""
		} else if (typeof options == "string") {
			this.#p = options
		} else {
			const iterable = options?.[Symbol.iterator] ? options : Object.entries(options)
			const kvs = []
			for (const kv of iterable) {
				if (kv.length != 2) {
					throw new TypeError(`GeoParams constructor: Expected 2 items in pair but got ${kv.length}`)
				}
				this.#setKvs(kvs, ...kv)
			}
			this.#writeCoordsAndKvs(null, kvs)
		}
	}

	/**
	 * Total number of parameter entries
	 * @type {number}
	 * @readonly
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/size|MDN} for the similar property of URLSearchParams
	 */
	get size() {
		const [, kvs] = this.#readCoordsAndKvs()

		return kvs.length
	}

	/**
	 * Get the value associated to the given parameter
	 * @param {string} name
	 * @returns {string|null} - parameter value or null for a missing parameter
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/get|MDN} for the similar method of URLSearchParams
	 */
	get(name) {
		const [, kvs] = this.#readCoordsAndKvs()

		for (const [k, v] of kvs) {
			if (k.toLowerCase() == name.toLowerCase()) {
				return v
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
		if (this.#beforeSetHook) {
			this.#beforeSetHook(name, value)
		}

		const [coords, kvs] = this.#readCoordsAndKvs()

		this.#setKvs(kvs, name, value)

		this.#writeCoordsAndKvs(coords, kvs)
	}

	/**
	 * Delete the specified parameter
	 *
	 * Delete a parameter with the given name.
	 * If `value` is specified, delete only if the parameter has this value.
	 * @param {string} name
	 * @param {string} [value] - optional value to check
	 * @returns {void}
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/delete|MDN} for the similar method of URLSearchParams
	 */
	delete(name, value) {
		const [coords, kvs] = this.#readCoordsAndKvs()
		const lcName = name.toLowerCase()

		for (const [i, [k, v]] of kvs.entries()) {
			const lcK = k.toLowerCase()
			if (lcK != lcName) continue
			if (value != null) {
				if (v != value) continue
			}

			kvs.splice(i, 1)
			break
		}

		this.#writeCoordsAndKvs(coords, kvs)
	}

	/**
	 * Indicate whether the specified parameter is present
	 *
	 * Check if a parameter with the given name is present.
	 * If `value` is specified, also check if the parameter has this value.
	 * @param {string} name
	 * @param {string} [value] - optional value to check
	 * @returns {boolean}
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/has|MDN} for the similar method of URLSearchParams
	 */
	has(name, value) {
		const [, kvs] = this.#readCoordsAndKvs()
		for (const [k, v] of kvs) {
			if (k.toLowerCase() == name.toLowerCase()) {
				if (value != null) {
					return (v ?? "") == value
				} else {
					return true
				}
			}
		}

		return false
	}

	/**
	 * Get an iterable for all name-value pairs of parameters
	 * @returns {Iterator.<string[]>}
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams#urlsearchparamssymbol.iterator|MDN} for the similar method of URLSearchParams
	 */
	[Symbol.iterator]() {
		return this.entries()
	}

	/**
	 * Get an iterable for all name-value pairs of parameters
	 *
	 * Same as iterating through a geo params object directly.
	 * @returns {Iterable.<string[]>}
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/entries|MDN} for the similar method of URLSearchParams
	 */
	*entries() {
		const [, kvs] = this.#readCoordsAndKvs()
		for (const kv of kvs) {
			yield kv
		}
	}

	/**
	 * Get an iterable for all names of parameters
	 * @returns {Iterable.<string>}
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/keys|MDN} for the similar method of URLSearchParams
	 */
	*keys() {
		const [, kvs] = this.#readCoordsAndKvs()
		for (const [k] of kvs) {
			yield k
		}
	}

	/**
	 * Get an iterable for all values of parameters
	 * @returns {Iterable.<string>}
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/values|MDN} for the similar method of URLSearchParams
	 */
	*values() {
		const [, kvs] = this.#readCoordsAndKvs()
		for (const [, v] of kvs) {
			yield v
		}
	}

	/**
	 * Convert the parameters to a string
	 *
	 * The string is a semicolon-separated list of geo parameters.
	 * This is the part of RFC 5870 geo URI that comes after the coordinates.
	 * The `;` that separates the coordinates and the parameters is not included in the string.
	 *
	 * Each geo parameter is represented by:
	 * - `name=value`
	 * - `name` without both `value` and `=` if the value is an empty string
	 *   (a "flag" type parameter discussed in the parameter registry section of {@link https://datatracker.ietf.org/doc/html/rfc5870#section-4|RFC 5870})
	 * @returns {string}
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/toString|MDN} for the similar method of URLSearchParams
	 */
	toString() {
		if (this.#url) {
			[, paramsString] = this.#url.pathname.split(/;(.*)/)
			return paramsString
		} else {
			return this.#p
		}
	}

	forEach(callback) {
	}

	#readCoordsAndKvs() {
		if (this.#url) {
			const [coords, ...params] = this.#url.pathname.split(";")
			return [coords, params.map(readParam)]
		} else if (this.#p == "") {
			return [null, []]
		} else {
			const params = this.#p.split(";")
			return [null, params.map(readParam)]
		}
	}

	#setKvs(kvs, name, value) {
		const lcName = name.toLowerCase()
		let hasCrs = false

		for (const [i, [k]] of kvs.entries()) {
			const lcK = k.toLowerCase()
			if (i == 0) {
				hasCrs = lcK == "crs"
			}
			if (lcK == lcName) {
				kvs[i] = [name, value]
				return
			}
		}

		if (lcName == "u" && hasCrs) {
			kvs.splice(1, 0, [name, value])
		} else if (lcName == "crs" || lcName == "u") {
			kvs.unshift([name, value])
		} else {
			kvs.push([name, value])
		}
	}

	#writeCoordsAndKvs(coords, kvs) {
		const params = kvs.map(([k, v]) => writeParam(k, v))
		if (this.#url) {
			this.#url.href = `${this.#url.protocol}${[coords, ...params].join(";")}${this.#url.search}${this.#url.hash}`
		} else {
			this.#p = params.join(";")
		}
	}
}
