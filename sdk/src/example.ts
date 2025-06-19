import { GGKClient } from './index';
import dotenv from 'dotenv';
import axios from 'axios';

// Load environment variables
dotenv.config();

const ADMIN_ID = '92d077c1-31ed-49be-a1ce-dae6c2b07e19'
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
            path: '/test/path',
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
            path: '/test/path',
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
            path: '/test/path',
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

}

// Run the demonstration workflow
main() 