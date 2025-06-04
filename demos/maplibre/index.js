import { WGS84GeoURL } from "@antonkhorev/geo-url"
import "maplibre-gl"

const map = new maplibregl.Map({
	style: "https://tiles.openfreemap.org/styles/liberty",
	center: [30, 60],
	zoom: 13,
	container: "map"
})

let marker

const $geoUriInput = document.getElementById("geo-uri-input")

$geoUriInput.oninput = updateMap
updateMap()

function updateMap() {
	marker?.remove()
	try {
		const url = new WGS84GeoURL($geoUriInput.value)
		marker = new maplibregl.Marker().setLngLat(url.lngLat).addTo(map)
	} catch {}
}
