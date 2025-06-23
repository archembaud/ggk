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
        "allowedEndpoints": [
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
      allowedEndpoints: [
        { path: '/data', methods: 'GET,POST' }
      ]
    }
  ]
});
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
