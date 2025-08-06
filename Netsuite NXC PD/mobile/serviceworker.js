/*
 * Service Worker
 */

// Server generated configuration
// prettier-ignore
let { id, name, version, scope, index, imports } =
	new Function('return ${ options }')() || {};
const prefix = id + "/";
const uid = prefix + version;
const assets = ["mobile.css", "mobile.js", ...imports].map((name) => index + name);

// Parse urls
scope = new URL(scope);
index = new URL(index);

// Extract parameters from server url
let scopeParams = {};
for (var key of scope.searchParams.keys()) {
	scopeParams[key] = scope.searchParams.get(key);
}

// Create a cache for the files of each version
self.addEventListener("install", function (event) {
	console.log("ServiceWorker installing " + name + " version: " + version);
	self.skipWaiting();
	event.waitUntil(
		caches.open(uid).then(function (cache) {
			const requests = [index, ...assets];

			// Cache requests for future fetches
			console.log("ServiceWorker creating " + name + " cache: " + uid, requests);
			return cache.addAll(requests).catch(function (error) {
				console.error("ServiceWorker " + name + " cache error: ", error);
			});
		})
	);
});

// Remove caches for legacy versions
self.addEventListener("activate", function (event) {
	console.log("ServiceWorker activated " + name + " version: " + version);
	event.waitUntil(
		caches.keys().then(function (keys) {
			return Promise.all(
				keys.map(function (key) {
					// Delete caches with a different version
					if (key.startsWith(prefix) && key !== uid) {
						console.log("ServiceWorker deleting " + name + " cache: " + key);
						return caches.delete(key);
					}
				})
			);
		})
	);
});

// Respond with files from cache or fallback to network
self.addEventListener("fetch", function (event) {
	let request = event.request;
	let url = new URL(request.url);

	// Match scope on request origin and search parameters
	const mismatches = Object.keys(scopeParams).filter(
		(key) => url.searchParams.get(key) != scopeParams[key]
	);
	if (url.origin == scope.origin && !mismatches.length) {
		// Redirect to index url for all requests with no url or index requests with extra parameters
		if (
			!url.searchParams.get("url") ||
			url.searchParams.get("url").replace("/", "") == index.searchParams.get("url").replace("/", "")
		) {
			request = index;
		}
	}

	event.respondWith(
		caches.match(request, { ignoreVary: true }).then(function (response) {
			// Apply response found in cache
			if (response) {
				console.log("ServiceWorker fetching from " + name + " cache: " + event.request.url);
				return response;
			}

			// Fall back to network request
			return fetch(event.request);
		})
	);
});
