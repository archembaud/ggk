#!/bin/bash

# Check if GGK_URL is set
if [ -z "$GGK_URL" ]; then
    echo "Error: GGK_URL environment variable is not set"
    exit 1
fi

# Check if ruleId is provided as argument
if [ -z "$1" ]; then
    echo "Error: Please provide a ruleId as an argument"
    echo "Usage: $0 <ruleId>"
    exit 1
fi

RULE_ID="$1"

# The API key to use in the Authorization header
API_KEY="92d077c1-31ed-49be-a1ce-dae6c2b07e19"

# The JSON payload for updating path_pattern in allowedEndpoints
JSON_PAYLOAD='{
    "userRules": [
        {
            "userID": "test-user-123",
            "allowedEndpoints": [
                {
                    "methods": "GET,POST",
                    "path_pattern": "/api/v2/users/*",
                    "effect": "ALLOWED"
                }
            ]
        }
    ]
}'

# Make the PUT request
curl -X PUT \
    -H "Authorization: $API_KEY" \
    -H "Content-Type: application/json" \
    -d "$JSON_PAYLOAD" \
    "$GGK_URL/rules/$RULE_ID"

echo # Add a newline after the response 