#!/bin/bash

# Check if GGK_URL is set
if [ -z "$GGK_URL" ]; then
    echo "Error: GGK_URL environment variable is not set"
    exit 1
fi

# The API key to use in the Authorization header
API_KEY="92d077c1-31ed-49be-a1ce-dae6c2b07e19"

echo "Testing that only relevant rules are considered..."
echo "=================================================="

# Step 1: Create a rule with multiple endpoints, some relevant and some not
echo "Step 1: Creating a rule with multiple endpoints"
JSON_PAYLOAD='{
    "ruleAPI": "api.example.com",
    "userRules": [
        {
            "userID": "test-user-123",
            "pathRules": [
                {
                    "path": "/api/v1/users",
                    "methods": "GET,POST",
                    "effect": "ALLOWED"
                },
                {
                    "path": "/api/v1/products",
                    "methods": "GET",
                    "effect": "ALLOWED"
                },
                {
                    "path": "/api/v2/admin",
                    "methods": "GET,POST,PUT,DELETE",
                    "effect": "ALLOWED"
                }
            ]
        }
    ]
}'

# Make the POST request to create the rule
RESPONSE=$(curl -s -X POST \
    -H "Authorization: $API_KEY" \
    -H "Content-Type: application/json" \
    -d "$JSON_PAYLOAD" \
    "$GGK_URL/rules")

echo "Create rule response: $RESPONSE"

# Extract the rule ID from the response
RULE_ID=$(echo $RESPONSE | grep -o '"ruleId":"[^"]*"' | cut -d'"' -f4)

if [ -z "$RULE_ID" ]; then
    echo "Error: Failed to extract rule ID from response"
    exit 1
fi

echo "Created rule with ID: $RULE_ID"
echo

# Step 2: Test access to /api/v1/users (should be allowed)
echo "Step 2: Testing access to /api/v1/users (should be allowed)"
JSON_PAYLOAD='{
    "userID": "test-user-123",
    "url": "https://api.example.com/api/v1/users",
    "method": "GET"
}'

RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "$JSON_PAYLOAD" \
    "$GGK_URL/rules/$RULE_ID/isAllowed")

if echo "$RESPONSE" | grep -q '"message":"Access allowed"'; then
    echo "✅ PASS: Access to /api/v1/users is allowed (only relevant rule considered)"
else
    echo "❌ FAIL: Access to /api/v1/users is denied"
    echo "Response: $RESPONSE"
fi
echo

# Step 3: Test access to /api/v1/products (should be allowed)
echo "Step 3: Testing access to /api/v1/products (should be allowed)"
JSON_PAYLOAD='{
    "userID": "test-user-123",
    "url": "https://api.example.com/api/v1/products",
    "method": "GET"
}'

RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "$JSON_PAYLOAD" \
    "$GGK_URL/rules/$RULE_ID/isAllowed")

if echo "$RESPONSE" | grep -q '"message":"Access allowed"'; then
    echo "✅ PASS: Access to /api/v1/products is allowed (only relevant rule considered)"
else
    echo "❌ FAIL: Access to /api/v1/products is denied"
    echo "Response: $RESPONSE"
fi
echo

# Step 4: Test access to /api/v2/admin (should be allowed)
echo "Step 4: Testing access to /api/v2/admin (should be allowed)"
JSON_PAYLOAD='{
    "userID": "test-user-123",
    "url": "https://api.example.com/api/v2/admin",
    "method": "GET"
}'

RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "$JSON_PAYLOAD" \
    "$GGK_URL/rules/$RULE_ID/isAllowed")

if echo "$RESPONSE" | grep -q '"message":"Access allowed"'; then
    echo "✅ PASS: Access to /api/v2/admin is allowed (only relevant rule considered)"
else
    echo "❌ FAIL: Access to /api/v2/admin is denied"
    echo "Response: $RESPONSE"
fi
echo

# Step 5: Test access to non-matching path (should be denied)
echo "Step 5: Testing access to non-matching path (should be denied)"
JSON_PAYLOAD='{
    "userID": "test-user-123",
    "url": "https://api.example.com/api/v3/other",
    "method": "GET"
}'

RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "$JSON_PAYLOAD" \
    "$GGK_URL/rules/$RULE_ID/isAllowed")

if echo "$RESPONSE" | grep -q '"message":"Access denied"'; then
    echo "✅ PASS: Access to /api/v3/other is correctly denied (no relevant rules)"
else
    echo "❌ FAIL: Access to /api/v3/other is incorrectly allowed"
    echo "Response: $RESPONSE"
fi
echo

# Step 6: Test access with wrong method (should be denied)
echo "Step 6: Testing access with wrong method (should be denied)"
JSON_PAYLOAD='{
    "userID": "test-user-123",
    "url": "https://api.example.com/api/v1/users",
    "method": "DELETE"
}'

RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "$JSON_PAYLOAD" \
    "$GGK_URL/rules/$RULE_ID/isAllowed")

if echo "$RESPONSE" | grep -q '"message":"Access denied"'; then
    echo "✅ PASS: DELETE method on /api/v1/users is correctly denied (method doesn't match)"
else
    echo "❌ FAIL: DELETE method on /api/v1/users is incorrectly allowed"
    echo "Response: $RESPONSE"
fi
echo

# Clean up
echo "Cleaning up - deleting the test rule..."
DELETE_RESPONSE=$(curl -s -X DELETE \
    -H "Authorization: $API_KEY" \
    "$GGK_URL/rules/$RULE_ID")

echo "Delete response: $DELETE_RESPONSE"
echo

echo "=== Relevant Rules Only Test Complete ==="
echo "This test verifies that only rules relevant to the path/method being checked are considered." 