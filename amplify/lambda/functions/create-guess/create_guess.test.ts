import { describe, it, expect } from 'vitest';
import { handler } from './handler';
import { createBaseEvent } from '../../utils/create_base_event';
import { ApiError } from '../../utils/errors';

describe('create-guess handler', () => {
  it('should return 200', async () => {
    const result = await handler(
      createBaseEvent('isVoteUp=true') as any, // For some reason middy throws type error here
      {} as any,
      (() => {}) as any
    );

    expect(result).toMatchObject({
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: {},
    });
  });

  it('should throw validation error', async () => {
    await expect(
      handler(
        createBaseEvent('isVoteUp=123') as any, // For some reason middy throws type error here
        {} as any,
        (() => {}) as any
      )
    ).rejects.toThrow(ApiError);
  });
});
