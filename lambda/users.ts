import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const API_KEYS_TABLE = process.env.API_KEYS_TABLE_NAME || '';

export const getUserHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        // Get API key from Authorization header
        const apiKey = event.headers.Authorization;
        if (!apiKey) {
            return {
                statusCode: 401,
                body: JSON.stringify({ message: 'Authorization header is required' })
            };
        }

        // Query the user record from the API keys table
        const userQueryResult = await docClient.send(new QueryCommand({
            TableName: API_KEYS_TABLE,
            KeyConditionExpression: 'apiKey = :apiKey',
            ExpressionAttributeValues: {
                ':apiKey': apiKey
            }
        }));

        if (!userQueryResult.Items || userQueryResult.Items.length === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'User not found' })
            };
        }

        // Get the user record
        const userRecord = userQueryResult.Items[0];

        // Return user details excluding sensitive fields
        const userDetails = {
            apiKey: userRecord.apiKey,
            email: userRecord.email,
            apiKeyEnabled: userRecord.apiKeyEnabled,
            maxMonthlyRuleChecks: userRecord.maxMonthlyRuleChecks,
            maxRules: userRecord.maxRules,
            currentMonthlyRuleChecks: userRecord.currentMonthlyRuleChecks,
            currentRules: userRecord.currentRules,
            accountType: userRecord.accountType,
            firstName: userRecord.firstName,
            lastName: userRecord.lastName
        };

        return {
            statusCode: 200,
            body: JSON.stringify({
                user: userDetails
            })
        };

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' })
        };
    }
};

export const getAllUsersHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        // Get API key from Authorization header
        const apiKey = event.headers.Authorization;
        const ADMIN_KEY = process.env.ADMIN_KEY || '';
        if (!apiKey) {
            return {
                statusCode: 401,
                body: JSON.stringify({ message: 'Authorization header is required' })
            };
        }
        if (apiKey !== ADMIN_KEY) {
            return {
                statusCode: 403,
                body: JSON.stringify({ message: 'Forbidden: Admin access required' })
            };
        }
        // Scan the API keys table for all users
        const scanResult = await docClient.send(new ScanCommand({
            TableName: API_KEYS_TABLE
        }));
        return {
            statusCode: 200,
            body: JSON.stringify({ users: scanResult.Items || [] })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' })
        };
    }
};

export const getUserByApiKeyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        // Get API key from Authorization header
        const authHeader = event.headers.Authorization;
        const ADMIN_KEY = process.env.ADMIN_KEY || '';
        if (!authHeader) {
            return {
                statusCode: 401,
                body: JSON.stringify({ message: 'Authorization header is required' })
            };
        }
        if (authHeader !== ADMIN_KEY) {
            return {
                statusCode: 403,
                body: JSON.stringify({ message: 'Forbidden: Admin access required' })
            };
        }
        // Get apiKey from path parameters
        const apiKey = event.pathParameters?.apiKey;
        if (!apiKey) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'apiKey path parameter is required' })
            };
        }
        // Query the user record from the API keys table
        const userQueryResult = await docClient.send(new QueryCommand({
            TableName: API_KEYS_TABLE,
            KeyConditionExpression: 'apiKey = :apiKey',
            ExpressionAttributeValues: {
                ':apiKey': apiKey
            }
        }));
        if (!userQueryResult.Items || userQueryResult.Items.length === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'User not found' })
            };
        }
        // Get the user record
        const userRecord = userQueryResult.Items[0];
        // Return all user details for admin
        return {
            statusCode: 200,
            body: JSON.stringify({ user: userRecord })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' })
        };
    }
};

export const putUserByApiKeyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        // Get API key from Authorization header
        const authHeader = event.headers.Authorization;
        const ADMIN_KEY = process.env.ADMIN_KEY || '';
        if (!authHeader) {
            return {
                statusCode: 401,
                body: JSON.stringify({ message: 'Authorization header is required' })
            };
        }
        if (authHeader !== ADMIN_KEY) {
            return {
                statusCode: 403,
                body: JSON.stringify({ message: 'Forbidden: Admin access required' })
            };
        }
        // Get apiKey from path parameters
        const apiKey = event.pathParameters?.apiKey;
        if (!apiKey) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'apiKey path parameter is required' })
            };
        }
        // Parse request body
        const body = event.body ? JSON.parse(event.body) : {};
        if (Object.keys(body).length === 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Request body must include at least one field to update' })
            };
        }
        // Build update expression
        const updateExpressions: string[] = [];
        const expressionAttributeValues: Record<string, any> = {
            ':dateModified': Date.now()
        };
        for (const [key, value] of Object.entries(body)) {
            updateExpressions.push(`${key} = :${key}`);
            expressionAttributeValues[`:${key}`] = value;
        }
        updateExpressions.push('dateModified = :dateModified');
        // Query for the user to get the email (needed for the key)
        const userQueryResult = await docClient.send(new QueryCommand({
            TableName: API_KEYS_TABLE,
            KeyConditionExpression: 'apiKey = :apiKey',
            ExpressionAttributeValues: {
                ':apiKey': apiKey
            }
        }));
        if (!userQueryResult.Items || userQueryResult.Items.length === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'User not found' })
            };
        }
        const userRecord = userQueryResult.Items[0];
        // Update the user record
        await docClient.send(new UpdateCommand({
            TableName: API_KEYS_TABLE,
            Key: {
                apiKey: userRecord.apiKey,
                email: userRecord.email
            },
            UpdateExpression: `SET ${updateExpressions.join(', ')}`,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: 'ALL_NEW'
        }));
        // Query again to get the updated record
        const updatedUserQuery = await docClient.send(new QueryCommand({
            TableName: API_KEYS_TABLE,
            KeyConditionExpression: 'apiKey = :apiKey',
            ExpressionAttributeValues: {
                ':apiKey': apiKey
            }
        }));
        const updatedUser = updatedUserQuery.Items ? updatedUserQuery.Items[0] : null;
        return {
            statusCode: 200,
            body: JSON.stringify({ user: updatedUser })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' })
        };
    }
}; 