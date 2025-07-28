# Guid Gate Keeper (GGK)

**Guid Gate Keeper (GGK)** is a simple, secure, and flexible service for managing fine-grained access control to your APIs or applications. It lets you define rules for who can access what, using your own API keys and user identifiers (GUIDs).

## What does GGK do?
- Lets you create and manage access rules for your users, identified by GUIDs you control.
- Lets you check, in real time, if a user is allowed to access a specific endpoint or method.
- Provides a simple REST API and an easy-to-use SDK for integration.

## How easy is it to get started?
**You don't need to sign up or register anywhere!**

- **To create a free account:** Just make your first POST request to the `/rules` endpoint with your chosen API key. That's it! Your account is created automatically.
- **You can use curl, Postman, or the SDK.**

### Example: Create a rule with curl
```sh
curl -X POST https://your-ggk-url/rules \
  -H "Authorization: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "ruleAPI": "api.example.com",
    "userRules": [
      {
        "userID": "user-guid-123",
        "pathRules": [
          { "path": "/data", "methods": "GET,POST" }
        ]
      }
    ]
  }'
```

### Example: Create a rule with the SDK
```js
import { GGKClient } from 'ggk-sdk';
const client = new GGKClient('YOUR_API_KEY');
await client.createRule({
  ruleAPI: 'api.example.com',
  userRules: [
    {
      userID: 'user-guid-123',
      pathRules: [
        { path: '/data', methods: 'GET,POST' }
      ]
    }
  ]
});
```

## Test Scripts

The `/Test` folder contains a comprehensive set of bash scripts for testing and demonstrating GGK functionality. These scripts require the following environment variables to be set:

- `GGK_URL`: The base URL of your GGK service. The default testing URL is https://ggk-stack-test.ggk.archembaud.com
- `GGK_RULE_ID`: The ID of a rule (for scripts that test existing rules). Use the create-rule.sh script to create a rule and get it's ID.
- `GGK_ADMIN`: Admin API key (for admin operations). Provided on stack deployment.

### Basic Rule Management Scripts

- **`create-rule.sh`** - Creates a basic rule with test endpoints for GET, POST, and DELETE methods

```bash
sh create-rule.sh
```
- **`get-rules.sh`** - Lists all rules for the API key

```bash
sh get-rules.sh
```

- **`get-rule.sh`** - Retrieves a specific rule by ID.
```bash
export GGK_RULE_ID=<your rule ID>
sh get-rule.sh
```
- **`modify-rule.sh`** - Updates an existing rule
```bash
export GGK_RULE_ID=<your rule ID>
sh modify-rule.sh
```
- **`create-rule-with-path-pattern.sh`** - Creates a rule using path patterns (e.g., `/api/v1/users/*`)
- **`create-rule-multiple-path-patterns.sh`** - Creates a rule with multiple path patterns for different access levels
```bash
sh create-rule-with-path-pattern.sh
sh create-rule-multiple-path-patterns.sh
```

- **`update-rule-path-pattern.sh`** - Updates the path pattern of an existing rule
- **`delete-rule.sh`** - Deletes a rule by ID
```bash
export GGK_RULE_ID=<your rule ID>
sh delete-rule.sh
```

### Rule Testing Scripts

- **`check-rule.sh`** - Tests rule enforcement with multiple scenarios (allowed and denied requests)
```bash
# Create a rule and collect the rule ID
sh create-rule.sh
# Set the rule ID; we'll use it in the check-rule.sh script.
export GGK_RULE_ID=<your rule ID>
# Check the access
sh check-rule.sh
```
- **`test-path-pattern-matching.sh`** - Comprehensive testing of path pattern matching with various URL patterns.
```bash
# Create rules with regex
sh create-rule-with-path-pattern.sh
# Grab the rule ID created
export GGK_RULE_ID=<your rule ID>
# Pass in the GGK_RULE_ID as an argument
./test-path-pattern-matching.sh $GGK_RULE_ID
```

- **`test-effect-matching.sh`** - Tests the effect parameter (ALLOWED/DISALLOWED) functionality
- **`test-flexible-path-matching.sh`** - Tests flexible path matching with wildcards and patterns
- **`test-relevant-rules-only.sh`** - Tests rule filtering to show only relevant rules for a user
- **`test-effect-relevant-rules.sh`** - Tests effect-based rule filtering
- **`test-rule-limit.sh`** - Tests rule limit enforcement

### User Management Scripts

- **`get-user.sh`** - Retrieves information about a specific user
- **`admin-get-users.sh`** - Lists all users (admin operation)
- **`admin-get-user.sh`** - Retrieves information about a specific user (admin operation)
- **`admin-modify-user.sh`** - Modifies user information (admin operation)
- **`admin-delete-user.sh`** - Deletes a user (admin operation)

### Admin Rule Management Scripts

- **`admin-get-rule.sh`** - Retrieves a rule (admin operation)
- **`admin-modify-rule.sh`** - Modifies a rule (admin operation)
- **`admin-delete-rule.sh`** - Deletes a rule (admin operation)

### Usage Examples

To run the test scripts, first set your environment variables:

```bash
export GGK_URL="https://your-ggk-service-url"
export GGK_ADMIN="your-admin-api-key"
```

Then run scripts as needed:

```bash
# Create a new rule
./Test/create-rule.sh

# After creating a rule, note the rule ID from the response and set it
export GGK_RULE_ID="rule-id-from-response"

# Test the rule
./Test/check-rule.sh

# Test path pattern matching
./Test/test-path-pattern-matching.sh $GGK_RULE_ID

# List all users (admin operation)
./Test/admin-get-users.sh
```

## Why is this secure?
- **You bring your own API key.** Only you know it, and it's never shared with anyone else.
- **User GUIDs are private.** The GUIDs you use to identify your users are only meaningful to you—they're never exposed or reused by GGK.
- **No central user registry.** You control your users and their permissions, and only you can manage your rules.

## What else can you do?
- Check if a user is allowed to access a resource (with a single API call).
- Update or delete rules as your needs change.
- Use admin tools (with a special admin key) to manage users and rules at scale.

---

**GGK makes access control simple, secure, and developer-friendly.**
