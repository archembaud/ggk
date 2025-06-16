#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { GgkStack } from './ggk-stack';

const app = new cdk.App();
new GgkStack(app, 'GgkStack', {
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION 
  },
}); 