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

# The API key to use in the Authorization header
API_KEY="92d077c1-31ed-49be-a1ce-dae6c2b07e19"


curl -X DELETE \
    -H "Authorization: $API_KEY" \
    -H "Content-Type: application/json" \
    "$GGK_URL/rules/$GGK_RULE_ID"
