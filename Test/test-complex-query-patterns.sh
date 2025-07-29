#!/bin/bash

# The script is supposed to be run after the create-rule-with-complex-query-patterns.sh script has run.
# You'll need to get the rule ID generated as part of this script.

# Check if GGK_URL is set
if [ -z "$GGK_URL" ]; then
    echo "Error: GGK_URL environment variable is not set"
    exit 1
fi

# Needs a rule ID
if [ -z "$GGK_RULE_ID" ]; then
    echo "Error: GGK_RULE_ID environment variable is not set"
    exit 1
fi

echo "Testing complex query pattern functionality..."

# Test 1: Numeric ID - should be ALLOWED
echo "Test 1: Numeric ID - should be ALLOWED"
JSON_PAYLOAD='{
    "userID": "test-user-123",
    "url": "https://api.example.com/api/users?id=123",
    "method": "GET"
}'

curl -X POST \
    -H "Content-Type: application/json" \
    -d "$JSON_PAYLOAD" \
    "$GGK_URL/rules/$GGK_RULE_ID/isAllowed"

echo -e "\n"

# Test 2: Alphabetic ID - should be DISALLOWED
echo "Test 2: Alphabetic ID - should be DISALLOWED"
JSON_PAYLOAD='{
    "userID": "test-user-123",
    "url": "https://api.example.com/api/users?id=abc",
    "method": "GET"
}'

curl -X POST \
    -H "Content-Type: application/json" \
    -d "$JSON_PAYLOAD" \
    "$GGK_URL/rules/$GGK_RULE_ID/isAllowed"

echo -e "\n"

# Test 3: Valid role and status combination - should be ALLOWED
echo "Test 3: Valid role and status combination - should be ALLOWED"
JSON_PAYLOAD='{
    "userID": "test-user-123",
    "url": "https://api.example.com/api/users?role=admin&status=active",
    "method": "GET"
}'

curl -X POST \
    -H "Content-Type: application/json" \
    -d "$JSON_PAYLOAD" \
    "$GGK_URL/rules/$GGK_RULE_ID/isAllowed"

echo -e "\n"

# Test 4: Invalid role and status combination - should be denied
echo "Test 4: Invalid role and status combination - should be denied"
JSON_PAYLOAD='{
    "userID": "test-user-123",
    "url": "https://api.example.com/api/users?role=moderator&status=pending",
    "method": "GET"
}'

curl -X POST \
    -H "Content-Type: application/json" \
    -d "$JSON_PAYLOAD" \
    "$GGK_URL/rules/$GGK_RULE_ID/isAllowed"

echo -e "\n"

# Test 5: Valid data type and limit - should be ALLOWED
echo "Test 5: Valid data type and limit - should be ALLOWED"
JSON_PAYLOAD='{
    "userID": "test-user-123",
    "url": "https://api.example.com/api/data?type=public&limit=100",
    "method": "POST"
}'

curl -X POST \
    -H "Content-Type: application/json" \
    -d "$JSON_PAYLOAD" \
    "$GGK_URL/rules/$GGK_RULE_ID/isAllowed"

echo -e "\n"

# Test 6: Invalid limit (too many digits) - should be denied
echo "Test 6: Invalid limit (too many digits) - should be denied"
JSON_PAYLOAD='{
    "userID": "test-user-123",
    "url": "https://api.example.com/api/data?type=public&limit=1000",
    "method": "POST"
}'

curl -X POST \
    -H "Content-Type: application/json" \
    -d "$JSON_PAYLOAD" \
    "$GGK_URL/rules/$GGK_RULE_ID/isAllowed"

echo -e "\n"

# Test 7: Search query with password - should be DISALLOWED
echo "Test 7: Search query with password - should be DISALLOWED"
JSON_PAYLOAD='{
    "userID": "test-user-123",
    "url": "https://api.example.com/api/search?query=user+password+reset",
    "method": "GET"
}'

curl -X POST \
    -H "Content-Type: application/json" \
    -d "$JSON_PAYLOAD" \
    "$GGK_URL/rules/$GGK_RULE_ID/isAllowed"

echo -e "\n"

# Test 8: Search query without password - should be allowed
echo "Test 8: Search query without password - should be allowed"
JSON_PAYLOAD='{
    "userID": "test-user-123",
    "url": "https://api.example.com/api/search?query=user+profile",
    "method": "GET"
}'

curl -X POST \
    -H "Content-Type: application/json" \
    -d "$JSON_PAYLOAD" \
    "$GGK_URL/rules/$GGK_RULE_ID/isAllowed"

echo -e "\n"

# Test 9: URL with no query parameters - should be allowed (no pattern to match)
echo "Test 9: URL with no query parameters - should be allowed"
JSON_PAYLOAD='{
    "userID": "test-user-123",
    "url": "https://api.example.com/api/users",
    "method": "GET"
}'

curl -X POST \
    -H "Content-Type: application/json" \
    -d "$JSON_PAYLOAD" \
    "$GGK_URL/rules/$GGK_RULE_ID/isAllowed"

echo -e "\n" 