#!/bin/bash

# Check if GGK_URL is set
if [ -z "$GGK_URL" ]; then
    echo "Error: GGK_URL environment variable is not set"
    exit 1
fi

# The API key to use in the Authorization header
API_KEY="92d077c1-31ed-49be-a1ce-dae6c2b07e19"

echo "Testing rule limit functionality..."
echo "Attempting to create multiple rules to test the limit..."

# Try to create 12 rules (exceeding the default limit of 10)
for i in {1..12}; do
    echo "Creating rule $i..."
    
    # Create a unique JSON payload for each rule
    JSON_PAYLOAD="{
        \"ruleAPI\": \"api$i.example.com\",
        \"userRules\": [
            {
                \"userID\": \"test-user-$i\",
                \"pathRules\": [
                    {
                        \"path\": \"/test/path$i\",
                        \"methods\": \"GET,POST\",
                        \"effect\": \"ALLOWED\"
                    }
                ]
            }
        ]
    }"
    
    # Make the POST request
    RESPONSE=$(curl -s -X POST \
        -H "Authorization: $API_KEY" \
        -H "Content-Type: application/json" \
        -d "$JSON_PAYLOAD" \
        "$GGK_URL/rules")
    
    echo "Response for rule $i:"
    echo "$RESPONSE"
    echo "---"
    
    # Check if we got a 403 error (limit exceeded)
    if echo "$RESPONSE" | grep -q "Rule limit exceeded"; then
        echo "✅ Rule limit check working correctly - got 403 error as expected"
        break
    fi
    
    # Wait a moment between requests
    sleep 1
done

echo "Test completed!" 