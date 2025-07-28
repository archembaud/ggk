import { GGKClient } from './index';
import dotenv from 'dotenv';
import axios from 'axios';


// Load environment variables
dotenv.config();

const ADMIN_ID = process.env.GGK_ADMIN || null


if (!ADMIN_ID) {
    console.error('ADMIN_ID is not set')
    process.exit(1)
}

//const ADMIN_ID = '92d077c1-31ed-49be-a1ce-dae6c2b07e19'
const USER_ID = '8fc79383-4e3a-4a1d-9c8c-5817534e61e7'

async function definedClientRuleCreationTest(): Promise<string | null> {
    // Create a client instance with your API key
    // This is not required
    const client = new GGKClient(ADMIN_ID);

    try {
        // Create a new rule with both path and path_pattern examples
        const createResult = await client.createRule({
            ruleAPI: "some.example.com",
            userRules: [
                {
                    userID: USER_ID,
                    allowedEndpoints: [
                        {
                            path: '/test/path',
                            methods: 'GET,POST',
                            effect: 'ALLOWED'
                        },
                        {
                            methods: 'GET,PUT,DELETE',
                            path_pattern: '/api/v1/users/*',
                            effect: 'ALLOWED'
                        },
                        {
                            methods: 'GET',
                            path_pattern: '/api/v1/products/*',
                            effect: 'ALLOWED'
                        }
                    ]
                }
            ]
        });
        console.log('Created rule:', createResult);

        
        // Extract the rule ID; we are going to use it
        const ruleID = createResult.ruleId;

        // Get the created rule
        const getResult = await client.getRule(createResult.ruleId);
        console.log('Retrieved rule:', getResult);


        return ruleID

    } catch (error) {
        console.error('Error during simple rule creation demo:', error);
        return null
    }
}

async function undefinedClientRuleTest(ruleID: string) {
    /*
        A stranger (no apiKey or ID) can also check if a user is allowed on a path,
        provided they know the GUID for the rule.
    */
    const client = new GGKClient(null);
    console.log("Checking if client can access resource")
    try {
        const isAllowedResult = await client.isAllowed(ruleID, {
            userID: USER_ID,
            url: 'https://some.example.com/test/path',
            method: 'GET'
        });
        console.log('Access check result:', isAllowedResult);
    } catch (error) {
        console.error('Error during simple rule check demo:', error);
        return null
    }
}


async function definedClientRuleUpdateandCheckTest(ruleID: string) {
    
    // Create the admin client so they can updated their rule to be disabled
    const client = new GGKClient(ADMIN_ID);

    try {
        // Update the rule
        const updateResult = await client.updateRule(ruleID, {
            ruleEnabled: false
        });
        console.log('Updated rule:', updateResult);
    }  catch (error) {
        console.error('Error during rule disable:', error);
        return null
    }

    // Now check if it is allowed
    // We are expecting this to return a 401, so let's check it
    try {
        await client.isAllowed(ruleID, {
            userID: USER_ID,
            url: 'https://some.example.com/test/path',
            method: 'GET'
        });
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            console.log('Confirmed - user is unable to access this endpoint')
        }
    }
}



async function definedClientDeleteRuleTest(ruleID: string) {
    const client = new GGKClient(ADMIN_ID);
    try {
        const deleteResult = await client.deleteRule(ruleID);
        console.log('Deleted rule:', deleteResult);
    } catch (error) {
        console.error('Error during simple rule deletion demo:', error);
        return null
    }
}

async function wildcardRuleTest(): Promise<string | null> {
    // Create a client instance with your API key
    const client = new GGKClient(ADMIN_ID);

    try {
        // Create a new rule with wildcard user access using path_pattern
        const createResult = await client.createRule({
            ruleAPI: "api.example.com",
            userRules: [
                {
                    userID: "*", // Wildcard - any user can access
                    allowedEndpoints: [
                        {
                            methods: 'GET',
                            path_pattern: '/public/*',
                            effect: 'ALLOWED'
                        },
                        {
                            path: '/api/health',
                            methods: 'GET',
                            effect: 'ALLOWED'
                        }
                    ]
                }
            ]
        });
        console.log('Created wildcard rule:', createResult);

        const ruleID = createResult.ruleId;

        // Test with different users and paths - all should be allowed
        const testCases = [
            { userID: 'user1', url: 'https://api.example.com/public/data', method: 'GET' },
            { userID: 'user2', url: 'https://api.example.com/public/users', method: 'GET' },
            { userID: 'anonymous-user', url: 'https://api.example.com/api/health', method: 'GET' },
            { userID: 'any-user-id', url: 'https://api.example.com/public/anything', method: 'GET' }
        ];
        
        for (const testCase of testCases) {
            try {
                const isAllowedResult = await client.isAllowed(ruleID, testCase);
                console.log(`Access check for ${testCase.userID} on ${testCase.url}:`, isAllowedResult);
            } catch (error) {
                console.error(`Error checking access for ${testCase.userID}:`, error);
            }
        }

        return ruleID;

    } catch (error) {
        console.error('Error during wildcard rule demo:', error);
        return null;
    }
}

