import { WGS84GeoURL } from "@antonkhorev/geo-url"
import Map from "ol/Map.js"
import OSM from "ol/source/OSM.js"
import View from "ol/View.js"
import ScaleLine from "ol/control/ScaleLine.js"
import { defaults as defaultControls } from "ol/control/defaults.js"
import TileLayer from "ol/layer/Tile.js"
import VectorLayer from "ol/layer/Vector.js"
import VectorSource from "ol/source/Vector.js"
import Feature from "ol/Feature.js"
import Point from "ol/geom/Point.js"
import Circle from "ol/geom/Circle.js"
import { fromLonLat, setUserProjection, getPointResolution } from "ol/proj"

setUserProjection("EPSG:3857")

const markerSource = new VectorSource()
const view = new View({
	center: fromLonLat([30, 60], "EPSG:3857"),
	zoom: 13,
	maxZoom: 19,
	multiWorld: true,
	constrainResolution: true
})

new Map({
	target: "map",
	controls: defaultControls().extend([
		new ScaleLine({
			units: "metric",
			bar: true,
			steps: 4,
			text: true
		})
	]),
	layers: [
		new TileLayer({
			source: new OSM(),
		}),
		new VectorLayer({
			source: markerSource
		})
	],
	view
})

const $geoUriInput = document.getElementById("geo-uri-input")

$geoUriInput.oninput = debounce(updateMap)
updateMap()

function updateMap() {
	markerSource.clear()

	const url = WGS84GeoURL.parse($geoUriInput.value)
	if (!url) return

	const center = fromLonLat(url.lonLat, "EPSG:3857")
	if (url.u == null) {
		markerSource.addFeature(
			new Feature({
				geometry: new Point(center)
			})
		)
	} else {
		const radius = url.u / getPointResolution("EPSG:3857", 1, center, "m")
		markerSource.addFeature(
			new Feature({
				geometry: new Circle(center, radius)
			})
		)
	}
	if (url.z == null && url.u != null) {
		const radius = 2 * url.u / getPointResolution("EPSG:3857", 1, center, "m")
		const geometry = new Circle(center, radius)
		view.fit(geometry)
	} else {
		view.setCenter(center)
		if (url.z != null) view.setZoom(url.z)
	}
}

function debounce(fn, ms = 300) {
	let timeout
	return () => {
		clearTimeout(timeout)
		timeout = setTimeout(fn, ms)
	}
}
