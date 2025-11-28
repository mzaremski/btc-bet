import { createResponse } from '../../utils/create_response';

export const handler = async event => {
  console.log('[create-guess] ENTIRE EVENT:', event);

  // Validate body (does user_id exist) with zod

  // Query DynamoDB for the last user's guess.

  // If the Guess Item has checkTimestamp filled. Return in the response:
  // (timestamp, checkTimestamp, checkDelaySeconds, scoreChange, totalScore)

  /* If the Guess Item has no checkTimestamp:
    Check if the current time is greater than the timestamp + checkDelaySeconds:
    - If true, run a function to resolve the guess.
      Then update the Guess Item with the new checkTimestamp, scoreChange, and totalScore.
    - If false, return in the response:
      (timestamp, checkDelaySeconds, scoreChange, totalScore)
   */

  // Response to the user with the Guess item.
  return createResponse(200, JSON.stringify({ message: 'Hello, world!' }));
};