async function effectRuleTest(): Promise<string | null> {
    // Create a client instance with your API key
    const client = new GGKClient(ADMIN_ID);

    try {
        // Create a new rule demonstrating effect parameter functionality
        const createResult = await client.createRule({
            ruleAPI: "api.example.com",
            userRules: [
                {
                    userID: USER_ID,
                    allowedEndpoints: [
                        {
                            methods: 'GET,POST,PUT,DELETE',
                            path_pattern: '/api/v1/*',
                            effect: 'ALLOWED'
                        },
                        {
                            methods: 'GET,POST,PUT,DELETE',
                            path_pattern: '/api/v1/admin/*',
                            effect: 'DISALLOWED'
                        },
                        {
                            methods: 'GET,POST,PUT,DELETE',
                            path_pattern: '/api/v1/users/123',
                            effect: 'DISALLOWED'
                        }
                    ]
                },
                {
                    userID: 'admin-user',
                    allowedEndpoints: [
                        {
                            methods: 'GET,POST,PUT,DELETE',
                            path_pattern: '/api/v1/*',
                            effect: 'ALLOWED'
                        }
                    ]
                }
            ]
        });
        console.log('Created effect rule:', createResult);

        const ruleID = createResult.ruleId;

        // Test various effect scenarios
        const testCases = [
            // test-user-123 - Should be ALLOWED (matches ALLOWED pattern, doesn't match DISALLOWED patterns)
            { userID: USER_ID, url: 'https://api.example.com/api/v1/users/456', method: 'GET' },
            { userID: USER_ID, url: 'https://api.example.com/api/v1/products/789', method: 'POST' },
            { userID: USER_ID, url: 'https://api.example.com/api/v1/orders/123', method: 'PUT' },
            
            // test-user-123 - Should be DISALLOWED (matches DISALLOWED admin pattern)
            { userID: USER_ID, url: 'https://api.example.com/api/v1/admin/settings', method: 'GET' },
            { userID: USER_ID, url: 'https://api.example.com/api/v1/admin/users', method: 'POST' },
            
            // test-user-123 - Should be DISALLOWED (matches DISALLOWED specific user pattern)
            { userID: USER_ID, url: 'https://api.example.com/api/v1/users/123', method: 'GET' },
            { userID: USER_ID, url: 'https://api.example.com/api/v1/users/123', method: 'DELETE' },
            
            // admin-user - Should be ALLOWED (has full access to /api/v1/*)
            { userID: 'admin-user', url: 'https://api.example.com/api/v1/users/123', method: 'GET' },
            { userID: 'admin-user', url: 'https://api.example.com/api/v1/admin/settings', method: 'GET' },
            { userID: 'admin-user', url: 'https://api.example.com/api/v1/products/789', method: 'POST' }
        ];
        
        for (const testCase of testCases) {
            try {
                const isAllowedResult = await client.isAllowed(ruleID, testCase);
                console.log(`Access check for ${testCase.userID} on ${testCase.url} (${testCase.method}):`, isAllowedResult);
            } catch (error) {
                console.error(`Error checking access for ${testCase.userID} on ${testCase.url}:`, error);
            }
        }

        return ruleID;

    } catch (error) {
        console.error('Error during effect rule demo:', error);
        return null;
    }
}

