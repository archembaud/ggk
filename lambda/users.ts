import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';

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