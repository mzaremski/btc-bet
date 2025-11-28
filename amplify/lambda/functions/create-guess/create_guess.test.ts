import { describe, it, expect } from 'vitest';
import { handler } from './handler';

describe('create-guess handler', () => {
  it('should return 200', async () => {
    const result = await handler({});

    expect(result).toMatchObject({
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: {},
    });
  });
});