async function singleDisallowedRuleTest(): Promise<string | null> {
    // Create a client instance with your API key
    const client = new GGKClient(ADMIN_ID);

    try {
        // Create a new rule with only a single DISALLOWED endpoint
        // This demonstrates that all other endpoints should be permitted by default
        const createResult = await client.createRule({
            ruleAPI: "api.example.com",
            userRules: [
                {
                    userID: USER_ID,
                    allowedEndpoints: [
                        {
                            methods: 'GET,POST,PUT,DELETE',
                            path_pattern: '/api/v1/admin/*',
                            effect: 'DISALLOWED'
                        }
                    ]
                }
            ]
        });
        console.log('Created single DISALLOWED rule:', createResult);

        const ruleID = createResult.ruleId;

        // Test various endpoints - all should be allowed except the disallowed one
        const testCases = [
            // Should be ALLOWED (no relevant rules, so default behavior)
            { userID: USER_ID, url: 'https://api.example.com/api/v1/users', method: 'GET' },
            { userID: USER_ID, url: 'https://api.example.com/api/v1/products', method: 'POST' },
            { userID: USER_ID, url: 'https://api.example.com/api/v1/orders', method: 'PUT' },
            { userID: USER_ID, url: 'https://api.example.com/api/v2/users', method: 'DELETE' },
            { userID: USER_ID, url: 'https://api.example.com/public/data', method: 'GET' },
            { userID: USER_ID, url: 'https://api.example.com/api/v1/users/123', method: 'GET' },
            { userID: USER_ID, url: 'https://api.example.com/api/v1/products/789', method: 'POST' },
            
            // Should be DISALLOWED (matches the DISALLOWED pattern)
            { userID: USER_ID, url: 'https://api.example.com/api/v1/admin/settings', method: 'GET' },
            { userID: USER_ID, url: 'https://api.example.com/api/v1/admin/users', method: 'POST' },
            { userID: USER_ID, url: 'https://api.example.com/api/v1/admin/dashboard', method: 'PUT' },
            { userID: USER_ID, url: 'https://api.example.com/api/v1/admin/logs', method: 'DELETE' }
        ];
        
        console.log('\nTesting single DISALLOWED rule - all endpoints should be allowed except admin ones:');
        for (const testCase of testCases) {
            console.log(`Checking test case: ${JSON.stringify(testCase)}`)
            try {
                const isAllowedResult = await client.isAllowed(ruleID, testCase);
                const isAllowed = isAllowedResult.message === 'Access allowed';
                const status = isAllowed ? '✅ ALLOWED' : '❌ DENIED';
                console.log(`${status} - ${testCase.method} ${testCase.url}`);
            } catch (error) {
                console.error(`❌ ERROR - ${testCase.method} ${testCase.url}:`, error);
            }
        }

        return ruleID;

    } catch (error) {
        console.error('Error during single DISALLOWED rule demo:', error);
        return null;
    }
}

async function adminUserManagementDemo() {
    const adminClient = new GGKClient(ADMIN_ID);
    try {
        // Fetch all users
        const allUsers = await adminClient.getAllUsers();
        console.log('All users:', allUsers);
        if (!allUsers.users || allUsers.users.length === 0) {
            console.log('No users found to demonstrate further admin actions.');
            return;
        }
        // Pick the first user for demonstration
        const demoUser = allUsers.users[0];
        const demoApiKey = demoUser.apiKey;
        // Fetch a specific user
        const userDetails = await adminClient.getUserByApiKey(demoApiKey);
        console.log(`User details for apiKey ${demoApiKey}:`, userDetails);
        // Update the user (e.g., increase the max number of rules to 100)
        const updatedUser = await adminClient.updateUserByApiKey(demoApiKey, { maxRules:100 });
        console.log(`Updated user for apiKey ${demoApiKey}:`, updatedUser);
        // Delete the user
        const deleteResult = await adminClient.deleteUserByApiKey(demoApiKey);
        console.log(`Deleted user for apiKey ${demoApiKey}:`, deleteResult);
    } catch (error) {
        console.error('Error during admin user management demo:', error);
    }
}

async function main() {

    // Create a simple rule
    const ruleID = await definedClientRuleCreationTest()
    if (ruleID) {
        console.log(`Produced rule ID = ${ruleID}`)

        // Check if we can use it through random client
        await undefinedClientRuleTest(ruleID)

        // Now, disable it (as admin), and then check if we can use it
        await definedClientRuleUpdateandCheckTest(ruleID)

        // Delete it
        await definedClientDeleteRuleTest(ruleID)
    }

    // Test wildcard rule functionality
    console.log('\n=== Testing Wildcard Rule ===');
    const wildcardRuleID = await wildcardRuleTest();
    if (wildcardRuleID) {
        console.log(`Produced wildcard rule ID = ${wildcardRuleID}`);
        
        // Clean up the wildcard rule
        await definedClientDeleteRuleTest(wildcardRuleID);
    }

    // Test effect parameter functionality
    console.log('\n=== Testing Effect Parameter Rule ===');
    const effectRuleID = await effectRuleTest();
    if (effectRuleID) {
        console.log(`Produced effect rule ID = ${effectRuleID}`);
        
        // Clean up the effect rule
        await definedClientDeleteRuleTest(effectRuleID);
    }

    // Test single DISALLOWED rule functionality
    console.log('\n=== Testing Single DISALLOWED Rule ===');
    const singleDisallowedRuleID = await singleDisallowedRuleTest();
    if (singleDisallowedRuleID) {
        console.log(`Produced single DISALLOWED rule ID = ${singleDisallowedRuleID}`);
        
        // Clean up the single DISALLOWED rule
        await definedClientDeleteRuleTest(singleDisallowedRuleID);
    }

    // Admin user management demo
    console.log('\n=== Admin User Management Demo ===');
    await adminUserManagementDemo();
}

// Run the demonstration workflow
main() 