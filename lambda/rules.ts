import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const RULES_TABLE = process.env.RULES_TABLE_NAME || '';

export const postHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        // Check if it's a POST request
        if (event.httpMethod !== 'POST') {
            return {
                statusCode: 405,
                body: JSON.stringify({ message: 'Method not allowed' })
            };
        }

        // Get API key from Authorization header
        const apiKey = event.headers.Authorization;
        if (!apiKey) {
            return {
                statusCode: 401,
                body: JSON.stringify({ message: 'Authorization header is required' })
            };
        }

        // Parse request body
        const body = JSON.parse(event.body || '{}');
        if (!body.ruleAPI || !body.userRules) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'ruleAPI and userRules are required' })
            };
        }

        // Generate rule ID using Node's UUID generator
        const ruleId = randomUUID();
        const timestamp = Date.now();

        // Prepare item for DynamoDB
        const item = {
            apiKey,
            ruleId,
            ruleAPI: body.ruleAPI,
            userRules: JSON.stringify(body.userRules),
            ruleEnabled: true,
            dateCreated: timestamp,
            dateModified: timestamp
        };

        // Save to DynamoDB
        await docClient.send(new PutCommand({
            TableName: RULES_TABLE,
            Item: item
        }));

        return {
            statusCode: 201,
            body: JSON.stringify({
                message: 'Rule created successfully',
                ruleId
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

export const getHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        // Check if it's a GET request
        if (event.httpMethod !== 'GET') {
            return {
                statusCode: 405,
                body: JSON.stringify({ message: 'Method not allowed' })
            };
        }

        // Get API key from Authorization header
        const apiKey = event.headers.Authorization;
        if (!apiKey) {
            return {
                statusCode: 401,
                body: JSON.stringify({ message: 'Authorization header is required' })
            };
        }

        // Query DynamoDB for rules matching the API key
        const result = await docClient.send(new QueryCommand({
            TableName: RULES_TABLE,
            KeyConditionExpression: 'apiKey = :apiKey',
            ExpressionAttributeValues: {
                ':apiKey': apiKey
            }
        }));

        // Transform the items to include parsed userRules and remove apiKey
        const rules = result.Items?.map(item => {
            const { apiKey, ...ruleWithoutApiKey } = item;
            return {
                ...ruleWithoutApiKey,
                userRules: JSON.parse(item.userRules)
            };
        }) || [];

        return {
            statusCode: 200,
            body: JSON.stringify({
                rules
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