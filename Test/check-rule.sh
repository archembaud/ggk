#!/bin/bash

# Check if GGK_URL is set
if [ -z "$GGK_URL" ]; then
    echo "Error: GGK_URL environment variable is not set"
    exit 1
fi

# Needs a rule ID
# We also need a rule (GGK_RULE_ID)
if [ -z "$GGK_RULE_ID" ]; then
    echo "Error: GGK_RULE_ID environment variable is not set"
    exit 1
fi

echo "Checking good request first"

# The JSON payload for the request
JSON_PAYLOAD='{
    "userID": "test-user-123",
    "path": "/test/path",
    "method": "GET"
}'

# Make the POST request
curl -X POST \
    -H "Content-Type: application/json" \
    -d "$JSON_PAYLOAD" \
    "$GGK_URL/rules/$GGK_RULE_ID/isAllowed"

echo # Add a newline after the response

# Now check a bad request
echo "Checking bad request now..."
# The JSON payload for the request
JSON_PAYLOAD='{
    "userID": "test-user-123",
    "path": "/test/path",
    "method": "DELETE"
}'

# Make the POST request
curl -X POST \
    -H "Content-Type: application/json" \
    -d "$JSON_PAYLOAD" \
    "$GGK_URL/rules/$GGK_RULE_ID/isAllowed"

echo # Add a newline after the response