import { createResponse } from '../../utils/create_response';
import { throwApiError } from '../../utils/errors';
import { z } from 'zod';
import { queryGetLatestGuessItem } from '../../utils/queries';
import { didBtcPriceGoUp } from './did_btc_price_go_up';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { database } from '../../utils/database';

export const handler = async event => {
  const tableName = process.env.TABLE_NAME as string;

  // Validate body
  const pathParametersValidationResult = z
    .object({
      userId: z.uuid(),
    })
    .safeParse(event.pathParameters);

  if (!pathParametersValidationResult.success) {
    throwApiError(
      'INVALID_DATA',
      pathParametersValidationResult.error?.message
    );
  }

  const { userId } = pathParametersValidationResult.data!;

  // Query DynamoDB for the last user's guess.
  const guessItem = await queryGetLatestGuessItem(userId);

  if (!guessItem) {
    return createResponse(404, {
      error: 'No guess found for the user.',
    });
  }

  const currentTimestamp = Date.now();
  const isGuessInProgress = guessItem && !guessItem.checkTimestamp;
  const isGuessReadyToBeResolved =
    isGuessInProgress &&
    currentTimestamp >
      Number(guessItem.timestamp) + guessItem.checkDelaySeconds * 1000;

  /*
    If the Guess Item has checkTimestamp...

    Check if the current time is greater than the timestamp + checkDelaySeconds:
    - If true, run a function to resolve the guess.
    - If false, just return in the response
  */
  if (isGuessReadyToBeResolved) {
    const priceWentUp = await didBtcPriceGoUp(
      guessItem.checkDelaySeconds,
      Number(guessItem.timestamp)
    );
    const scoreChange = guessItem.isVoteUp === priceWentUp ? 1 : -1;

    await database.send(
      new UpdateCommand({
        TableName: tableName,
        Key: { userId: guessItem.userId, timestamp: guessItem.timestamp },
        UpdateExpression:
          'set checkTimestamp = :checkTimestamp, scoreChange = :scoreChange, totalScore = totalScore + :scoreChange',
        ExpressionAttributeValues: {
          ':checkTimestamp': currentTimestamp,
          ':scoreChange': scoreChange,
        },
      })
    );

    // TODO: later in the user response should be used data from the database.send result. (like RETURNING * from SQL)
    return createResponse(200, {
      timestamp: guessItem.timestamp,
      checkTimestamp: guessItem.checkTimestamp,
      checkDelaySeconds: guessItem.checkDelaySeconds,
      scoreChange: scoreChange,
      totalScore: guessItem.totalScore + scoreChange,
      isGuessInProgress: false,
    });
  }

  // Return either the already resolved guess or the guess in progress.
  return createResponse(200, {
    timestamp: guessItem.timestamp,
    checkTimestamp: guessItem.checkTimestamp,
    checkDelaySeconds: guessItem.checkDelaySeconds,
    scoreChange: guessItem.scoreChange,
    totalScore: guessItem.totalScore,
    isGuessInProgress: isGuessInProgress,
  });
};
