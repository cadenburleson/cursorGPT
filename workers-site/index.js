import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

export default {
    async fetch(request, env, ctx) {
        try {
            // First try to serve static assets
            return await getAssetFromKV({
                request,
                waitUntil: ctx.waitUntil.bind(ctx),
                env,
            });
        } catch (error) {
            // If not a static asset, handle API request
            const url = new URL(request.url);
            if (url.pathname.startsWith('/api/')) {
                // Handle API requests here
                return handleApiRequest(request, env);
            }

            // Return 404 for anything else
            return new Response('Not Found', { status: 404 });
        }
    }
};

async function handleApiRequest(request, env) {
    // Handle your API logic here
    if (request.url.includes('/api/chat')) {
        const body = await request.json();
        // Your existing chat logic here
        // Make sure to use env.OPENAI_API_KEY instead of process.env
        return new Response(JSON.stringify({ message: 'API response' }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }
    return new Response('Not Found', { status: 404 });
} 