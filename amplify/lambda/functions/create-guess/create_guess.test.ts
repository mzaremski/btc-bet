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

  it('should return 201', async () => {
    const result = await handler(
      createBaseEvent('isVoteUp=true') as any, // For some reason middy throws type error here
      {} as any,
      (() => {}) as any
    );

    expect(result).toMatchObject({
      statusCode: 201,
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

    mockSend.mockResolvedValueOnce({
      Items: [
        {
          userId: testUserId,
          timestamp: new Date().toISOString(),
          isVoteUp: true,
          checkDelaySeconds: 60,
          totalScore: 0,
        },
      ], // Item existing, but no checkTimestamp means the guess is in progress
      Count: 1,
    });

    const result = await handler(
      createBaseEvent('isVoteUp=true', testUserId) as any,
      {} as any,
      (() => {}) as any
    );

    expect(mockSend).toHaveBeenCalled();

    const queryCommand = mockSend.mock.calls[0][0];
    expect(queryCommand.input.ExpressionAttributeValues[':userId']).toBe(
      testUserId
    );
    expect(result).toMatchObject({
      statusCode: 409,
    });
  });

  it('puts new guess to the database if there are other guesses, but all of them are done (contains check_timestamp)', async () => {
    const mockTableName = 'sample-guess-table';
    const testUserId = '550e8400-e29b-41d4-a716-446655440000';
    const previousTotalScore = 100;

    process.env.TABLE_NAME = mockTableName;

    // First call: QueryCommand - returns a completed guess with checkTimestamp
    mockSend.mockResolvedValueOnce({
      Items: [
        {
          userId: testUserId,
          timestamp: new Date().toISOString(),
          isVoteUp: true,
          checkDelaySeconds: 60,
          totalScore: previousTotalScore,
          checkTimestamp: new Date().toISOString(), // This means the guess is done
        },
      ],
      Count: 1,
    });

    // Second call: PutCommand - puts the new guess
    mockSend.mockResolvedValueOnce({});

    const result = await handler(
      createBaseEvent('isVoteUp=true', testUserId) as any,
      {} as any,
      (() => {}) as any
    );

    expect(mockSend).toHaveBeenCalledTimes(2);

    // Verify QueryCommand was called first
    const queryCommand = mockSend.mock.calls[0][0];
    expect(queryCommand.input.ExpressionAttributeValues[':userId']).toBe(
      testUserId
    );

    // Verify PutCommand was called second
    const putCommand = mockSend.mock.calls[1][0];
    expect(putCommand.input.Item.userId).toBe(testUserId);
    expect(putCommand.input.Item.totalScore).toBe(previousTotalScore);

    // Verify response
    expect(result).toMatchObject({
      statusCode: 201,
    });
    expect(result).toBeDefined();
    const responseBody = JSON.parse(
      (result as { body?: string })?.body || '{}'
    );
    expect(responseBody.totalScore).toBe(previousTotalScore);
  });

  it('puts new guess to the database if no other guess exist', async () => {
    const mockTableName = 'sample-guess-table';
    const testUserId = '550e8400-e29b-41d4-a716-446655440000';

    process.env.TABLE_NAME = mockTableName;

    // First call: QueryCommand - returns no items
    mockSend.mockResolvedValueOnce({
      Items: [],
      Count: 0,
    });

    // Second call: PutCommand - puts the new guess
    mockSend.mockResolvedValueOnce({});

    const result = await handler(
      createBaseEvent('isVoteUp=false', testUserId) as any,
      {} as any,
      (() => {}) as any
    );

    expect(mockSend).toHaveBeenCalledTimes(2);

    // Verify QueryCommand was called first
    const queryCommand = mockSend.mock.calls[0][0];
    expect(queryCommand.input.ExpressionAttributeValues[':userId']).toBe(
      testUserId
    );

    // Verify PutCommand was called second
    const putCommand = mockSend.mock.calls[1][0];
    expect(putCommand.input.Item.userId).toBe(testUserId);
    expect(putCommand.input.Item.isVoteUp).toBe(false);
    expect(putCommand.input.Item.totalScore).toBe(0);

    // Verify response
    expect(result).toMatchObject({
      statusCode: 201,
    });
    expect(result).toBeDefined();
    const responseBody = JSON.parse(
      (result as { body?: string })?.body || '{}'
    );
    expect(responseBody.totalScore).toBe(0);
  });
});
