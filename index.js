"use strict"

export class GeoURL {
	constructor(urlString) {
		this.url = new URL(urlString)
		if (this.url.protocol != "geo:") {
			throw new TypeError(`Invalid protocol ${this.url.protocol}`)
		}
	}

	toJSON() {
		return this.url.toJSON()
	}
	toString() {
		return this.url.toString()
	}

	get href() {
		return this.url.href
	}
	get pathname() {
		return this.url.pathname
	}
	get protocol() {
		return this.url.protocol
	}
	get search() {
		return this.url.search
	}
	get searchParams() {
		return this.url.searchParams
	}

	get coordinatesString() {
		const [coordinatesString] = this.pathname.split(";")
		return coordinatesString
	}
}
