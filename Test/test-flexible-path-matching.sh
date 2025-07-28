#!/bin/bash

# Check if GGK_URL is set
if [ -z "$GGK_URL" ]; then
    echo "Error: GGK_URL environment variable is not set"
    exit 1
fi

# The API key to use in the Authorization header
API_KEY="92d077c1-31ed-49be-a1ce-dae6c2b07e19"

echo "=== Testing Flexible Path Matching Feature ==="
echo

# Step 1: Create a rule with a base path
echo "Step 1: Creating a rule with base path '/test'"
JSON_PAYLOAD='{
    "ruleAPI": "api.example.com",
    "userRules": [
        {
            "userID": "test-user-123",
            "allowedEndpoints": [
                {
                    "path": "/test",
                    "methods": "GET,POST",
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

# Step 2: Test various paths that should be allowed (flexible matching)
echo "Step 2: Testing paths that should be allowed (flexible matching)"
echo

# Test cases: base path and various sub-paths
TEST_PATHS=(
    "/test"
    "/test/123"
    "/test/health"
    "/test/user/profile"
    "/test/api/v1/data"
    "/test/deeply/nested/path/with/multiple/levels"
)

for path in "${TEST_PATHS[@]}"; do
    echo "Testing path: $path"
    
    JSON_PAYLOAD="{
        \"userID\": \"test-user-123\",
        \"url\": \"https://api.example.com$path\",
        \"method\": \"GET\"
    }"
    
    RESPONSE=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "$JSON_PAYLOAD" \
        "$GGK_URL/rules/$RULE_ID/isAllowed")
    
    # Check if the response indicates success
    if echo "$RESPONSE" | grep -q '"message":"Access allowed"'; then
        echo "✅ PASS: $path is allowed"
    else
        echo "❌ FAIL: $path is denied"
        echo "Response: $RESPONSE"
    fi
    echo
done

# Step 3: Test paths that should be denied (don't start with /test)
echo "Step 3: Testing paths that should be denied (don't start with /test)"
echo

DENY_PATHS=(
    "/other"
    "/api/data"
    "/user/profile"
    "/health"
    "/test2"  # This doesn't start with /test (it's /test2)
)

for path in "${DENY_PATHS[@]}"; do
    echo "Testing path: $path"
    
    JSON_PAYLOAD="{
        \"userID\": \"test-user-123\",
        \"url\": \"https://api.example.com$path\",
        \"method\": \"GET\"
    }"
    
    RESPONSE=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "$JSON_PAYLOAD" \
        "$GGK_URL/rules/$RULE_ID/isAllowed")
    
    # Check if the response indicates denial
    if echo "$RESPONSE" | grep -q '"message":"Access denied"'; then
        echo "✅ PASS: $path is correctly denied"
    else
        echo "❌ FAIL: $path is incorrectly allowed"
        echo "Response: $RESPONSE"
    fi
    echo
done

# Step 4: Test method restrictions (should still work)
echo "Step 4: Testing method restrictions"
echo

echo "Testing POST method on allowed path:"
JSON_PAYLOAD='{
    "userID": "test-user-123",
    "url": "https://api.example.com/test/123",
    "method": "POST"
}'

RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "$JSON_PAYLOAD" \
    "$GGK_URL/rules/$RULE_ID/isAllowed")

if echo "$RESPONSE" | grep -q '"message":"Access allowed"'; then
    echo "✅ PASS: POST method is allowed"
else
    echo "❌ FAIL: POST method is denied"
    echo "Response: $RESPONSE"
fi
echo

echo "Testing DELETE method on allowed path (should be denied):"
JSON_PAYLOAD='{
    "userID": "test-user-123",
    "url": "https://api.example.com/test/123",
    "method": "DELETE"
}'

RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "$JSON_PAYLOAD" \
    "$GGK_URL/rules/$RULE_ID/isAllowed")

if echo "$RESPONSE" | grep -q '"message":"Access denied"'; then
    echo "✅ PASS: DELETE method is correctly denied"
else
    echo "❌ FAIL: DELETE method is incorrectly allowed"
    echo "Response: $RESPONSE"
fi
echo

echo "=== Flexible Path Matching Test Complete ==="
echo "Rule ID used: $RULE_ID"
echo "You can clean up by deleting this rule if needed." 