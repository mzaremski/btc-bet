import { APIGatewayProxyResultV2 } from "aws-lambda";

export const createResponse = (
  statusCode: number,
  body: string,
  additionalHeaders: Record<string, string> = {}
): APIGatewayProxyResultV2 => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    ...additionalHeaders,
  },
  body,
});
