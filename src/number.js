export function parseNumber(s) {
	const v = parseFloat(s)
	return isNaN(v) ? undefined : v
}

export function formatNumber(n, digits) {
	return n.toFixed(digits).replace(/\.?0+$/, "")
}
