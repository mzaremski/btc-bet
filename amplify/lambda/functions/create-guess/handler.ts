import { createResponse } from '../../utils/create_response';
import { throwApiError } from '../../utils/errors';
import { database } from '../../utils/database';
import middy from '@middy/core';
import { QueryCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import inputOutputLogger from '@middy/input-output-logger';
import httpEventNormalizer from '@middy/http-event-normalizer';
import httpHeaderNormalizer from '@middy/http-header-normalizer';
import httpUrlencodeBodyParser from '@middy/http-urlencode-body-parser';
import httpCors from '@middy/http-cors';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { z } from 'zod';

const createGuessBaseHandler = async (event: APIGatewayProxyEventV2) => {
  console.log('[create-guess] ENTIRE EVENT:', event);

  // Validate body (are user_id and is_vote_up exist) with zod
  const pathParametersValidationResult = z
    .object({
      userId: z.uuid(),
    })
    .safeParse(event.pathParameters);

  const bodyValidationResult = z
    .object({
      isVoteUp: z.stringbool(),
    })
    .safeParse(event.body);

  if (
    !bodyValidationResult.success ||
    !pathParametersValidationResult.success
  ) {
    throwApiError(
      'INVALID_DATA',
      bodyValidationResult.error?.message ||
        pathParametersValidationResult.error?.message
    );
  }

  const { userId } = pathParametersValidationResult.data!;
  // const { isVoteUp } = bodyValidationResult.data!;
  const tableName = process.env.TABLE_NAME as string;

  // Check if the user already has unresolved guess
  // Query DynamoDB for the last user's guess.
  // Check if the Guess Item has checkTimestamp filled. Return 409 if true.
  // Query for the latest guess for this user
  const queryResult = await database.send(
    new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: 'user_id = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
      ScanIndexForward: false, // Get most recent first
      Limit: 1,
    })
  );

  console.log('[create-guess] queryResult:', queryResult);

  const isGuessInProgress =
    queryResult.Items &&
    queryResult.Items.length > 0 &&
    !queryResult.Items[0].checkTimestamp;

  if (isGuessInProgress) {
    return createResponse(409, {
      error:
        'A guess is already in progress. Please wait for it to be checked.',
    });
  }

  // If user has Guess Item without checkTimestamp. Save the Guess item to the database:
  // Save:
  // - userId
  // - timestamp
  // - isVoteUp
  // - checkDelaySeconds = 60  (default, defined in the backend)
  // - totalScore

  await database.send(
    new PutCommand({
      TableName: tableName,
      Item: {
        userId,
        timestamp: new Date().toISOString(),
        isVoteUp: true,
        checkDelaySeconds: 60,
        totalScore: 0,
      },
    })
  );

  // Response to the user with succcess

  return createResponse(200, { message: 'Hello, world!' });
};

export const handler = middy(createGuessBaseHandler)
  .use(inputOutputLogger({ awsContext: true }))
  .use(httpEventNormalizer())
  .use(httpHeaderNormalizer())
  .use(httpUrlencodeBodyParser())
  .use(
    httpCors({
      origin: '*',
      headers: 'Content-Type',
      methods: 'POST,OPTIONS',
    })
  );
