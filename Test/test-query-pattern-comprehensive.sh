#!/bin/bash

# The script is supposed to be run after the create-rule-with-query-pattern.sh script has run.
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

echo "Comprehensive query pattern testing..."

# Test 1: Complex regex pattern - allow only numeric IDs
echo "Test 1: Complex regex pattern - allow only numeric IDs"
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

# Test 2: Complex regex pattern - disallow non-numeric IDs
echo "Test 2: Complex regex pattern - disallow non-numeric IDs"
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

# Test 3: Multiple parameters with specific pattern
echo "Test 3: Multiple parameters with specific pattern"
JSON_PAYLOAD='{
    "userID": "test-user-123",
    "url": "https://api.example.com/api/users?role=admin&status=active&limit=10",
    "method": "GET"
}'

curl -X POST \
    -H "Content-Type: application/json" \
    -d "$JSON_PAYLOAD" \
    "$GGK_URL/rules/$GGK_RULE_ID/isAllowed"

echo -e "\n"

# Test 4: URL with no query parameters
echo "Test 4: URL with no query parameters"
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

# Test 5: URL with empty query parameters
echo "Test 5: URL with empty query parameters"
JSON_PAYLOAD='{
    "userID": "test-user-123",
    "url": "https://api.example.com/api/users?",
    "method": "GET"
}'

curl -X POST \
    -H "Content-Type: application/json" \
    -d "$JSON_PAYLOAD" \
    "$GGK_URL/rules/$GGK_RULE_ID/isAllowed"

echo -e "\n"

# Test 6: URL with special characters in parameters
echo "Test 6: URL with special characters in parameters"
JSON_PAYLOAD='{
    "userID": "test-user-123",
    "url": "https://api.example.com/api/users?name=John%20Doe&email=john@example.com",
    "method": "GET"
}'

curl -X POST \
    -H "Content-Type: application/json" \
    -d "$JSON_PAYLOAD" \
    "$GGK_URL/rules/$GGK_RULE_ID/isAllowed"

echo -e "\n" 