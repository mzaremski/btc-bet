import { describe, it, expect, vi, beforeEach } from 'vitest';
import { didBtcPriceGoUp } from './did_btc_price_go_up';

const { mockFetch } = vi.hoisted(() => ({
  mockFetch: vi.fn(),
}));

vi.stubGlobal('fetch', mockFetch);

describe('didBtcPriceGoUp', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('should return true when price went up', async () => {
    // Mock response with 3 klines: price goes from 50000 to 51000
    const mockKlines: Array<Array<string | number>> = [
      [
        1_499_040_000_000, // Open time
        '50000.00', // Open (first price)
        '50100.00', // High
        '49900.00', // Low
        '50050.00', // Close
        '148976.11427815', // Volume
        1_499_040_099_999, // Close time
        '2434.19055334', // Quote asset volume
        308, // Number of trades
        '1756.87402397', // Taker buy base asset volume
        '28.46694368', // Taker buy quote asset volume
        '17928899.62484339', // Ignore
      ],
      [
        1_499_040_100_000, // Open time
        '50500.00', // Open
        '50600.00', // High
        '50400.00', // Low
        '50550.00', // Close
        '148976.11427815', // Volume
        1_499_040_199_999, // Close time
        '2434.19055334', // Quote asset volume
        308, // Number of trades
        '1756.87402397', // Taker buy base asset volume
        '28.46694368', // Taker buy quote asset volume
        '17928899.62484339', // Ignore
      ],
      [
        1_499_040_200_000, // Open time
        '51000.00', // Open (last price - higher than first)
        '51100.00', // High
        '50900.00', // Low
        '51050.00', // Close
        '148976.11427815', // Volume
        1_499_040_299_999, // Close time
        '2434.19055334', // Quote asset volume
        308, // Number of trades
        '1756.87402397', // Taker buy base asset volume
        '28.46694368', // Taker buy quote asset volume
        '17928899.62484339', // Ignore
      ],
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockKlines,
    } as Response);

    const result = await didBtcPriceGoUp(3, 1_764_338_605_000);

    expect(result).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should return false when price stayed the same', async () => {
    // Mock response with 3 klines: price stays at 50000
    const mockKlines: Array<Array<string | number>> = [
      [
        1_499_040_000_000, // Open time
        '50000.00', // Open (first price)
        '50100.00', // High
        '49900.00', // Low
        '50050.00', // Close
        '148976.11427815', // Volume
        1_499_040_099_999, // Close time
        '2434.19055334', // Quote asset volume
        308, // Number of trades
        '1756.87402397', // Taker buy base asset volume
        '28.46694368', // Taker buy quote asset volume
        '17928899.62484339', // Ignore
      ],
      [
        1_499_040_100_000, // Open time
        '50000.00', // Open
        '50100.00', // High
        '49900.00', // Low
        '50050.00', // Close
        '148976.11427815', // Volume
        1_499_040_199_999, // Close time
        '2434.19055334', // Quote asset volume
        308, // Number of trades
        '1756.87402397', // Taker buy base asset volume
        '28.46694368', // Taker buy quote asset volume
        '17928899.62484339', // Ignore
      ],
      [
        1_499_040_200_000, // Open time
        '50000.00', // Open (last price - same as first)
        '50100.00', // High
        '49900.00', // Low
        '50050.00', // Close
        '148976.11427815', // Volume
        1_499_040_299_999, // Close time
        '2434.19055334', // Quote asset volume
        308, // Number of trades
        '1756.87402397', // Taker buy base asset volume
        '28.46694368', // Taker buy quote asset volume
        '17928899.62484339', // Ignore
      ],
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockKlines,
    } as Response);

    const result = await didBtcPriceGoUp(3, 1_764_338_605_000);

    expect(result).toBe(false);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should return false when price went down', async () => {
    // Mock response with 3 klines: price goes from 51000 to 50000
    const mockKlines: Array<Array<string | number>> = [
      [
        1_499_040_000_000, // Open time
        '51000.00', // Open (first price)
        '51100.00', // High
        '50900.00', // Low
        '51050.00', // Close
        '148976.11427815', // Volume
        1_499_040_099_999, // Close time
        '2434.19055334', // Quote asset volume
        308, // Number of trades
        '1756.87402397', // Taker buy base asset volume
        '28.46694368', // Taker buy quote asset volume
        '17928899.62484339', // Ignore
      ],
      [
        1_499_040_100_000, // Open time
        '50500.00', // Open
        '50600.00', // High
        '50400.00', // Low
        '50550.00', // Close
        '148976.11427815', // Volume
        1_499_040_199_999, // Close time
        '2434.19055334', // Quote asset volume
        308, // Number of trades
        '1756.87402397', // Taker buy base asset volume
        '28.46694368', // Taker buy quote asset volume
        '17928899.62484339', // Ignore
      ],
      [
        1_499_040_200_000, // Open time
        '50000.00', // Open (last price - lower than first)
        '50100.00', // High
        '49900.00', // Low
        '50050.00', // Close
        '148976.11427815', // Volume
        1_499_040_299_999, // Close time
        '2434.19055334', // Quote asset volume
        308, // Number of trades
        '1756.87402397', // Taker buy base asset volume
        '28.46694368', // Taker buy quote asset volume
        '17928899.62484339', // Ignore
      ],
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockKlines,
    } as Response);

    const result = await didBtcPriceGoUp(3, 1_764_338_605_000);

    expect(result).toBe(false);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
