#!/bin/bash

# Check if GGK_URL is set
if [ -z "$GGK_URL" ]; then
    echo "Error: GGK_URL environment variable is not set"
    exit 1
fi

# We also need the admin key
if [ -z "$GGK_ADMIN" ]; then
    echo "Error: GGK_ADMIN environment variable is not set"
    exit 1
fi

API_KEY="92d077c1-31ed-49be-a1ce-dae6c2b07e19"

JSON_PAYLOAD='{
    "maxRules": 100
}'

curl -X PUT \
    -H "Authorization: $GGK_ADMIN" \
    -H "Content-Type: application/json" \
    -d "$JSON_PAYLOAD" \
    "$GGK_URL/users/$API_KEY"