import { WGS84GeoURL } from "@antonkhorev/geo-url"
import "maplibre-gl"

const map = new maplibregl.Map({
	style: "https://tiles.openfreemap.org/styles/liberty",
	center: [30, 60],
	zoom: 13,
	container: "map"
})
