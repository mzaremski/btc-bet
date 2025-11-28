/* 
Documentation:
https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Kline-Candlestick-Data

API URL:
https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1s&limit=60&startTime=1732714320000

Response example:
[
  [
    1499040000000,      // Open time
    "0.01634790",       // Open
    "0.80000000",       // High
    "0.01575800",       // Low
    "0.01577100",       // Close
    "148976.11427815",  // Volume
    1499644799999,      // Close time
    "2434.19055334",    // Quote asset volume
    308,                // Number of trades
    "1756.87402397",    // Taker buy base asset volume
    "28.46694368",      // Taker buy quote asset volume
    "17928899.62484339" // Ignore.
  ]
]
*/

/*
  TODO: Both params are the same type, so it's easy to make a mistake.
  In this case it's worth to create an object. Then params are passed nammed.
  Also the startTime rather should be a Date
*/
export async function didBtcPriceGoUp(
  checkDelaySeconds: number,
  startTime: number
): Promise<boolean> {
  const apiUrl = `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1s&limit=${checkDelaySeconds}&startTime=${startTime}`;

  const response = await fetch(apiUrl);

  // TODO: Change to throwApiError
  if (!response.ok) {
    throw new Error(
      `Failed to fetch BTC data: ${response.status} ${response.statusText}`
    );
  }

  const data: Array<Array<string | number>> = await response.json();

  const isDataValid =
    Array.isArray(data) &&
    data.length > 0 &&
    data.every(item => Array.isArray(item));

  if (!isDataValid) {
    throw new Error('Invalid API response: expected non-empty array');
  }

  const firstOpenPrice = Number.parseFloat(String(data[0][1]));
  const lastOpenPrice = Number.parseFloat(String(data.at(-1)?.[1]));

  if (Number.isNaN(firstOpenPrice) || Number.isNaN(lastOpenPrice)) {
    throw new TypeError('Invalid API response: could not parse open prices');
  }

  /*
    TODO: There was no specification what happen when the price stays the same, so I decided that same price means price went down
  */
  return lastOpenPrice > firstOpenPrice;
}
