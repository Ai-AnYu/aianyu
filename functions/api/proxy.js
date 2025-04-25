// functions/api/proxy.js

// Define mappings from simple model names (sent by client) to provider details and secret names
const AI_PROVIDERS = {
    "Grok-3": {
        baseUrl: "https://api.x.ai/v1",
        modelParam: "grok-3",
        secretName: "CF_XAI_API_KEY", // Matches the secret name in Cloudflare settings
    },
    "Doubao-1.5-pro-256k": {
        baseUrl: "https://ark.cn-beijing.volces.com/api/v3",
        modelParam: "doubao-1-5-pro-256k-250115",
        secretName: "CF_VOLCES_API_KEY",
    },
    "Deepseek-v3.0": {
        baseUrl: "https://api.siliconflow.cn/v1",
        modelParam: "deepseek-ai/DeepSeek-V3",
        secretName: "CF_SILICONFLOW_API_KEY",
    }
    // Add other public models if needed
};

export async function onRequestPost(context) {
    try {
        // 1. Get request data from client
        const clientRequestData = await context.request.json();
        const { prompt, targetModel } = clientRequestData; // Client needs to send 'targetModel'

        if (!prompt || !targetModel) {
            return new Response(JSON.stringify({ error: 'Missing prompt or targetModel' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        // 2. Find provider config and secret
        const providerConfig = AI_PROVIDERS[targetModel];
        if (!providerConfig) {
            return new Response(JSON.stringify({ error: `Unsupported targetModel: ${targetModel}` }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        // 3. Get the actual API key from Cloudflare Secrets (MOST SECURE)
        // Ensure secrets are bound to the function in Pages settings
        const apiKey = context.env[providerConfig.secretName];
        if (!apiKey) {
            console.error(`Secret ${providerConfig.secretName} not found in environment.`);
            return new Response(JSON.stringify({ error: `API key configuration error for ${targetModel}` }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }

        // 4. Prepare the request to the actual AI provider
        const aiApiUrl = `${providerConfig.baseUrl}${(providerConfig.baseUrl.endsWith('/') ? '' : '/') + 'chat/completions'}`;
        const aiRequestBody = {
            model: providerConfig.modelParam,
            messages: [{ role: "user", content: prompt }],
            stream: true, // Ensure streaming is requested
        };

        // 5. Make the streaming request TO the AI provider FROM the Worker
        const aiResponse = await fetch(aiApiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`, // Use the secret key
                'Content-Type': 'application/json',
                'Accept': 'text/event-stream',
            },
            body: JSON.stringify(aiRequestBody),
        });

        // 6. Check if the AI provider request was successful
        if (!aiResponse.ok) {
            const errorBody = await aiResponse.text();
            console.error(`Error from ${targetModel} API (${aiResponse.status}): ${errorBody}`);
            return new Response(JSON.stringify({ error: `AI provider error: ${aiResponse.status} - ${errorBody.substring(0, 200)}` }), { status: aiResponse.status, headers: { 'Content-Type': 'application/json' } });
        }

        // 7. Stream the response back to the client
        // Set appropriate headers for SSE
        const headers = new Headers({
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        });

        // Return the streamed response directly
        return new Response(aiResponse.body, {
            status: 200,
            headers: headers,
        });

    } catch (error) {
        console.error('Proxy error:', error);
        return new Response(JSON.stringify({ error: 'Internal proxy error: ' + error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}

// Optional: Handle non-POST requests if needed
export async function onRequest(context) {
  if (context.request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed. Use POST.' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  }
  // Fallback or could just let onRequestPost handle it implicitly
   return new Response(null, { status: 404 });
}
