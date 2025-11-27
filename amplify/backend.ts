import { defineBackend, defineFunction } from "@aws-amplify/backend";
import { data } from "./data/resource";
import { Stack } from "aws-cdk-lib";
import { Effect, Policy, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Function as LambdaFunction } from "aws-cdk-lib/aws-lambda";
import { HttpApi, HttpMethod, CorsHttpMethod } from "aws-cdk-lib/aws-apigatewayv2";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";

const createGuessFunction = defineFunction({
  name: "create-guess",
  entry: "./lambda/functions/create-guess/handler.ts",
  resourceGroupName: "data",
});

const getLatestGuessFunction = defineFunction({
  name: "get-latest-guess",
  entry: "./lambda/functions/get-latest-guess/handler.ts",
  resourceGroupName: "data", // Assign function to data stack to avoid circular dependency
});

const backend = defineBackend({
  data,
  createGuessFunction,
  getLatestGuessFunction
});

// Get the lambda functions from the backend and cast to concrete Function type
const createGuessLambda = backend.createGuessFunction.resources.lambda as LambdaFunction;
const getLatestGuessLambda = backend.getLatestGuessFunction.resources.lambda as LambdaFunction;

// Update environment variables
const guessTable = backend.data.resources.tables["Guess"];
createGuessLambda.addEnvironment("TABLE_NAME", guessTable.tableName);
getLatestGuessLambda.addEnvironment("TABLE_NAME", guessTable.tableName);

// DynamoDB permissions
const attachDynamoDBPolicy = (lambda: LambdaFunction, policyName: string) => {
  lambda.role?.attachInlinePolicy(
    new Policy(Stack.of(lambda), policyName, {
      statements: [
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: [
            "dynamodb:PutItem",
            "dynamodb:GetItem",
            "dynamodb:UpdateItem",
            "dynamodb:Query",
          ],
          resources: [guessTable.tableArn],
        }),
      ],
    })
  );
};
attachDynamoDBPolicy(createGuessLambda, "CreateGuessDynamoDBPolicy");
attachDynamoDBPolicy(getLatestGuessLambda, "GetLatestGuessDynamoDBPolicy");

// Create HTTP API Gateway
const httpApi = new HttpApi(Stack.of(createGuessLambda), "GuessesApi", {
  apiName: "guesses-api",
  corsPreflight: {
    allowOrigins: ["*"],
    allowMethods: [
      CorsHttpMethod.GET,
      CorsHttpMethod.POST,
      CorsHttpMethod.OPTIONS,
    ],
    allowHeaders: ["Content-Type"],
  },
});

// Add Lambda integrations
const createGuessIntegration = new HttpLambdaIntegration(
  "CreateGuessIntegration",
  createGuessLambda
);
const getLatestGuessIntegration = new HttpLambdaIntegration(
  "GetLatestGuessIntegration",
  getLatestGuessLambda
);

// Add routes
httpApi.addRoutes({
  path: "/users/{userId}/guesses",
  methods: [HttpMethod.POST, HttpMethod.OPTIONS],
  integration: createGuessIntegration,
});
httpApi.addRoutes({
  path: "/users/{userId}/guesses/latest",
  methods: [HttpMethod.GET, HttpMethod.OPTIONS],
  integration: getLatestGuessIntegration,
});

// Add outputs to amplify_outputs.json
backend.addOutput({
  custom: {
    functions: {
      createGuessFunction: {
        invokeUrl: httpApi.url! + "/users/{userId}/guesses",
      },
      getLatestGuessFunction: {
        invokeUrl: httpApi.url! + "/users/{userId}/guesses/latest",
      },
    },
  },
});
