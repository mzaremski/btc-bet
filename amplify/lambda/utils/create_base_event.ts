import { APIGatewayProxyEventV2 } from 'aws-lambda';

export function createBaseEvent(body: string) {
  const base64Body = Buffer.from(body).toString('base64');

  const baseEvent: APIGatewayProxyEventV2 = {
    version: '2.0',
    routeKey: 'POST /users/{userId}/guesses',
    rawPath: '/users/user-1/guesses',
    rawQueryString: '',
    headers: {
      accept: '*/*',
      'accept-encoding': 'gzip, deflate, br',
      'cache-control': 'no-cache',
      'content-length': '38',
      'content-type': 'application/x-www-form-urlencoded',
      host: '123123123.api.com',
      'postman-token': '1231231231231231231231231231231233',
      'user-agent': 'PostmanRuntime/7.49.1',
      'x-amzn-trace-id': 'Root=1-69287da5-77f5ca585f448f4c0c9f0f87',
      'x-forwarded-for': '123.123.123.123', // eslint-disable-line sonarjs/no-hardcoded-ip
      'x-forwarded-port': '443',
      'x-forwarded-proto': 'https',
    },
    requestContext: {
      accountId: '307657261310',
      apiId: '0i0yxzi3vl',
      domainName: '0i0yxzi3vl.execute-api.eu-north-1.amazonaws.com',
      domainPrefix: '0i0yxzi3vl',
      http: {
        method: 'POST',
        path: '/users/user-1/guesses',
        protocol: 'HTTP/1.1',
        sourceIp: '11.11.111.111', // eslint-disable-line sonarjs/no-hardcoded-ip
        userAgent: 'Something/1.11.1',
      },
      requestId: 'UtiR_iWngi0EJHA=',
      routeKey: 'POST /users/{userId}/guesses',
      stage: '$default',
      time: '27/Nov/2025:16:34:45 +0000',
      timeEpoch: 1_764_261_285_976,
    },
    pathParameters: { userId: 'user-1' },
    body: base64Body,
    isBase64Encoded: true,
  };

  return baseEvent;
}
