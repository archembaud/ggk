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

# Test an invalid fetch, with the admin key provided
API_KEY="boom-shaka-laka"

echo "Testing invalid valid fetch on rule"

curl -X GET \
    -H "Authorization: $API_KEY" \
    -H "AdminKey: $GGK_ADMIN" \
    -H "Content-Type: application/json" \
    "$GGK_URL/rules/$GGK_RULE_ID"