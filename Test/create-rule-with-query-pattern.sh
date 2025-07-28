#!/bin/bash

# Check if GGK_URL is set
if [ -z "$GGK_URL" ]; then
    echo "Error: GGK_URL environment variable is not set"
    exit 1
fi

# The API key to use in the Authorization header
API_KEY="92d077c1-31ed-49be-a1ce-dae6c2b07e19"

# The JSON payload for the request with query_pattern in pathRules
JSON_PAYLOAD='{
    "ruleAPI": "api.example.com",
    "userRules": [
        {
            "userID": "test-user-123",
            "pathRules": [
                {
                    "path": "/api/users",
                    "methods": "GET",
                    "effect": "ALLOWED",
                    "query_pattern": "\\?role=admin"
                },
                {
                    "path": "/api/users",
                    "methods": "GET",
                    "effect": "DISALLOWED",
                    "query_pattern": "\\?role=superuser"
                },
                {
                    "path": "/api/data",
                    "methods": "POST",
                    "effect": "ALLOWED",
                    "query_pattern": "\\?type=public"
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