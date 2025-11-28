import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { database } from './database';

const TABLE_NAME = process.env.TABLE_NAME as string;

// TODO: Should be based on the schema
interface GuessItem {
  userId: string;
  timestamp: number;
  isVoteUp: boolean;
  checkDelaySeconds: number;
  checkTimestamp: string;
  scoreChange: number;
  totalScore: number;
  createdAt: string;
  updatedAt: string;
}

// query- prefix just to indicate this is a database query
export async function queryGetLatestGuessItem(
  userId: string
): Promise<GuessItem | undefined> {
  const queryResult = await database.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
      ScanIndexForward: false, // Get most recent first
      Limit: 1,
    })
  );

  // TODO: fix the type casting
  const guessItem = queryResult?.Items?.[0] as GuessItem | undefined;

  return guessItem;
}

// ......Here place to add more queries
