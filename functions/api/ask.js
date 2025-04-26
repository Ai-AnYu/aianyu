// api/ask.js

// --- Configuration Maps (Mirrored from frontend for backend use) ---
const PUBLIC_MODEL_CONFIG = {
    "Grok-3": {
        provider: "XAI",
        base_url: "https://api.x.ai/v1",
        model_param: "grok-3",
        apiKeyEnvVar: "XAI_API_KEY" // Vercel ENV variable name
    },
    "Doubao-1.5-pro-256k": {
        provider: "火山引擎",
        base_url: "https://ark.cn-beijing.volces.com/api/v3",
        model_param: "doubao-1-5-pro-256k-250115",
        apiKeyEnvVar: "VOLCES_API_KEY" // Vercel ENV variable name
    },
    "Deepseek-v3.0": {
        provider: "硅基流动",
        base_url: "https://api.siliconflow.cn/v1",
        model_param: "deepseek-ai/DeepSeek-V3",
        apiKeyEnvVar: "SILICONFLOW_API_KEY" // Vercel ENV variable name
    }
};

const PRIVATE_PROVIDER_CONFIG = {
    "DeepSeek.com": { base_url: "https://api.deepseek.com", models: { "Deepseek-v3.0": "deepseek-chat", "Deepseek-vR1": "deepseek-reasoner" } },
    "火山引擎": { base_url: "https://ark.cn-beijing.volces.com/api/v3", models: { "Doubao-1.5-pro-32k": "doubao-1-5-pro-32k-250115", "Doubao-1.5-pro-256k": "doubao-1-5-pro-256k-250115" } },
    "硅基流动": { base_url: "https://api.siliconflow.cn/v1", models: { "Deepseek-v3.0": "deepseek-ai/DeepSeek-V3", "Deepseek-vR1": "deepseek-ai/DeepSeek-R1" } },
    "阿里百练": { base_url: "https://dashscope.aliyuncs.com/compatible-mode/v1", models: { "Deepseek-v3.0": "deepseek-v3", "Deepseek-vR1": "deepseek-r1" } },
    "NVIDIA": { base_url: "https://integrate.api.nvidia.com/v1", models: { "Deepseek-vR1": "deepseek-ai/deepseek-r1" } },
    "Grok x.com": { base_url: "https://api.x.ai/v1", models: { "Grok-3-mini": "grok-3-mini-latest", "Grok-3": "grok-3-latest" } }
};

// Helper function to create error responses for Vercel functions
function sendErrorResponse(res, message, status = 400) {
    console.error(`Backend Error (${status}): ${message}`);
    res.status(status).json({ error: message });
}

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return sendErrorResponse(res, `Method ${req.method} Not Allowed`, 405);
    }

    try {
        // Vercel automatically parses JSON body for Node.js runtime
        const requestData = req.body;
        const { prompt, modelIdentifier, privateDetails } = requestData;

        if (!prompt || !modelIdentifier) {
            return sendErrorResponse(res, "Missing 'prompt' or 'modelIdentifier' in request body.");
        }

        let targetBaseUrl = null;
        let targetModelParam = null;
        let apiKey = null;

        if (modelIdentifier === 'private') {
            // --- Private Key Logic ---
            if (!privateDetails || !privateDetails.apiKey || !privateDetails.provider || !privateDetails.model) {
                return sendErrorResponse(res, "Missing private key details (apiKey, provider, model) for 'private' modelIdentifier.");
            }

            const providerConfig = PRIVATE_PROVIDER_CONFIG[privateDetails.provider];
            if (!providerConfig || !providerConfig.models || !providerConfig.models[privateDetails.model]) {
                return sendErrorResponse(res, `Invalid private provider ('${privateDetails.provider}') or model ('${privateDetails.model}') specified.`);
            }

            targetBaseUrl = providerConfig.base_url;
            targetModelParam = providerConfig.models[privateDetails.model];
            apiKey = privateDetails.apiKey; // Use the key provided by the user
            console.log(`Using Private Key Mode: Provider=${privateDetails.provider}, Model=${privateDetails.model}`);

        } else {
            // --- Public Key Logic ---
            const publicConfig = PUBLIC_MODEL_CONFIG[modelIdentifier];
            if (!publicConfig) {
                return sendErrorResponse(res, `Invalid public modelIdentifier: '${modelIdentifier}'.`);
            }

            targetBaseUrl = publicConfig.base_url;
            targetModelParam = publicConfig.model_param;

            // Retrieve API key from Vercel Environment Variables
            // Use process.env here
            apiKey = process.env[publicConfig.apiKeyEnvVar];

            if (!apiKey) {
                console.error(`API Key Error: Environment variable '${publicConfig.apiKeyEnvVar}' not set for model '${modelIdentifier}'.`);
                return sendErrorResponse(res, "API Key configuration error on server.", 500);
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
                'Accept': 'text/event-stream' // Still request SSE from provider
            },
            body: JSON.stringify({
                model: targetModelParam,
                messages: [{ role: "user", content: prompt }],
                stream: true
            })
        });

        // --- Handle response from AI provider ---
        if (!apiResponse.ok) {
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
                 } catch (textErr) { /* ignore */ }
             }
            // Send error back to the client via the Vercel response
            return sendErrorResponse(res, errorBody, apiResponse.status);
        }

        // --- Stream the response back to the client ---
        if (!apiResponse.body) {
            return sendErrorResponse(res, "AI provider did not return a streamable body.", 500);
        }

        // Set headers for Server-Sent Events (SSE)
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        // Vercel requires flushing headers before piping
        res.flushHeaders();

        // Pipe the stream from the AI provider response to the Vercel response
        // apiResponse.body is a ReadableStream (Node.js)
        const reader = apiResponse.body.getReader();
        const stream = new ReadableStream({
            async start(controller) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        break;
                    }
                    controller.enqueue(value);
                }
                controller.close();
                reader.releaseLock();
            }
        });

        // Pipe the ReadableStream to the Vercel response object
        await stream.pipeTo(new WritableStream({
          write(chunk) {
            res.write(chunk); // Write chunk to the Vercel response
          },
          close() {
            res.end(); // End the Vercel response when the stream is finished
          },
          abort(err) {
            console.error("Stream aborted:", err);
            res.status(500).send("Stream aborted");
          }
        }));


    } catch (error) {
        console.error("Unexpected error in Vercel function:", error);
        // Avoid sending detailed internal errors to the client in production
        sendErrorResponse(res, `Internal Server Error`, 500);
    }
}

// Helper needed for pipeTo in some Node versions/environments
const { ReadableStream, WritableStream } = require('node:stream/web');
const fetch = require('node-fetch'); // Make sure to install node-fetch: npm i node-fetch

// Note: If your Vercel project uses a newer Node.js version where fetch is global,
// you might not need the 'node-fetch' import/install. Test deployment.
