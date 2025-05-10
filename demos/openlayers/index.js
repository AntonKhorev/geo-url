import { WGS84GeoURL } from "@antonkhorev/geo-url"
import Map from "ol/Map.js"
import OSM from "ol/source/OSM.js"
import View from "ol/View.js"
import TileLayer from "ol/layer/Tile.js"
import VectorLayer from "ol/layer/Vector.js"
import VectorSource from "ol/source/Vector.js"
import Feature from "ol/Feature.js"
import Point from "ol/geom/Point.js"
import { useGeographic } from "ol/proj"

useGeographic()

const markerSource = new VectorSource()

new Map({
	target: "map",
	layers: [
		new TileLayer({
			source: new OSM(),
		}),
		new VectorLayer({
			source: markerSource
		})
	],
	view: new View({
		center: [30, 60],
		zoom: 13,
	}),
})

const $geoUriInput = document.getElementById("geo-uri-input")

$geoUriInput.oninput = updateMap
updateMap()

function updateMap() {
	markerSource.clear()
	try {
		const url = new WGS84GeoURL($geoUriInput.value)
		markerSource.addFeature(
			new Feature({
				geometry: new Point(url.lonLat),
			})
		)
	} catch {}
}
