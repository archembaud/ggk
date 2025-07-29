import { GGKClient } from './index';
import dotenv from 'dotenv';
import axios from 'axios';

// Load environment variables
dotenv.config();

const ADMIN_ID = process.env.GGK_ADMIN || null;

if (!ADMIN_ID) {
    console.error('ADMIN_ID is not set');
    process.exit(1);
}

const USER_ID = 'test-user-123';

async function basicQueryPatternTest(): Promise<string | null> {
    console.log('\n=== Basic Query Pattern Test ===');
    
    const client = new GGKClient(ADMIN_ID);

    try {
        // Create a rule with basic query pattern functionality
        const createResult = await client.createRule({
            ruleAPI: "api.example.com",
            userRules: [
                {
                    userID: USER_ID,
                    pathRules: [
                        {
                            path: '/api/users',
                            methods: 'GET',
                            effect: 'ALLOWED',
                            query_pattern: '\\?role=admin'
                        },
                        {
                            path: '/api/users',
                            methods: 'GET',
                            effect: 'DISALLOWED',
                            query_pattern: '\\?role=superuser'
                        },
                        {
                            path: '/api/data',
                            methods: 'POST',
                            effect: 'ALLOWED',
                            query_pattern: '\\?type=public'
                        }
                    ]
                }
            ]
        });
        console.log('Created rule with basic query patterns:', createResult);

        const ruleID = createResult.ruleId;

        // Test various query pattern scenarios
        const testCases = [
            // Test 1: ALLOWED rule with matching query pattern
            { 
                userID: USER_ID, 
                url: 'https://api.example.com/api/users?role=admin', 
                method: 'GET',
                expected: 'ALLOWED',
                description: 'ALLOWED rule with matching query pattern (?role=admin)'
            },
            // Test 2: ALLOWED rule with non-matching query pattern
            { 
                userID: USER_ID, 
                url: 'https://api.example.com/api/users?role=user', 
                method: 'GET',
                expected: 'DENIED',
                description: 'ALLOWED rule with non-matching query pattern (?role=user)'
            },
            // Test 3: DISALLOWED rule with matching query pattern
            { 
                userID: USER_ID, 
                url: 'https://api.example.com/api/users?role=superuser', 
                method: 'GET',
                expected: 'DENIED',
                description: 'DISALLOWED rule with matching query pattern (?role=superuser)'
            },
            // Test 4: DISALLOWED rule with non-matching query pattern
            { 
                userID: USER_ID, 
                url: 'https://api.example.com/api/users?role=admin', 
                method: 'GET',
                expected: 'ALLOWED',
                description: 'DISALLOWED rule with non-matching query pattern (?role=admin)'
            },
            // Test 5: Rule without query pattern (should work as before)
            { 
                userID: USER_ID, 
                url: 'https://api.example.com/api/data?type=public', 
                method: 'POST',
                expected: 'ALLOWED',
                description: 'Rule without query pattern'
            },
            // Test 6: Multiple query parameters
            { 
                userID: USER_ID, 
                url: 'https://api.example.com/api/users?role=admin&status=active', 
                method: 'GET',
                expected: 'ALLOWED',
                description: 'Multiple query parameters (?role=admin&status=active)'
            }
        ];

        console.log('\nTesting basic query pattern functionality:');
        for (const testCase of testCases) {
            try {
                const isAllowedResult = await client.isAllowed(ruleID, {
                    userID: testCase.userID,
                    url: testCase.url,
                    method: testCase.method
                });
                
                const isAllowed = isAllowedResult.message === 'Access allowed';
                const actual = isAllowed ? 'ALLOWED' : 'DENIED';
                const status = actual === testCase.expected ? '✅ PASS' : '❌ FAIL';
                
                console.log(`${status} - ${testCase.description}`);
                console.log(`  URL: ${testCase.url}`);
                console.log(`  Expected: ${testCase.expected}, Actual: ${actual}`);
                console.log('');
            } catch (error) {
                console.error(`❌ ERROR - ${testCase.description}:`, error);
                console.log('');
            }
        }

        return ruleID;

    } catch (error) {
        console.error('Error during basic query pattern test:', error);
        return null;
    }
}

