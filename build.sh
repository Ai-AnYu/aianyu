#!/bin/bash
echo "Starting build replacements..."

# Check if variables are set (optional but recommended)
if [ -z "$VITE_SUPABASE_URL" ] || \
   [ -z "$VITE_SUPABASE_ANON_KEY" ] || \
   [ -z "$VITE_SILICONFLOW_API_KEY" ] || \
   [ -z "$VITE_VOLCENGINE_API_KEY" ] || \
   [ -z "$VITE_XAI_API_KEY" ]; then
  echo "Error: One or more required VITE environment variables are not set."
  exit 1
fi

# Perform replacements (use different delimiter like # if values contain /)
sed -i.bak "s#__VITE_SUPABASE_URL__#${VITE_SUPABASE_URL}#g" script.js
sed -i.bak "s#__VITE_SUPABASE_ANON_KEY__#${VITE_SUPABASE_ANON_KEY}#g" script.js
sed -i.bak "s#__VITE_SILICONFLOW_API_KEY__#${VITE_SILICONFLOW_API_KEY}#g" script.js
sed -i.bak "s#__VITE_VOLCENGINE_API_KEY__#${VITE_VOLCENGINE_API_KEY}#g" script.js
sed -i.bak "s#__VITE_XAI_API_KEY__#${VITE_XAI_API_KEY}#g" script.js

# Remove backup files created by sed -i
rm script.js.bak

echo "Placeholders replaced successfully."
exit 0
