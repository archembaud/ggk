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

echo "Testing query pattern functionality..."

# Test 1: ALLOWED rule with matching query pattern
echo "Test 1: ALLOWED rule with matching query pattern (?role=admin)"
JSON_PAYLOAD='{
    "userID": "test-user-123",
    "url": "https://api.example.com/api/users?role=admin",
    "method": "GET"
}'

curl -X POST \
    -H "Content-Type: application/json" \
    -d "$JSON_PAYLOAD" \
    "$GGK_URL/rules/$GGK_RULE_ID/isAllowed"

echo -e "\n"

# Test 2: ALLOWED rule with non-matching query pattern
echo "Test 2: ALLOWED rule with non-matching query pattern (?role=user)"
JSON_PAYLOAD='{
    "userID": "test-user-123",
    "url": "https://api.example.com/api/users?role=user",
    "method": "GET"
}'

curl -X POST \
    -H "Content-Type: application/json" \
    -d "$JSON_PAYLOAD" \
    "$GGK_URL/rules/$GGK_RULE_ID/isAllowed"

echo -e "\n"

# Test 3: DISALLOWED rule with matching query pattern
echo "Test 3: DISALLOWED rule with matching query pattern (?role=superuser)"
JSON_PAYLOAD='{
    "userID": "test-user-123",
    "url": "https://api.example.com/api/users?role=superuser",
    "method": "GET"
}'

curl -X POST \
    -H "Content-Type: application/json" \
    -d "$JSON_PAYLOAD" \
    "$GGK_URL/rules/$GGK_RULE_ID/isAllowed"

echo -e "\n"

# Test 4: DISALLOWED rule with non-matching query pattern
echo "Test 4: DISALLOWED rule with non-matching query pattern (?role=admin)"
JSON_PAYLOAD='{
    "userID": "test-user-123",
    "url": "https://api.example.com/api/users?role=admin",
    "method": "GET"
}'

curl -X POST \
    -H "Content-Type: application/json" \
    -d "$JSON_PAYLOAD" \
    "$GGK_URL/rules/$GGK_RULE_ID/isAllowed"

echo -e "\n"

# Test 5: Rule without query pattern (should work as before)
echo "Test 5: Rule without query pattern"
JSON_PAYLOAD='{
    "userID": "test-user-123",
    "url": "https://api.example.com/api/data?type=public",
    "method": "POST"
}'

curl -X POST \
    -H "Content-Type: application/json" \
    -d "$JSON_PAYLOAD" \
    "$GGK_URL/rules/$GGK_RULE_ID/isAllowed"

echo -e "\n"

# Test 6: Multiple query parameters
echo "Test 6: Multiple query parameters (?role=admin&type=user)"
JSON_PAYLOAD='{
    "userID": "test-user-123",
    "url": "https://api.example.com/api/users?role=admin&type=user",
    "method": "GET"
}'

curl -X POST \
    -H "Content-Type: application/json" \
    -d "$JSON_PAYLOAD" \
    "$GGK_URL/rules/$GGK_RULE_ID/isAllowed"

echo -e "\n" 