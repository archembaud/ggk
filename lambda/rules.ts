import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand, UpdateCommand, GetCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const RULES_TABLE = process.env.RULES_TABLE_NAME || '';

export const postHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {

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

export const putHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {

        // Get API key from Authorization header
        const apiKey = event.headers.Authorization;
        if (!apiKey) {
            return {
                statusCode: 401,
                body: JSON.stringify({ message: 'Authorization header is required' })
            };
        }

        // Get ruleId from path parameters
        const ruleId = event.pathParameters?.ruleId;
        if (!ruleId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'ruleId is required in path' })
            };
        }

        // Parse request body
        const body = JSON.parse(event.body || '{}');
        if (!body.ruleAPI && !body.userRules && body.ruleEnabled === undefined) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'At least one of ruleAPI, userRules, or ruleEnabled must be provided' })
            };
        }

        // First, get the existing rule to verify ownership
        const existingRule = await docClient.send(new GetCommand({
            TableName: RULES_TABLE,
            Key: {
                apiKey,
                ruleId
            }
        }));

        if (!existingRule.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Rule not found or you do not have permission to update it' })
            };
        }

        // Prepare update expression and attribute values
        const updateExpressions: string[] = [];
        const expressionAttributeValues: Record<string, any> = {
            ':dateModified': Date.now()
        };

        if (body.ruleAPI) {
            updateExpressions.push('ruleAPI = :ruleAPI');
            expressionAttributeValues[':ruleAPI'] = body.ruleAPI;
        }

        if (body.userRules) {
            updateExpressions.push('userRules = :userRules');
            expressionAttributeValues[':userRules'] = JSON.stringify(body.userRules);
        }

        if (body.ruleEnabled !== undefined) {
            updateExpressions.push('ruleEnabled = :ruleEnabled');
            expressionAttributeValues[':ruleEnabled'] = body.ruleEnabled;
        }

        // Add dateModified to update expressions
        updateExpressions.push('dateModified = :dateModified');

        // Update the rule
        await docClient.send(new UpdateCommand({
            TableName: RULES_TABLE,
            Key: {
                apiKey,
                ruleId
            },
            UpdateExpression: `SET ${updateExpressions.join(', ')}`,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: 'ALL_NEW'
        }));

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Rule updated successfully',
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

export const deleteHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        // Get API key from Authorization header
        const apiKey = event.headers.Authorization;
        if (!apiKey) {
            return {
                statusCode: 401,
                body: JSON.stringify({ message: 'Authorization header is required' })
            };
        }

        // Get ruleId from path parameters
        const ruleId = event.pathParameters?.ruleId;
        if (!ruleId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'ruleId is required in path' })
            };
        }

        // First, get the existing rule to verify ownership
        const existingRule = await docClient.send(new GetCommand({
            TableName: RULES_TABLE,
            Key: {
                apiKey,
                ruleId
            }
        }));

        if (!existingRule.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Rule not found or you do not have permission to delete it' })
            };
        }

        // Delete the rule
        await docClient.send(new DeleteCommand({
            TableName: RULES_TABLE,
            Key: {
                apiKey,
                ruleId
            }
        }));

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Rule deleted successfully',
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