async function complexQueryPatternTest(): Promise<string | null> {
    console.log('\n=== Complex Query Pattern Test ===');
    
    const client = new GGKClient(ADMIN_ID);

    try {
        // Create a rule with complex query pattern functionality
        const createResult = await client.createRule({
            ruleAPI: "api.example.com",
            userRules: [
                {
                    userID: USER_ID,
                    pathRules: [
                        {
                            path: '/api/users',
                            methods: 'GET',
                            effect: 'ALLOWED',
                            query_pattern: '\\?id=\\d+'
                        },
                        {
                            path: '/api/users',
                            methods: 'GET',
                            effect: 'DISALLOWED',
                            query_pattern: '\\?id=[a-zA-Z]+'
                        },
                        {
                            path: '/api/users',
                            methods: 'GET',
                            effect: 'ALLOWED',
                            query_pattern: '\\?role=(admin|user)&status=(active|inactive)'
                        },
                        {
                            path: '/api/data',
                            methods: 'POST',
                            effect: 'ALLOWED',
                            query_pattern: '\\?type=(public|private)&limit=\\d{1,3}'
                        },
                        {
                            path: '/api/search',
                            methods: 'GET',
                            effect: 'DISALLOWED',
                            query_pattern: '\\?query=.*password.*'
                        }
                    ]
                }
            ]
        });
        console.log('Created rule with complex query patterns:', createResult);

        const ruleID = createResult.ruleId;

        // Test complex query pattern scenarios
        const testCases = [
            // Numeric ID validation
            { 
                userID: USER_ID, 
                url: 'https://api.example.com/api/users?id=123', 
                method: 'GET',
                expected: 'ALLOWED',
                description: 'Numeric ID validation (?id=123)'
            },
            { 
                userID: USER_ID, 
                url: 'https://api.example.com/api/users?id=abc', 
                method: 'GET',
                expected: 'DENIED',
                description: 'Alphabetic ID validation (?id=abc)'
            },
            // Multiple parameter validation
            { 
                userID: USER_ID, 
                url: 'https://api.example.com/api/users?role=admin&status=active', 
                method: 'GET',
                expected: 'ALLOWED',
                description: 'Valid role and status combination (?role=admin&status=active)'
            },
            { 
                userID: USER_ID, 
                url: 'https://api.example.com/api/users?role=moderator&status=pending', 
                method: 'GET',
                expected: 'DENIED',
                description: 'Invalid role and status combination (?role=moderator&status=pending)'
            },
            // Limit validation
            { 
                userID: USER_ID, 
                url: 'https://api.example.com/api/data?type=public&limit=100', 
                method: 'POST',
                expected: 'ALLOWED',
                description: 'Valid data type and limit (?type=public&limit=100)'
            },
            { 
                userID: USER_ID, 
                url: 'https://api.example.com/api/data?type=public&limit=1000', 
                method: 'POST',
                expected: 'DENIED',
                description: 'Invalid limit (too many digits) (?type=public&limit=1000)'
            },
            // Security pattern
            { 
                userID: USER_ID, 
                url: 'https://api.example.com/api/search?query=user+password+reset', 
                method: 'GET',
                expected: 'DENIED',
                description: 'Search query with password (?query=user+password+reset)'
            },
            { 
                userID: USER_ID, 
                url: 'https://api.example.com/api/search?query=user+profile', 
                method: 'GET',
                expected: 'ALLOWED',
                description: 'Search query without password (?query=user+profile)'
            },
            // URL with no query parameters
            { 
                userID: USER_ID, 
                url: 'https://api.example.com/api/users', 
                method: 'GET',
                expected: 'ALLOWED',
                description: 'URL with no query parameters'
            }
        ];

        console.log('\nTesting complex query pattern functionality:');
        for (const testCase of testCases) {
            try {
                const isAllowedResult = await client.isAllowed(ruleID, {
                    userID: testCase.userID,
                    url: testCase.url,
                    method: testCase.method
                });
                
                const isAllowed = isAllowedResult.message === 'Access allowed';
                const actual = isAllowed ? 'ALLOWED' : 'DENIED';
                const status = actual === testCase.expected ? '✅ PASS' : '❌ FAIL';
                
                console.log(`${status} - ${testCase.description}`);
                console.log(`  URL: ${testCase.url}`);
                console.log(`  Expected: ${testCase.expected}, Actual: ${actual}`);
                console.log('');
            } catch (error) {
                console.error(`❌ ERROR - ${testCase.description}:`, error);
                console.log('');
            }
        }

        return ruleID;

    } catch (error) {
        console.error('Error during complex query pattern test:', error);
        return null;
    }
}

