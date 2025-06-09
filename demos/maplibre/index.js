import { WGS84GeoURL } from "@antonkhorev/geo-url"
import turfCircle from "@turf/circle"
import "maplibre-gl"

const map = new maplibregl.Map({
	style: "https://tiles.openfreemap.org/styles/liberty",
	center: [30, 60],
	zoom: 13,
	container: "map"
}).addControl(
	new maplibregl.ScaleControl()
)

const emptySourceData = { type: "FeatureCollection", features: [] }

map.on("load", () => {
	map.addSource("circleMarkerSource", {
		type: "geojson",
		data: emptySourceData
	}).addLayer({
		id: "circleMarkerFill",
		source: "circleMarkerSource",
		type: "fill",
		paint: {
			"fill-color": "#8CCFFF",
			"fill-opacity": 0.5
		}
	}).addLayer({
		id: "circleMarkerOutline",
		source: "circleMarkerSource",
		type: "line",
		paint: {
			"line-color": "#0094ff",
			"line-width": 3
		}
	})

	let marker

	const $geoUriInput = document.getElementById("geo-uri-input")

	$geoUriInput.oninput = updateMap
	updateMap()

	function updateMap() {
		map.getSource("circleMarkerSource").setData(emptySourceData)
		marker?.remove()

		const url = WGS84GeoURL.parse($geoUriInput.value)
		if (!url) return

		if (url.u == null) {
			marker = new maplibregl.Marker().setLngLat(url).addTo(map)
			map.panTo(url)
		} else {
			map.getSource("circleMarkerSource").setData(turfCircle(url.lngLat, url.u / 1000))
		}
		if (url.z == null && url.u != null) {
			map.fitBounds(maplibregl.LngLatBounds.fromLngLat(url, url.u * 2), { linear: true })
		} else {
			map.easeTo({ center: url, zoom: url.z })
		}
	}
})
