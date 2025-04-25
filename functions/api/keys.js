// --- START OF FILE functions/api/keys.js ---

/**
 * Cloudflare Function to securely provide default API keys to the frontend.
 * Reads keys from environment variables set in the Cloudflare Pages dashboard.
 */
export async function onRequestGet({ env }) {
    // env contains the environment variables

    // Keys expected to be set in Cloudflare Pages environment variables:
    // AIAY_XAI_KEY
    // AIAY_VOLCES_KEY
    // AIAY_SILICONFLOW_KEY

    const keys = {
        // Map provider names used in the frontend config to the env variable values
        "XAI": env.AIAY_XAI_KEY,
        "火山引擎": env.AIAY_VOLCES_KEY,
        "硅基流动": env.AIAY_SILICONFLOW_KEY
    };

    // Basic check if keys were found (optional, but good practice)
    if (!keys.XAI || !keys['火山引擎'] || !keys['硅基流动']) {
        console.error("One or more default API keys are missing from environment variables.");
        // Return an error or an empty object depending on how you want the frontend to handle it
        // Returning a 500 error might be appropriate
        return new Response(JSON.stringify({ error: "Server configuration error: Missing API keys." }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    return new Response(JSON.stringify(keys), {
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=3600' // Cache for 1 hour? Adjust as needed.
        },
    });
}

// --- END OF FILE functions/api/keys.js ---
