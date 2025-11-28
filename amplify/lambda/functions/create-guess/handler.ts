import { createResponse } from '../../utils/create_response';
import { throwApiError } from '../../utils/errors';
import middy from '@middy/core';
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
  const validationResult = z
    .object({
      isVoteUp: z.stringbool(),
    })
    .safeParse(event.body);

  if (!validationResult.success) {
    throwApiError('INVALID_DATA', validationResult.error.message);
  }

  // Check if the user already has unresolved guess
  // Query DynamoDB for the last user's guess.
  // Check if the Guess Item has checkTimestamp filled. Return 409 if true.

  // If user has Guess Item without checkTimestamp. Save the Guess item to the database:
  // Save:
  // - userId
  // - timestamp
  // - isVoteUp
  // - checkDelaySeconds = 60  (default, defined in the backend)
  // - totalScore

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
