export function parseNumber(s) {
	const v = parseFloat(s)
	return isNaN(v) ? undefined : v
}

export function formatNumber(n, digits) {
	if (!isFinite(n)) {
		throw new TypeError(`Unexpected nonfinite number`)
	}
	return n.toFixed(digits).replace(/\.?0+$/, "")
}
