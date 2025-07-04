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
        // Create a new rule
        const createResult = await client.createRule({
            ruleAPI: "some.example.com",
            userRules: [
                {
                    userID: USER_ID,
                    allowedEndpoints: [
                        {
                            path: '/test/path',
                            methods: 'GET,POST'
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

        /*
        // Update the rule
        const updateResult = await client.updateRule(createResult.ruleId, {
            ruleAPI: 'test-api-updated',
            ruleEnabled: false
        });
        console.log('Updated rule:', updateResult);
        */

        /*
        // Check if access is allowed
        const isAllowedResult = await client.isAllowed(createResult.ruleId, {
            userID: 'test-user-123',
            url: 'https://some.example.com/test/path',
            method: 'GET'
        });
        console.log('Access check result:', isAllowedResult);

        // Get all rules
        const allRules = await client.getRules();
        console.log('All rules:', allRules);

        // Delete the rule
        const deleteResult = await client.deleteRule(createResult.ruleId);
        console.log('Deleted rule:', deleteResult);
        */

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
        // Create a new rule with wildcard user access
        const createResult = await client.createRule({
            ruleAPI: "api.example.com",
            userRules: [
                {
                    userID: "*", // Wildcard - any user can access
                    allowedEndpoints: [
                        {
                            path: '/public/data',
                            methods: 'GET'
                        }
                    ]
                }
            ]
        });
        console.log('Created wildcard rule:', createResult);

        const ruleID = createResult.ruleId;

        // Test with different users - all should be allowed
        const testUsers = ['user1', 'user2', 'anonymous-user', 'any-user-id'];
        
        for (const testUser of testUsers) {
            try {
                const isAllowedResult = await client.isAllowed(ruleID, {
                    userID: testUser,
                    url: 'https://api.example.com/public/data',
                    method: 'GET'
                });
                console.log(`Access check for ${testUser}:`, isAllowedResult);
            } catch (error) {
                console.error(`Error checking access for ${testUser}:`, error);
            }
        }

        return ruleID;

    } catch (error) {
        console.error('Error during wildcard rule demo:', error);
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

    // Admin user management demo
    console.log('\n=== Admin User Management Demo ===');
    await adminUserManagementDemo();
}

// Run the demonstration workflow
main() 