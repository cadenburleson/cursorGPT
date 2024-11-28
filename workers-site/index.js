import { getAssetFromKV } from '@cloudflare/kv-asset-handler';
import { createRequestHandler } from '@remix-run/cloudflare-workers';

addEventListener('fetch', (event) => {
    event.respondWith(handleRequest(event));
});

async function handleRequest(event) {
    try {
        // First try to serve static assets
        return await getAssetFromKV(event);
    } catch {
        // If not static, handle API requests
        return createRequestHandler({
            build: require('../backend/server.js'),
            mode: process.env.NODE_ENV,
            getLoadContext: (event) => ({})
        })(event);
    }
} 