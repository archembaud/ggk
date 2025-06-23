#!/bin/bash

# Check if GGK_URL is set
if [ -z "$GGK_URL" ]; then
    echo "Error: GGK_URL environment variable is not set"
    exit 1
fi

# The API key to use in the Authorization header
API_KEY="92d077c1-31ed-49be-a1ce-dae6c2b07e19"

echo "Testing GET /user endpoint..."

# Make the GET request
curl -X GET \
    -H "Authorization: $API_KEY" \
    -H "Content-Type: application/json" \
    "$GGK_URL/user"

echo # Add a newline after the response 