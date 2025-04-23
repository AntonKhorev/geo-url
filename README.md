# geo-url

A [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL)-like class to parse [geo URIs](https://en.wikipedia.org/wiki/Geo_URI_scheme) as defined in [RFC 5870](https://datatracker.ietf.org/doc/html/rfc5870) with [some unofficial extensions](https://developer.android.com/guide/components/intents-common#Maps).

[See some usage demos](https://antonkhorev.github.io/geo-url/demos/).

## Examples

### Get latitude, longitude and uncertainty

```js
import { WGS84GeoURL } from "@antonkhorev/geo-url"

const urlString = "geo:48.198634,16.371648;u=40"
let url

try {
	url = new WGS84GeoURL(urlString)
} catch (ex) {
	console.log(ex.message)
}

if (url) {
	console.log(`latitude = ${url.latitude}`)
	console.log(`longitude = ${url.longitude}`)
	if (url.uncertainty != null) {
		console.log(`uncertainty = ${url.uncertainty}`)
	} else {
		console.log(`no uncertainty provided`)
	}
}
```

### Get latitude, longitude and altitude

This is a shorter version without error handling and short property names.

```js
import { WGS84GeoURL } from "@antonkhorev/geo-url"

const urlString = "geo:48.2010,16.3695,183"
const url = new WGS84GeoURL(urlString)

console.log(`lat = ${url.lat}`)
console.log(`lon = ${url.lon}`)
if (url.alt != null) {
	console.log(`alt = ${url.alt}`)
} else {
	console.log(`no altitude provided`)
}
```

### Get latitude, longitude and zoom

Read zoom parameter from [an unofficial extension](https://developer.android.com/guide/components/intents-common#Maps).

```js
import { WGS84GeoURL } from "@antonkhorev/geo-url"

const urlString = "geo:47.6,-122.3?z=11"
const url = new WGS84GeoURL(urlString)

console.log(`lat = ${url.lat}`)
console.log(`lon = ${url.lon}`)
if (url.zoom != null) {
	console.log(`zoom = ${url.zoom}`)
} else {
	console.log(`no zoom provided`)
}
```

### Get arbitrary parameters

This doesn't require interpreting the coordinates as lat/lon and can use a more generic `GeoURL` class.

```js
import { GeoURL } from "@antonkhorev/geo-url"

const urlString = "geo:47,11;foo=blue;bar=white"
const url = new GeoURL(urlString)

console.log(`foo = ${url.geoParams.get('foo')}`)
console.log(`bar = ${url.geoParams.get('bar')}`)
```

## Motivation

Why not parse geo uris yourself? You can do it, but you have to be aware of a few gotchas.

Maybe you only need coordinates. Then you can ignore all of the parameters that possibly come after `;`, right? Not quite, technically you [have to check](https://datatracker.ietf.org/doc/html/rfc5870#section-3.4.1) the optional `crs` parameter in case an unknown CRS is used. If it has some unknown value, that is anything other than `wgs84`, you can't interpret the coordinates as an expected lat-lon pair.

Now that you know that you have to look at parameters, you also have to be aware that there are two kinds of parameters: geo uri parameters [as defined in the rfc](https://datatracker.ietf.org/doc/html/rfc5870#section-3.3) and regular url parameters. The latter are not part of the geo uri rfc and can be ignored, but there is a commonly used extension to geo uri that makes use of them. It is [the zoom value](https://developers.google.com/maps/documentation/urls/android-intents#display-a-map) in the `z` url parameter adopted by Google.

If you're going to look at both kinds of parameters, notice that they have to be parsed differently. The difference is not that big, both kinds have sets of allowed characters, with characters outside these sets %-encoded, but the sets are slightly different. One of the reasons for that are different separators. Regular url parameters are separated by `&` while geo uri parameters are separated by `;`. That allows `&` to be used unencoded (see `p-unreserved` in [the uri scheme syntax](https://datatracker.ietf.org/doc/html/rfc5870#section-3.3)). The possibility of unencoded `&` in geo uri parameter values means you have to be careful if you want to parse the entire parameter substring using [`URLSearchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams).

Even after you've parsed the parameters, the challenges are not over because some things in geo uri are case insensitive. First, all of the parameter names are case insensitive, unlike regular url parameter names. This includes the `crs` parameter, its name could be `CRS` or maybe even `cRS` instead. Additionally for the `crs` parameter, its value is also case insensitive, so you have to look for not just `wgs84` but also `WGS84`.

## Alternatives

*[geo-uri](https://www.npmjs.com/package/geo-uri)* appeared shortly after the decision to write *geo-url* was made. That's why *geo-url* is scoped to avoid mixing up these packages. *geo-uri* uses a different approach by providing encode/decode functions operating on structures. *geo-url* tries to provide objects with interfaces similar to [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL).
