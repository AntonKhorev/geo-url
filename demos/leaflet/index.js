import { WGS84GeoURL } from "@antonkhorev/geo-url"
import "leaflet"

const map = L.map("map", { attributionControl: false }).setView([60, 30], 13)
L.control.attribution({ prefix: false }).addTo(map)
L.control.scale().addTo(map)
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
	maxZoom: 19,
	attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a>"
}).addTo(map)

const markerLayer = L.layerGroup().addTo(map)

const $geoUriInput = document.getElementById("geo-uri-input")

$geoUriInput.oninput = updateMap
updateMap()

function updateMap() {
	markerLayer.clearLayers()

	const url = WGS84GeoURL.parse($geoUriInput.value)
	if (!url) return

	if (url.u == null) {
		L.marker(url.latLng).addTo(markerLayer)
	} else {
		L.circle(url.latLng, { radius: url.u }).addTo(markerLayer)
	}
	if (url.z == null && url.u != null) {
		const bounds = L.latLng(url.latLng).toBounds(url.u * 4)
		map.fitBounds(bounds)
	} else {
		map.setView(url.latLng, url.z)
	}
}
