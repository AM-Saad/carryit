const StaticCacheName = "cache-v1";
const DynamicCacheName = "dynamic-cache-v1";
const resourcesToPrecache = [
    "/",
    "/admin/css/classes.css",
    "/admin/css/main.css",
    "/admin/modules/main.js",
];

const limitCacheSize = (name, size) => {
    caches.open(name).then(cache => {
        cache.keys().then(keys => {
            if (keys.length > size) {
                cache.delete(keys[0]).then(limitCacheSize(name, size))
            }
        })
    })
}
self.addEventListener("install", e => {
    console.log("Service Worker has been installed");
    e.waitUntil(
        caches.open(StaticCacheName)
            .then(cache => {
                // console.log(cache);
                return cache.addAll(resourcesToPrecache);
            })
            .then(() => {
                return self.skipWaiting();
            })
    );
});

self.addEventListener("activate", e => {
    e.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys
                    .filter(key => key !== StaticCacheName && key !== DynamicCacheName)
                    .map(key => caches.delete(key))
            );
        })
    );
});



self.addEventListener("fetch", e => {
    e.respondWith(
        caches.match(e.request)
            .then(cachedResponse => {
                // console.log(cachedResponse);
                return (cachedResponse ||
                    fetch(e.request).then(fetchRes => {
                        return caches.open(DynamicCacheName).then(cache => {
                            console.log(cache);
                            cache.put(e.request.url, fetchRes.clone());
                            limitCacheSize(DynamicCacheName, 20);
                            return fetchRes;
                        });
                    }).catch(err => {
                        console.log(err);

                    })
                );
            })
            .catch(err => {
                console.log(err);
                if (e.request.url.indexOf(".html") > -1) {
                    caches.match("/fallback.html");
                }
            })
    );
});

// self.addEventListener('fetch', e => {
//     console.log(e);
//     e.respondWith((async () => {

//         const cachedResponse = caches.match(e.request)
//         if (cachedResponse) return cachedResponse
//         const fetchRes = await fetch(e.request);
//         const cache = await caches.open(DynamicCacheName)
//         console.log(cache);
//         await cache.put(e.request.url, fetchRes.clone());
//         limitCacheSize(DynamicCacheName, 20);
//         return fetchRes;
//     }))
// })
