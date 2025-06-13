/**
 * Update URL pathname, even if it's opaque
 *
 * The `pathname` property of `URL` is not readonly.
 * However for opaque paths any writes to this property are {@link https://url.spec.whatwg.org/#dom-url-pathname|silently ignored}.
 * Geo URI scheme paths are considered to be opaque.
 * Therefore we need to write our own `pathname` update function.
 * @param {URL} url - url to update
 * @param {string} value - new pathname value
 * @returns {void}
 */
export function setURLPathname(url, value) {
	url.href = `${url.protocol}${value}${url.search}${url.hash}`
}
