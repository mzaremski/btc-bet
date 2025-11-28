export async function fetchBtcPrice(): Promise<number> {
  const response = await fetch(
    'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT'
  );
  const data = await response.json();
  return Number.parseFloat(data.price);
}

