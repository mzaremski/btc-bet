import { createResponse } from '../../utils/create_response';

export const handler = async event => {
  console.log('[create-guess] ENTIRE EVENT:', event);

  // Valudate body (are user_id and is_vote_up exist) with zod

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

  return createResponse(200, JSON.stringify({ message: 'Hello, world!' }));
};
