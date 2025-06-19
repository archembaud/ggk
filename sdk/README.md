# GGK SDK

TypeScript SDK for interacting with the Guid Gate Keeper API.

## What is GGK?

Guid Gate Keeper is a simple solution to a complex problem - adding fine grained permissions to otherwise overly permissive APIs.

If you have an API you are using within your organization, but you feel uncomfortable with the permissions this API makes available for any credential, you can use GGK to add another layer of checks to make sure people are using this API in a way you are comforable with.

This is done through:
* The creation of rules, and
* Checking access to resources using these rules.

## Installation

```bash
npm install ggk-sdk
```

**Note** I haven't published this to npm yet, so you'll have to use the files in this folder. :P


## Configuration

The SDK requires the following environment variable to be set:

- `GGK_URL`: The base URL of your GGK API (e.g., `https://your-api-gateway-url.amazonaws.com/prod`)

This is provided for you on deployment of your stack (if you are not using the public GGK service).

## How GGK works

### Creating rules

Guid Gate Keeper (GGK) allows people to create rules. These rules contain definitions for who can access what endpoints on an API they define.

Anyone can create a rule. After a rule is created:

* The rule creator recieves a ruleID - a guid identifying the rule.
* Only the rule creator* can see what is in the rule - i.e. who has access to what.
* Only the rule creator* can modify / update the rule - i.e. update permissions, enable or disable the rule.

The only exception is the GGK system adminstrator, accessing the GGK API using the administration ID, who can fetch details on these rules on behalf of the creator as required.

This means the creator of a rule can share the ruldID guid with anyone, including other developers, knowing that the contents of the rule are known only to them.

To create a rule:

```typescript
import { GGKClient } from 'ggk-sdk';

// Create a client instance with your API key
// Replace 'your-api-key' with a v4 guid.
const client = new GGKClient('your-api-key');

// Create a new rule
const createResult = await client.createRule({
    ruleAPI: "some.example.com",
    userRules: [
        {
            userID: '8fc79383-4e3a-4a1d-9c8c-5817534e61e7',
            allowedEndpoints: [
                {
                    path: '/test/path',
                    methods: 'GET,POST'
                }
            ]
        }
    ]
});
```

To get the details of a rule you created:

```typescript
// Get a specific rule (ruleID; a guid)
const client = new GGKClient('your-api-key');
const rule = await client.getRule(ruleID);
```

To modify a rule you created - in this case, disable it:

```typescript
// Update a rule
await client.updateRule(ruleID, {
    ruleEnabled: false
});
```

To delete a rule you created:

```typescript
 await client.deleteRule(ruleID);
```

**Note** if you attempt to get details on or modify a rule that you did not create, a 401 error will be returned.



### Using rules

Anyone who knows the ruleID can use it to check if a 3rd party has access to a web resources in the way defined in the rule. This does not mean they can see what is inside, or modify it. To use a rule:

* Create a body containing information on:
    * Who is attempting to access this resource,
    * What resource they are attempting to use (as a complete URL), and
    * How they are intending on using it.

    A sample body might be:
```bash
 {
    userID: USER_ID,
    url: 'https://some.example.com/test/path',
    method: 'GET'
}
```
For a 3rd party wishes to check if that user (USER_ID) has the desired access to the resource:

```typescript
const client = new GGKClient(null);
try {
    const isAllowedResult = client.isAllowed(ruleID, {
        userID: USER_ID,
        url: 'https://some.example.com/test/path',
        method: 'GET'
    });
    console.log('Access check result:', isAllowedResult);

} catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
        console.log('User is unable to access this endpoint')
    }
}
```

In the event a user is able to access this resource in the way intended:

```bash
Access check result: {
  message: 'Access allowed',
  ruleId: '9fafdd85-f3ec-4a5b-8d87-b82d094b9da6',
  userID: '8fc79383-4e3a-4a1d-9c8c-5817534e61e7',
  url: 'https://some.example.com/test/path',
  host: 'some.example.com',
  path: '/test/path',
  method: 'GET'
}
```

If the user was not permitted, a 401 would be returned and caught, so you would see:

```bash
User is unable to access this endpoint
```

The response contains information on the nature of the failure. For instance, in the event access was denied because the rule was disabled, the returned JSON is:

```bash
{ message: 'Access denied', reason: 'Rule is disabled' }
```

### Complete example

A complete example code can be found [here](./src/example.ts).

## Usage Limits

Free GGK accounts - with limits - are created automatically when a user creates their first rule with their unique guid (ID) when using the public GGK API.

There are limits to what the GGK accounts provide:

* A maximum of 10 rules (regardless of enabled / disabled status)
* A maximum of 100 rule checks per month.

If a user wants to be able to use GGK in amounts which exceed these limits, they should apply for a paid GGK service, which provides:

* A client with their own GGK API, deployed in an AWS region of their choosing,
* Administrative access to manage rules within their deployed service.


## API Reference

### `GGKClient`

The main client class for interacting with the GGK API.

#### Constructor

```typescript
constructor(apiKey: string | null)
```

Creates a new GGK client instance

#### Methods

- `createRule(request: CreateRuleRequest): Promise<{ ruleId: string }>`
- `getRules(): Promise<{ rules: Rule[] }>`
- `getRule(ruleId: string): Promise<{ rule: Rule }>`
- `updateRule(ruleId: string, request: UpdateRuleRequest): Promise<{ message: string; ruleId: string }>`
- `deleteRule(ruleId: string): Promise<{ message: string; ruleId: string }>`
- `isAllowed(ruleId: string, request: IsAllowedRequest): Promise<{ message: string; ruleId: string; userID: string; url: string; host: string; path: string; method: string }>`

### Types

```typescript
interface UserRule {
    userID: string;
    allowedEndpoints: {
        path: string;
        methods: string;
    }[];
}

interface Rule {
    ruleId: string;
    ruleAPI: string;
    userRules: UserRule[];
    ruleEnabled: boolean;
    dateCreated: number;
    dateModified: number;
}

interface CreateRuleRequest {
    ruleAPI: string;
    userRules: UserRule[];
}

interface UpdateRuleRequest {
    ruleAPI?: string;
    userRules?: UserRule[];
    ruleEnabled?: boolean;
}

interface IsAllowedRequest {
    userID: string;
    url: string;
    method: string;
}
```

## Error Handling

The SDK will throw errors for:
- Missing GGK_URL environment variable
- API errors (4xx, 5xx responses)
- Network errors
- Invalid request parameters

Catch errors using try/catch blocks around SDK method calls. 