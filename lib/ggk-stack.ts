import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export class GgkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Generate a random GUID for the admin key
    const adminKey = uuidv4();

    // Create Parameter Store parameter
    new ssm.StringParameter(this, 'AdminKeyParameter', {
      parameterName: 'GGK_ADMIN_KEY',
      stringValue: adminKey,
      description: 'Admin API key for Guid Gate Keeper',
      tier: ssm.ParameterTier.STANDARD,
    });

    // Create DynamoDB Tables
    const rulesTable = new dynamodb.Table(this, 'RulesRecords', {
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
      sortKey: { name: 'createdAt', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    const apiKeyTable = new dynamodb.Table(this, 'APIKeyRecords', {
      partitionKey: { name: 'apiKeyId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'email', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      pointInTimeRecovery: true,
    });

    // Create Lambda functions
    const helloWorldFunction = new lambda.Function(this, 'HelloWorldFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'hello-world.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
    });

    const rulesFunction = new lambda.Function(this, 'RulesFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'rules.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
      environment: {
        RULES_TABLE_NAME: rulesTable.tableName,
      },
    });

    // Grant Lambda functions access to the DynamoDB tables
    rulesTable.grantReadWriteData(helloWorldFunction);
    apiKeyTable.grantReadWriteData(helloWorldFunction);
    rulesTable.grantReadWriteData(rulesFunction);

    // Create an API Gateway
    const api = new apigateway.RestApi(this, 'GgkApi', {
      restApiName: 'Guid Gate Keeper API',
      description: 'This is the Guid Gate Keeper API with a healthcheck endpoint',
    });

    // Create resources and methods
    const healthcheckResource = api.root.addResource('healthcheck');
    healthcheckResource.addMethod('GET', new apigateway.LambdaIntegration(helloWorldFunction));

    const rulesResource = api.root.addResource('rules');
    rulesResource.addMethod('POST', new apigateway.LambdaIntegration(rulesFunction));

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