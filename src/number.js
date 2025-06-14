export function parseNumber(s) {
	const v = parseFloat(s)
	return isNaN(v) ? undefined : v
}

export function formatNumber(n, digits) {
	if (isNaN(n)) {
		throw new TypeError(`Unexpected NaN value`)
	}
	return n.toFixed(digits).replace(/\.?0+$/, "")
}
