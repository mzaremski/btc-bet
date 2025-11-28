import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handler } from './handler';
import { createBaseEvent } from '../../utils/create_base_event';
import { ApiError } from '../../utils/errors';

const { mockSend } = vi.hoisted(() => ({
  mockSend: vi.fn(),
}));

vi.mock('../../utils/database', () => ({
  database: {
    send: mockSend,
  },
}));

describe('create-guess handler', () => {
  beforeEach(() => {
    mockSend.mockClear();
    vi.clearAllMocks();
  });
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
  it.todo('should throw validation error when isVoteUp is not defined');
  it.todo(
    'should throw validation error when userId is not defined or not uuid'
  );

  it('checks the db if the guess is already in progress', async () => {
    const mockTableName = 'sample-guess-table';
    const testUserId = '550e8400-e29b-41d4-a716-446655440000';

    process.env.TABLE_NAME = mockTableName;

    mockSend.mockResolvedValue({
      Items: [],
      Count: 0,
    });

    const result = await handler(
      createBaseEvent('isVoteUp=true', testUserId) as any,
      {} as any,
      (() => {}) as any
    );

    expect(mockSend).toHaveBeenCalledTimes(1);

    const queryCommand = mockSend.mock.calls[0][0];
    expect(queryCommand.input.ExpressionAttributeValues[':userId']).toBe(
      testUserId
    );
    expect(result).toMatchObject({
      statusCode: 200,
    });
  });
});