async function emptyQueryPatternTest(): Promise<string | null> {
    console.log('\n=== Empty Query Pattern Test ===');
    
    const client = new GGKClient(ADMIN_ID);

    try {
        // Create a rule with empty query patterns to test default behavior
        const createResult = await client.createRule({
            ruleAPI: "api.example.com",
            userRules: [
                {
                    userID: USER_ID,
                    pathRules: [
                        {
                            path: '/api/users',
                            methods: 'GET',
                            effect: 'ALLOWED',
                            query_pattern: ''
                        },
                        {
                            path: '/api/data',
                            methods: 'POST',
                            effect: 'DISALLOWED',
                            query_pattern: ''
                        }
                    ]
                }
            ]
        });
        console.log('Created rule with empty query patterns:', createResult);

        const ruleID = createResult.ruleId;

        // Test that empty query patterns behave like rules without query patterns
        const testCases = [
            { 
                userID: USER_ID, 
                url: 'https://api.example.com/api/users?role=admin', 
                method: 'GET',
                expected: 'ALLOWED',
                description: 'ALLOWED rule with empty query pattern and any parameters'
            },
            { 
                userID: USER_ID, 
                url: 'https://api.example.com/api/users', 
                method: 'GET',
                expected: 'ALLOWED',
                description: 'ALLOWED rule with empty query pattern and no parameters'
            },
            { 
                userID: USER_ID, 
                url: 'https://api.example.com/api/data?type=public', 
                method: 'POST',
                expected: 'DENIED',
                description: 'DISALLOWED rule with empty query pattern'
            }
        ];

        console.log('\nTesting empty query pattern functionality:');
        for (const testCase of testCases) {
            try {
                const isAllowedResult = await client.isAllowed(ruleID, {
                    userID: testCase.userID,
                    url: testCase.url,
                    method: testCase.method
                });
                
                const isAllowed = isAllowedResult.message === 'Access allowed';
                const actual = isAllowed ? 'ALLOWED' : 'DENIED';
                const status = actual === testCase.expected ? '✅ PASS' : '❌ FAIL';
                
                console.log(`${status} - ${testCase.description}`);
                console.log(`  URL: ${testCase.url}`);
                console.log(`  Expected: ${testCase.expected}, Actual: ${actual}`);
                console.log('');
            } catch (error) {
                console.error(`❌ ERROR - ${testCase.description}:`, error);
                console.log('');
            }
        }

        return ruleID;

    } catch (error) {
        console.error('Error during empty query pattern test:', error);
        return null;
    }
}

