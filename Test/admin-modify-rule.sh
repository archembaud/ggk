#!/bin/bash

# Check if GGK_URL is set
if [ -z "$GGK_URL" ]; then
    echo "Error: GGK_URL environment variable is not set"
    exit 1
fi

# We also need a rule (GGK_RULE_ID)
if [ -z "$GGK_RULE_ID" ]; then
    echo "Error: GGK_RULE_ID environment variable is not set"
    exit 1
fi

# We also need the admin key
if [ -z "$GGK_ADMIN" ]; then
    echo "Error: GGK_ADMIN environment variable is not set"
    exit 1
fi

# Now to modify an existing rule - first, update the ruleAPI
JSON_PAYLOAD='{
    "ruleAPI": "test-api-updated",
    "ruleEnabled": false
}'

# Make the PUT request
curl -X PUT \
    -H "Authorization: $GGK_ADMIN" \
    -H "Content-Type: application/json" \
    -d "$JSON_PAYLOAD" \
    "$GGK_URL/rules/$GGK_RULE_ID"
