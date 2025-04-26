// functions/api/ask.js

// --- Configuration Maps (Mirrored from frontend for backend use) ---
// Public Models: Map identifier to provider details and required ENV variable name
const PUBLIC_MODEL_CONFIG = {
    "Grok-3": {
        provider: "XAI",
        base_url: "https://pure-dodo-84.deno.dev/v1",
        model_param: "grok-3",
        apiKeyEnvVar: "XAI_API_KEY" // Cloudflare ENV variable name
    },
    "Doubao-1.5-pro-256k": {
        provider: "火山引擎",
        base_url: "https://ark.cn-beijing.volces.com/api/v3",
        model_param: "doubao-1-5-pro-256k-250115",
        apiKeyEnvVar: "VOLCES_API_KEY" // Cloudflare ENV variable name
    },
    "Deepseek-v3.0": {
        provider: "硅基流动",
        base_url: "https://api.siliconflow.cn/v1",
        model_param: "deepseek-ai/DeepSeek-V3",
        apiKeyEnvVar: "SILICONFLOW_API_KEY" // Cloudflare ENV variable name
    }
};

// Private Models: Map provider name to base URL and available models
const PRIVATE_PROVIDER_CONFIG = {
    "DeepSeek.com": { base_url: "https://api.deepseek.com", models: { "Deepseek-v3.0": "deepseek-chat", "Deepseek-vR1": "deepseek-reasoner" } },
    "火山引擎": { base_url: "https://ark.cn-beijing.volces.com/api/v3", models: { "Doubao-1.5-pro-32k": "doubao-1-5-pro-32k-250115", "Doubao-1.5-pro-256k": "doubao-1-5-pro-256k-250115" } },
    "硅基流动": { base_url: "https://api.siliconflow.cn/v1", models: { "Deepseek-v3.0": "deepseek-ai/DeepSeek-V3", "Deepseek-vR1": "deepseek-ai/DeepSeek-R1" } },
    "阿里百练": { base_url: "https://dashscope.aliyuncs.com/compatible-mode/v1", models: { "Deepseek-v3.0": "deepseek-v3", "Deepseek-vR1": "deepseek-r1" } },
    "NVIDIA": { base_url: "https://integrate.api.nvidia.com/v1", models: { "Deepseek-vR1": "deepseek-ai/deepseek-r1" } },
    "Grok x.com": { base_url: "https://pure-dodo-84.deno.dev/v1", models: { "Grok-3-mini": "grok-3-mini-latest", "Grok-3": "grok-3-latest" } }
};

// Helper function to create error responses
function createErrorResponse(message, status = 400) {
    console.error(`Backend Error (${status}): ${message}`);
    return new Response(JSON.stringify({ error: message }), {
        status: status,
        headers: { 'Content-Type': 'application/json' }
    });
}

export async function onRequestPost({ request, env }) {
    try {
        const requestData = await request.json();
        const { prompt, modelIdentifier, privateDetails } = requestData;

        if (!prompt || !modelIdentifier) {
            return createErrorResponse("Missing 'prompt' or 'modelIdentifier' in request body.");
        }

        let targetBaseUrl = null;
        let targetModelParam = null;
        let apiKey = null;

        if (modelIdentifier === 'private') {
            // --- Private Key Logic ---
            if (!privateDetails || !privateDetails.apiKey || !privateDetails.provider || !privateDetails.model) {
                return createErrorResponse("Missing private key details (apiKey, provider, model) for 'private' modelIdentifier.");
            }

            const providerConfig = PRIVATE_PROVIDER_CONFIG[privateDetails.provider];
            if (!providerConfig || !providerConfig.models || !providerConfig.models[privateDetails.model]) {
                return createErrorResponse(`Invalid private provider ('${privateDetails.provider}') or model ('${privateDetails.model}') specified.`);
            }

            targetBaseUrl = providerConfig.base_url;
            targetModelParam = providerConfig.models[privateDetails.model];
            apiKey = privateDetails.apiKey; // Use the key provided by the user

            console.log(`Using Private Key Mode: Provider=${privateDetails.provider}, Model=${privateDetails.model}`);

        } else {
            // --- Public Key Logic ---
            const publicConfig = PUBLIC_MODEL_CONFIG[modelIdentifier];
            if (!publicConfig) {
                return createErrorResponse(`Invalid public modelIdentifier: '${modelIdentifier}'.`);
            }

            targetBaseUrl = publicConfig.base_url;
            targetModelParam = publicConfig.model_param;

            // Retrieve API key from Cloudflare Environment Variables
            apiKey = env[publicConfig.apiKeyEnvVar];

            if (!apiKey) {
                 // Log error server-side, return generic error to client
                 console.error(`API Key Error: Environment variable '${publicConfig.apiKeyEnvVar}' not set for model '${modelIdentifier}'.`);
                 return createErrorResponse("API Key configuration error on server.", 500);
            }
             console.log(`Using Public Key Mode: Model=${modelIdentifier}`);
        }

        // --- Make the actual API call to the AI provider ---
        const targetUrl = targetBaseUrl + (targetBaseUrl.endsWith('/') ? '' : '/') + 'chat/completions';
        console.log(`Proxying request to: ${targetUrl} with model: ${targetModelParam}`);

        const apiResponse = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'text/event-stream'
            },
            body: JSON.stringify({
                model: targetModelParam,
                messages: [{ role: "user", content: prompt }],
                stream: true // Request streaming response from AI provider
            })
        });

        // --- Handle response from AI provider ---
        if (!apiResponse.ok) {
            // Attempt to read error details from the AI provider
            let errorBody = `AI provider request failed with status ${apiResponse.status}`;
            try {
                const errorJson = await apiResponse.json();
                if (errorJson.error && errorJson.error.message) {
                     errorBody += `. Details: ${errorJson.error.message}`;
                 } else {
                     errorBody += `. Details: ${JSON.stringify(errorJson)}`;
                 }
             } catch (e) {
                 try {
                     errorBody += `. Details: ${await apiResponse.text()}`;
                 } catch (textErr) {
                     // Ignore if reading text fails
                 }
             }
            // Return an error response *through* the proxy
            return createErrorResponse(errorBody, apiResponse.status);
        }

        // --- Stream the response back to the client ---
        // Ensure the response body is a ReadableStream
        if (!apiResponse.body) {
            return createErrorResponse("AI provider did not return a streamable body.", 500);
        }

        // Return the stream directly
        return new Response(apiResponse.body, {
            status: 200,
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            }
        });

    } catch (error) {
        if (error instanceof SyntaxError) { // Catch JSON parsing errors
            return createErrorResponse("Invalid JSON in request body.", 400);
        }
        console.error("Unexpected error in backend proxy:", error);
        return createErrorResponse(`Internal Server Error: ${error.message || 'Unknown error'}`, 500);
    }
}
