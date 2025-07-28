#!/bin/bash

# Check if GGK_URL is set
if [ -z "$GGK_URL" ]; then
    echo "Error: GGK_URL environment variable is not set"
    exit 1
fi

# The API key to use in the Authorization header
API_KEY="92d077c1-31ed-49be-a1ce-dae6c2b07e19"

# The JSON payload for the request
JSON_PAYLOAD='{
    "ruleAPI": "api.example.com",
    "userRules": [
        {
            "userID": "test-user-123",
            "allowedEndpoints": [
                {
                    "path": "/test/path",
                    "methods": "GET,POST",
                    "effect": "ALLOWED"
                },
                {
                    "path": "/test/path",
                    "methods": "DELETE",
                    "effect": "DISALLOWED"
                },
                {
                    "path": "/test/anotherpath",
                    "methods": "DELETE",
                    "effect": "DISALLOWED"
                }
            ]
        }
    ]
}'

# Make the POST request
curl -X POST \
    -H "Authorization: $API_KEY" \
    -H "Content-Type: application/json" \
    -d "$JSON_PAYLOAD" \
    "$GGK_URL/rules"

echo # Add a newline after the response 