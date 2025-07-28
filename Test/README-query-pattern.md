# Query Pattern Feature Documentation

## Overview

The `query_pattern` feature allows you to add regex-based validation for URL query parameters in your rules. This enables fine-grained control over which URL parameters are permitted when users access resources.

## How It Works

1. **URL Parameter Extraction**: When a POST request is made to the `/isAllowed` endpoint, the system extracts the query parameters from the URL in the request body.

2. **Regex Pattern Matching**: For each `pathRule` that has a non-empty `query_pattern`, the system executes the regex expression against the extracted URL parameters.

3. **Access Control Logic**:
   - **ALLOWED rules**: If the regex matches, access is granted. If it doesn't match, access is denied.
   - **DISALLOWED rules**: If the regex matches, access is denied. If it doesn't match, the rule doesn't block access.

## Usage

### Adding query_pattern to Rules

When creating or updating rules, you can add a `query_pattern` field to any `pathRule`:

```json
{
    "ruleAPI": "api.example.com",
    "userRules": [
        {
            "userID": "test-user-123",
            "pathRules": [
                {
                    "path": "/api/users",
                    "methods": "GET",
                    "effect": "ALLOWED",
                    "query_pattern": "\\?role=admin"
                },
                {
                    "path": "/api/users",
                    "methods": "GET",
                    "effect": "DISALLOWED",
                    "query_pattern": "\\?role=superuser"
                }
            ]
        }
    ]
}
```

### Default Behavior

- If `query_pattern` is not provided in a `pathRule`, it defaults to an empty string
- If `query_pattern` is an empty string, the rule behaves as before (no query parameter validation)
- If `query_pattern` contains an invalid regex, ALLOWED rules will deny access, while DISALLOWED rules will not block access

## Examples

### Basic Examples

1. **Allow only admin role access**:
   ```json
   {
       "path": "/api/users",
       "methods": "GET",
       "effect": "ALLOWED",
       "query_pattern": "\\?role=admin"
   }
   ```

2. **Disallow superuser role access**:
   ```json
   {
       "path": "/api/users",
       "methods": "GET",
       "effect": "DISALLOWED",
       "query_pattern": "\\?role=superuser"
   }
   ```

### Advanced Examples

1. **Numeric ID validation**:
   ```json
   {
       "path": "/api/users",
       "methods": "GET",
       "effect": "ALLOWED",
       "query_pattern": "\\?id=\\d+"
   }
   ```

2. **Multiple parameter validation**:
   ```json
   {
       "path": "/api/users",
       "methods": "GET",
       "effect": "ALLOWED",
       "query_pattern": "\\?role=(admin|user)&status=(active|inactive)"
   }
   ```

3. **Limit validation**:
   ```json
   {
       "path": "/api/data",
       "methods": "POST",
       "effect": "ALLOWED",
       "query_pattern": "\\?type=(public|private)&limit=\\d{1,3}"
   }
   ```

4. **Security pattern (block sensitive queries)**:
   ```json
   {
       "path": "/api/search",
       "methods": "GET",
       "effect": "DISALLOWED",
       "query_pattern": "\\?query=.*password.*"
   }
   ```

## Testing

Use the provided test scripts to verify the functionality:

1. `create-rule-with-query-pattern.sh` - Creates a basic rule with query patterns
2. `test-query-pattern.sh` - Tests basic query pattern functionality
3. `create-rule-with-complex-query-patterns.sh` - Creates rules with complex patterns
4. `test-complex-query-patterns.sh` - Tests complex query pattern scenarios
5. `create-rule-with-empty-query-pattern.sh` - Creates rules with empty query patterns

## URL Parameter Handling

The system extracts the full query string (including the `?` character) from the URL and matches it against the regex pattern. This means:

- `https://api.example.com/api/users?role=admin` → query string: `?role=admin`
- `https://api.example.com/api/users?role=admin&status=active` → query string: `?role=admin&status=active`
- `https://api.example.com/api/users` → query string: `""` (empty)

## Error Handling

- **Invalid Regex**: If a `query_pattern` contains an invalid regex, the system logs an error and treats ALLOWED rules as denying access, while DISALLOWED rules don't block access.
- **Missing Parameters**: If a URL has no query parameters, the query string is empty and will only match patterns that account for this.

## Best Practices

1. **Escape Special Characters**: Use double backslashes (`\\`) in JSON strings for regex special characters
2. **Test Patterns**: Always test your regex patterns before deploying to production
3. **Be Specific**: Use specific patterns rather than overly broad ones to avoid unintended matches
4. **Consider Order**: Remember that DISALLOWED rules take precedence when they match
5. **Document Patterns**: Keep documentation of your regex patterns for maintenance purposes 