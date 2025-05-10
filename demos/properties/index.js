import { WGS84GeoURL } from "@antonkhorev/geo-url"

const $geoUriInput = document.getElementById("geo-uri-input")
const $propertiesTable = document.getElementById("properties-table")

const outputProperties = ["lat", "lon", "alt", "u", "z"]

const $outputCells = new Map
for (const property of outputProperties) {
	const $row = $propertiesTable.insertRow()
	const $th = document.createElement("th")
	$th.textContent = property
	const $td = document.createElement("td")
	$row.append($th, $td)
	$outputCells.set(property, $td)
}

$geoUriInput.oninput = updateOutputs
updateOutputs()

function updateOutputs() {
	try {
		const url = new WGS84GeoURL($geoUriInput.value)
		for (const [property, $td] of $outputCells) {
			const value = url[property]
			$td.classList.toggle("special", value == null)
			$td.textContent = String(value)
		}
	} catch (ex) {
		for (const [property, $td] of $outputCells) {
			$td.textContent = ""
		}
	}
}
