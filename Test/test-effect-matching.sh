#!/bin/bash

# Check if GGK_URL is set
if [ -z "$GGK_URL" ]; then
    echo "Error: GGK_URL environment variable is not set"
    exit 1
fi

# Check if ruleId is provided as argument
if [ -z "$1" ]; then
    echo "Error: Please provide a ruleId as an argument"
    echo "Usage: $0 <ruleId>"
    exit 1
fi

RULE_ID="$1"

echo "Testing effect parameter matching for rule: $RULE_ID"
echo "=================================================="

# Test cases for effect parameter matching
declare -a test_cases=(
    # Test case 1: test-user-123 - Should be ALLOWED (matches ALLOWED pattern, doesn't match DISALLOWED patterns)
    '{"userID": "test-user-123", "url": "https://api.example.com/api/v1/users/456", "method": "GET"}'
    '{"userID": "test-user-123", "url": "https://api.example.com/api/v1/products/789", "method": "POST"}'
    '{"userID": "test-user-123", "url": "https://api.example.com/api/v1/orders/123", "method": "PUT"}'
    
    # Test case 2: test-user-123 - Should be DISALLOWED (matches DISALLOWED admin pattern)
    '{"userID": "test-user-123", "url": "https://api.example.com/api/v1/admin/settings", "method": "GET"}'
    '{"userID": "test-user-123", "url": "https://api.example.com/api/v1/admin/users", "method": "POST"}'
    
    # Test case 3: test-user-123 - Should be DISALLOWED (matches DISALLOWED specific user pattern)
    '{"userID": "test-user-123", "url": "https://api.example.com/api/v1/users/123", "method": "GET"}'
    '{"userID": "test-user-123", "url": "https://api.example.com/api/v1/users/123", "method": "DELETE"}'
    
    # Test case 4: admin-user - Should be ALLOWED (has full access to /api/v1/*)
    '{"userID": "admin-user", "url": "https://api.example.com/api/v1/users/123", "method": "GET"}'
    '{"userID": "admin-user", "url": "https://api.example.com/api/v1/admin/settings", "method": "GET"}'
    '{"userID": "admin-user", "url": "https://api.example.com/api/v1/products/789", "method": "POST"}'
    
    # Test case 5: Should be DISALLOWED (wrong host)
    '{"userID": "test-user-123", "url": "https://wrong.example.com/api/v1/users/456", "method": "GET"}'
    
    # Test case 6: Should be DISALLOWED (path doesn't match any pattern)
    '{"userID": "test-user-123", "url": "https://api.example.com/api/v2/users/456", "method": "GET"}'
    '{"userID": "test-user-123", "url": "https://api.example.com/api/v1", "method": "GET"}'
)

# Counter for test cases
counter=1

for test_case in "${test_cases[@]}"; do
    echo ""
    echo "Test $counter:"
    echo "Request: $test_case"
    echo "Response:"
    
    # Make the POST request
    response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "$test_case" \
        "$GGK_URL/rules/$RULE_ID/isAllowed")
    
    echo "$response"
    echo "----------------------------------------"
    
    ((counter++))
done

echo ""
echo "Effect parameter matching tests completed!" 