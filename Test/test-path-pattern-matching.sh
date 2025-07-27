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

# The API key to use in the Authorization header
API_KEY="92d077c1-31ed-49be-a1ce-dae6c2b07e19"

echo "Testing path pattern matching for rule: $RULE_ID"
echo "=================================================="

# Test cases for path pattern matching
declare -a test_cases=(
    # Test case 1: Basic path pattern matching
    '{"userID": "test-user-123", "url": "https://api.example.com/api/v1/users/123", "method": "GET"}'
    '{"userID": "test-user-123", "url": "https://api.example.com/api/v1/users/456", "method": "POST"}'
    '{"userID": "test-user-123", "url": "https://api.example.com/api/v1/users/abc", "method": "GET"}'
    
    # Test case 2: Product path pattern matching
    '{"userID": "test-user-123", "url": "https://api.example.com/api/v1/products/789", "method": "GET"}'
    '{"userID": "test-user-123", "url": "https://api.example.com/api/v1/products/abc123", "method": "PUT"}'
    '{"userID": "test-user-123", "url": "https://api.example.com/api/v1/products/xyz/delete", "method": "DELETE"}'
    
    # Test case 3: Admin path pattern matching
    '{"userID": "test-user-123", "url": "https://api.example.com/api/v2/admin/settings", "method": "GET"}'
    '{"userID": "test-user-123", "url": "https://api.example.com/api/v2/admin/users", "method": "GET"}'
    
    # Test case 4: Premium user tests (broader access)
    '{"userID": "premium-user", "url": "https://api.example.com/api/v1/users/123", "method": "GET"}'
    '{"userID": "premium-user", "url": "https://api.example.com/api/v1/products/789", "method": "PUT"}'
    '{"userID": "premium-user", "url": "https://api.example.com/api/v1/orders/123", "method": "POST"}'
    '{"userID": "premium-user", "url": "https://api.example.com/api/v1/analytics/dashboard", "method": "GET"}'
    
    # Test case 5: Should be denied (wrong host)
    '{"userID": "test-user-123", "url": "https://wrong.example.com/api/v1/users/123", "method": "GET"}'
    
    # Test case 6: Should be denied (wrong method)
    '{"userID": "test-user-123", "url": "https://api.example.com/api/v1/users/123", "method": "DELETE"}'
    
    # Test case 7: Should be denied (path doesn't match pattern)
    '{"userID": "test-user-123", "url": "https://api.example.com/api/v2/users/123", "method": "GET"}'
    '{"userID": "test-user-123", "url": "https://api.example.com/api/v1/orders/123", "method": "GET"}'
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
echo "Path pattern matching tests completed!" 