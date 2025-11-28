import { APIGatewayProxyResultV2 } from 'aws-lambda';

export const createResponse = (
  statusCode: number,
  body: Record<string, any>,
  additionalHeaders: Record<string, string> = {}
): APIGatewayProxyResultV2 => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    ...additionalHeaders,
  },
  body: JSON.stringify(body),
});
