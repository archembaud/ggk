import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface GgkStackProps extends cdk.StackProps {
  stackName?: string;
}

export class GgkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: GgkStackProps) {
    super(scope, id, props);

    // Get stack name for resource naming, default to 'test'
    const resourcePrefix = (props?.stackName || 'test').toLowerCase();

    // Generate a random GUID for the admin key
    const adminKey = uuidv4();

    // Create Parameter Store parameter
    const adminKeyParameter = new ssm.StringParameter(this, 'AdminKeyParameter', {
      parameterName: `${resourcePrefix}-ggk-admin-key`,
      stringValue: adminKey,
      description: 'Admin API key for Guid Gate Keeper',
      tier: ssm.ParameterTier.STANDARD,
    });

    // Create DynamoDB Tables
    const rulesTable = new dynamodb.Table(this, 'RulesRecords', {
      tableName: `${resourcePrefix}-ggk-rules-table`,
      partitionKey: { name: 'apiKey', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'ruleId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      pointInTimeRecovery: true,
    });

    // Add GSI for rules table
    rulesTable.addGlobalSecondaryIndex({
      indexName: 'ruleIdIndex',
      partitionKey: { name: 'ruleId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'dateCreated', type: dynamodb.AttributeType.NUMBER },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    const apiKeyTable = new dynamodb.Table(this, 'APIKeyRecords', {
      tableName: `${resourcePrefix}-ggk-api-keys-table`,
      partitionKey: { name: 'apiKey', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'email', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      pointInTimeRecovery: true,
    });

    // Create Lambda functions
    const helloWorldFunction = new lambda.Function(this, 'HelloWorldFunction', {
      functionName: `${resourcePrefix}-ggk-hello-world`,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'hello-world.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
    });

    const rulesPostFunction = new lambda.Function(this, 'RulesPostFunction', {
      functionName: `${resourcePrefix}-ggk-rules-post`,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'rules.postHandler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
      environment: {
        RULES_TABLE_NAME: rulesTable.tableName,
        API_KEYS_TABLE_NAME: apiKeyTable.tableName,
        ADMIN_KEY: adminKey,
      },
    });

    const rulesGetFunction = new lambda.Function(this, 'RulesGetFunction', {
      functionName: `${resourcePrefix}-ggk-rules-get`,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'rules.getHandler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
      environment: {
        RULES_TABLE_NAME: rulesTable.tableName,
        ADMIN_KEY: adminKey,
      },
    });

    const rulesPutFunction = new lambda.Function(this, 'RulesPutFunction', {
      functionName: `${resourcePrefix}-ggk-rules-put`,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'rules.putHandler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
      environment: {
        RULES_TABLE_NAME: rulesTable.tableName,
        ADMIN_KEY: adminKey,
      },
    });

    const rulesDeleteFunction = new lambda.Function(this, 'RulesDeleteFunction', {
      functionName: `${resourcePrefix}-ggk-rules-delete`,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'rules.deleteHandler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
      environment: {
        RULES_TABLE_NAME: rulesTable.tableName,
        API_KEYS_TABLE_NAME: apiKeyTable.tableName,
        ADMIN_KEY: adminKey,
      },
    });

    const rulesIsAllowedFunction = new lambda.Function(this, 'RulesIsAllowedFunction', {
      functionName: `${resourcePrefix}-ggk-rules-is-allowed`,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'rules.isAllowedHandler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
      environment: {
        RULES_TABLE_NAME: rulesTable.tableName,
      },
    });

    const getUserFunction = new lambda.Function(this, 'GetUserFunction', {
      functionName: `${resourcePrefix}-ggk-get-user`,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'users.getUserHandler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
      environment: {
        API_KEYS_TABLE_NAME: apiKeyTable.tableName,
        ADMIN_KEY: adminKey,
      },
    });

    const getUserByApiKeyFunction = new lambda.Function(this, 'GetUserByApiKeyFunction', {
      functionName: `${resourcePrefix}-ggk-get-user-by-apikey`,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'users.getUserByApiKeyHandler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
      environment: {
        API_KEYS_TABLE_NAME: apiKeyTable.tableName,
        ADMIN_KEY: adminKey,
      },
    });

    const getAllUsersFunction = new lambda.Function(this, 'GetAllUsersFunction', {
      functionName: `${resourcePrefix}-ggk-get-all-users`,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'users.getAllUsersHandler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
      environment: {
        API_KEYS_TABLE_NAME: apiKeyTable.tableName,
        ADMIN_KEY: adminKey,
      },
    });

    const putUserByApiKeyFunction = new lambda.Function(this, 'PutUserByApiKeyFunction', {
      functionName: `${resourcePrefix}-ggk-put-user-by-apikey`,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'users.putUserByApiKeyHandler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
      environment: {
        API_KEYS_TABLE_NAME: apiKeyTable.tableName,
        ADMIN_KEY: adminKey,
      },
    });

    const deleteUserByApiKeyFunction = new lambda.Function(this, 'DeleteUserByApiKeyFunction', {
      functionName: `${resourcePrefix}-ggk-delete-user-by-apikey`,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'users.deleteUserByApiKeyHandler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
      environment: {
        API_KEYS_TABLE_NAME: apiKeyTable.tableName,
        RULES_TABLE_NAME: rulesTable.tableName,
        ADMIN_KEY: adminKey,
      },
    });

    // Grant Lambda functions access to the DynamoDB tables
    rulesTable.grantReadWriteData(helloWorldFunction);
    apiKeyTable.grantReadWriteData(helloWorldFunction);
    rulesTable.grantReadWriteData(rulesPostFunction);
    apiKeyTable.grantReadWriteData(rulesPostFunction);
    rulesTable.grantReadData(rulesGetFunction);
    rulesTable.grantReadWriteData(rulesPutFunction);
    rulesTable.grantReadWriteData(rulesDeleteFunction);
    apiKeyTable.grantReadWriteData(rulesDeleteFunction);
    rulesTable.grantReadData(rulesIsAllowedFunction);
    apiKeyTable.grantReadData(getUserFunction);
    apiKeyTable.grantReadData(getUserByApiKeyFunction);
    apiKeyTable.grantReadData(getAllUsersFunction);
    apiKeyTable.grantReadWriteData(putUserByApiKeyFunction);
    apiKeyTable.grantReadWriteData(deleteUserByApiKeyFunction);
    rulesTable.grantReadWriteData(deleteUserByApiKeyFunction);

    // Create an API Gateway
    const api = new apigateway.RestApi(this, 'GgkApi', {
      restApiName: `${resourcePrefix}-ggk-api`,
      description: 'This is the Guid Gate Keeper API with a healthcheck endpoint'
    });

    // Create resources and methods
    const healthcheckResource = api.root.addResource('healthcheck');
    healthcheckResource.addMethod('GET', new apigateway.LambdaIntegration(helloWorldFunction));

    const rulesResource = api.root.addResource('rules');
    rulesResource.addMethod('POST', new apigateway.LambdaIntegration(rulesPostFunction));
    rulesResource.addMethod('GET', new apigateway.LambdaIntegration(rulesGetFunction));

    const ruleResource = rulesResource.addResource('{ruleId}');
    ruleResource.addMethod('GET', new apigateway.LambdaIntegration(rulesGetFunction));
    ruleResource.addMethod('PUT', new apigateway.LambdaIntegration(rulesPutFunction));
    ruleResource.addMethod('DELETE', new apigateway.LambdaIntegration(rulesDeleteFunction));

    const isAllowedResource = ruleResource.addResource('isAllowed');
    isAllowedResource.addMethod('POST', new apigateway.LambdaIntegration(rulesIsAllowedFunction));

    const userResource = api.root.addResource('user');
    userResource.addMethod('GET', new apigateway.LambdaIntegration(getUserFunction));

    const usersResource = api.root.addResource('users');
    usersResource.addMethod('GET', new apigateway.LambdaIntegration(getAllUsersFunction));

    const userByApiKeyResource = usersResource.addResource('{apiKey}');
    userByApiKeyResource.addMethod('GET', new apigateway.LambdaIntegration(getUserByApiKeyFunction));
    userByApiKeyResource.addMethod('PUT', new apigateway.LambdaIntegration(putUserByApiKeyFunction));
    userByApiKeyResource.addMethod('DELETE', new apigateway.LambdaIntegration(deleteUserByApiKeyFunction));

    // Output the API endpoint URL
    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: api.url,
      description: 'The URL of the API endpoint',
    });

    // Output the DynamoDB table names
    new cdk.CfnOutput(this, 'RulesTableName', {
      value: rulesTable.tableName,
      description: 'The name of the Rules table',
    });

    new cdk.CfnOutput(this, 'ApiKeyTableName', {
      value: apiKeyTable.tableName,
      description: 'The name of the API Key table',
    });

    // Output the admin key (for initial setup)
    new cdk.CfnOutput(this, 'AdminKey', {
      value: adminKey,
      description: 'The admin API key (save this securely)',
    });
  }
} 