import * as cdk from 'aws-cdk-lib';
import { GgkStack } from './ggk-stack';

const app = new cdk.App();

// Get stack name from environment variable, default to 'TEST'
const stackName = process.env.GGK_STACK_NAME || 'TEST';

new GgkStack(app, `GgkStack-${stackName}`, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  },
  stackName: `ggk-stack-${stackName.toLowerCase()}`,
});