// replace_keys.js
const fs = require('fs');
const filePath = 'script.js'; // Path relative to project root

console.log(`Replacing API key placeholders in ${filePath}...`);

// Check if environment variables are set
if (!process.env.CF_SILICONFLOW_API_KEY || !process.env.CF_VOLCES_API_KEY || !process.env.CF_XAI_API_KEY) {
    console.error("Error: One or more API key environment variables are not set.");
    process.exit(1); // Exit with error code
}

try {
    let content = fs.readFileSync(filePath, 'utf8');

    content = content.replace(/__CF_SILICONFLOW_API_KEY__/g, process.env.CF_SILICONFLOW_API_KEY);
    content = content.replace(/__CF_VOLCES_API_KEY__/g, process.env.CF_VOLCES_API_KEY);
    content = content.replace(/__CF_XAI_API_KEY__/g, process.env.CF_XAI_API_KEY);

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('API key placeholders replaced successfully.');
} catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    process.exit(1); // Exit with error code
}
