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

curl -X GET \
    -H "Authorization: $GGK_ADMIN" \
    -H "Content-Type: application/json" \
    "$GGK_URL/users"