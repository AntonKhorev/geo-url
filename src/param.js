export function readParam(param) {
	const [k, v] = param.split("=")
	return [k, decodeURIComponent(v ?? "")]
}

export function writeParam(name, value) {
	if (value == "") return name

	const pUnreservedChars = "[]:&+$"
	let encodedValue = encodeURIComponent(value)
	for (const c of pUnreservedChars) {
		encodedValue = encodedValue.replaceAll(encodeURIComponent(c), c)
	}
	return `${name}=${encodedValue}`
}
