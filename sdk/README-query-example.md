# Query Pattern SDK Example

This example demonstrates how to use the new `query_pattern` functionality with the GGK SDK.

## Overview

The `query_example.ts` script showcases various scenarios for using the `query_pattern` parameter in rules, including:

1. **Basic Query Pattern Testing** - Simple allow/deny patterns
2. **Complex Query Pattern Testing** - Advanced regex patterns with multiple parameters
3. **Empty Query Pattern Testing** - Default behavior when no patterns are specified
4. **Wildcard User Query Pattern Testing** - Using query patterns with wildcard users

## Prerequisites

1. **Environment Setup**: Make sure you have the following environment variables set:
   - `GGK_URL`: The base URL of your GGK API
   - `GGK_ADMIN`: Your admin API key

2. **Dependencies**: Ensure all SDK dependencies are installed:
   ```bash
   npm install
   ```

## Running the Example

1. **Compile the TypeScript**:
   ```bash
   npm run build
   ```

2. **Run the example**:
   ```bash
   node dist/query_example.js
   ```

   Or if you're using ts-node:
   ```bash
   npx ts-node src/query_example.ts
   ```

## What the Example Tests

### 1. Basic Query Pattern Test

Creates rules with simple query patterns:
- **ALLOWED**: `?role=admin` - Only allows admin role access
- **DISALLOWED**: `?role=superuser` - Explicitly blocks superuser role access
- **ALLOWED**: `?type=public` - Allows public type access

Test cases include:
- Matching and non-matching patterns
- Multiple query parameters
- URLs with and without query parameters

### 2. Complex Query Pattern Test

Demonstrates advanced regex patterns:
- **Numeric ID validation**: `?id=\d+` - Only allows numeric IDs
- **Multiple parameter validation**: `?role=(admin|user)&status=(active|inactive)`
- **Limit validation**: `?type=(public|private)&limit=\d{1,3}` - Limits to 1-3 digits
- **Security patterns**: `?query=.*password.*` - Blocks password-related queries

### 3. Empty Query Pattern Test

Tests the default behavior when `query_pattern` is empty:
- Rules behave as if no query pattern was specified
- All query parameters are allowed/denied based on the effect alone

### 4. Wildcard User Query Pattern Test

Shows how query patterns work with wildcard users (`userID: "*"`):
- Any user can access the endpoint if they meet the query pattern criteria
- Useful for public APIs with parameter restrictions

## Expected Output

The script will output detailed test results showing:
- ✅ **PASS** - When the actual result matches the expected result
- ❌ **FAIL** - When the actual result doesn't match the expected result
- ❌ **ERROR** - When an error occurs during testing

Example output:
```
=== Query Pattern SDK Example ===
This example demonstrates the new query_pattern functionality using the GGK SDK.

=== Basic Query Pattern Test ===
Created rule with basic query patterns: { ruleId: 'abc-123-def-456' }

Testing basic query pattern functionality:
✅ PASS - ALLOWED rule with matching query pattern (?role=admin)
  URL: https://api.example.com/api/users?role=admin
  Expected: ALLOWED, Actual: ALLOWED

❌ FAIL - ALLOWED rule with non-matching query pattern (?role=user)
  URL: https://api.example.com/api/users?role=user
  Expected: DENIED, Actual: ALLOWED
```

## Key Features Demonstrated

1. **Regex Pattern Matching**: The system extracts query parameters and matches them against regex patterns
2. **Effect-based Logic**: ALLOWED rules require pattern matches, DISALLOWED rules block on matches
3. **Backward Compatibility**: Empty or missing query patterns work as before
4. **Error Handling**: Invalid regex patterns are handled gracefully
5. **Multiple Parameters**: Complex patterns can validate multiple query parameters
6. **Security Patterns**: Can block sensitive query patterns (e.g., password-related searches)

## Customization

You can modify the example to test your own scenarios by:

1. **Changing the test cases** in each test function
2. **Adding new test functions** for specific use cases
3. **Modifying the regex patterns** to match your requirements
4. **Testing with different user IDs** and API endpoints

## Troubleshooting

1. **Environment Variables**: Ensure `GGK_URL` and `GGK_ADMIN` are set correctly
2. **Network Issues**: Check that your GGK API is accessible
3. **Regex Patterns**: Test your regex patterns separately to ensure they work as expected
4. **API Permissions**: Make sure your admin key has the necessary permissions

## Cleanup

The script automatically cleans up all created rules after testing. If the script is interrupted, you may need to manually delete the test rules using the admin interface or API. 