async function wildcardUserQueryPatternTest(): Promise<string | null> {
    console.log('\n=== Wildcard User Query Pattern Test ===');
    
    const client = new GGKClient(ADMIN_ID);

    try {
        // Create a rule with wildcard user and query patterns
        const createResult = await client.createRule({
            ruleAPI: "api.example.com",
            userRules: [
                {
                    userID: "*", // Wildcard - any user can access
                    pathRules: [
                        {
                            path: '/api/public',
                            methods: 'GET',
                            effect: 'ALLOWED',
                            query_pattern: '\\?type=public'
                        },
                        {
                            path: '/api/public',
                            methods: 'GET',
                            effect: 'DISALLOWED',
                            query_pattern: '\\?type=private'
                        }
                    ]
                }
            ]
        });
        console.log('Created wildcard user rule with query patterns:', createResult);

        const ruleID = createResult.ruleId;

        // Test wildcard user with query patterns
        const testCases = [
            { 
                userID: 'user1', 
                url: 'https://api.example.com/api/public?type=public', 
                method: 'GET',
                expected: 'ALLOWED',
                description: 'Wildcard user with ALLOWED query pattern'
            },
            { 
                userID: 'user2', 
                url: 'https://api.example.com/api/public?type=private', 
                method: 'GET',
                expected: 'DENIED',
                description: 'Wildcard user with DISALLOWED query pattern'
            },
            { 
                userID: 'anonymous-user', 
                url: 'https://api.example.com/api/public?type=public', 
                method: 'GET',
                expected: 'ALLOWED',
                description: 'Different wildcard user with ALLOWED query pattern'
            }
        ];

        console.log('\nTesting wildcard user with query patterns:');
        for (const testCase of testCases) {
            try {
                const isAllowedResult = await client.isAllowed(ruleID, {
                    userID: testCase.userID,
                    url: testCase.url,
                    method: testCase.method
                });
                
                const isAllowed = isAllowedResult.message === 'Access allowed';
                const actual = isAllowed ? 'ALLOWED' : 'DENIED';
                const status = actual === testCase.expected ? '✅ PASS' : '❌ FAIL';
                
                console.log(`${status} - ${testCase.description}`);
                console.log(`  User: ${testCase.userID}, URL: ${testCase.url}`);
                console.log(`  Expected: ${testCase.expected}, Actual: ${actual}`);
                console.log('');
            } catch (error) {
                console.error(`❌ ERROR - ${testCase.description}:`, error);
                console.log('');
            }
        }

        return ruleID;

    } catch (error) {
        console.error('Error during wildcard user query pattern test:', error);
        return null;
    }
}

async function main() {
    console.log('=== Query Pattern SDK Example ===');
    console.log('This example demonstrates the new query_pattern functionality using the GGK SDK.\n');

    // Test basic query pattern functionality
    const basicRuleID = await basicQueryPatternTest();
    if (basicRuleID) {
        console.log(`Basic query pattern test completed. Rule ID: ${basicRuleID}`);
        
        // Clean up
        const client = new GGKClient(ADMIN_ID);
        try {
            await client.deleteRule(basicRuleID);
            console.log('Cleaned up basic query pattern rule.\n');
        } catch (error) {
            console.error('Error cleaning up basic query pattern rule:', error);
        }
    }

    // Test complex query pattern functionality
    const complexRuleID = await complexQueryPatternTest();
    if (complexRuleID) {
        console.log(`Complex query pattern test completed. Rule ID: ${complexRuleID}`);
        
        // Clean up
        const client = new GGKClient(ADMIN_ID);
        try {
            await client.deleteRule(complexRuleID);
            console.log('Cleaned up complex query pattern rule.\n');
        } catch (error) {
            console.error('Error cleaning up complex query pattern rule:', error);
        }
    }

    // Test empty query pattern functionality
    const emptyRuleID = await emptyQueryPatternTest();
    if (emptyRuleID) {
        console.log(`Empty query pattern test completed. Rule ID: ${emptyRuleID}`);
        
        // Clean up
        const client = new GGKClient(ADMIN_ID);
        try {
            await client.deleteRule(emptyRuleID);
            console.log('Cleaned up empty query pattern rule.\n');
        } catch (error) {
            console.error('Error cleaning up empty query pattern rule:', error);
        }
    }

    // Test wildcard user with query patterns
    const wildcardRuleID = await wildcardUserQueryPatternTest();
    if (wildcardRuleID) {
        console.log(`Wildcard user query pattern test completed. Rule ID: ${wildcardRuleID}`);
        
        // Clean up
        const client = new GGKClient(ADMIN_ID);
        try {
            await client.deleteRule(wildcardRuleID);
            console.log('Cleaned up wildcard user query pattern rule.\n');
        } catch (error) {
            console.error('Error cleaning up wildcard user query pattern rule:', error);
        }
    }

    console.log('=== Query Pattern SDK Example Completed ===');
    console.log('All tests completed and rules cleaned up successfully.');
}

// Run the demonstration workflow
main().catch(console.error); 