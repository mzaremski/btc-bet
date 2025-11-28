import { useEffect, useState } from 'react';
import { fetchBtcPrice } from '../api/btc';

export function useBtcPrice() {
  const [btcPrice, setBtcPrice] = useState<number | undefined>();

  useEffect(() => {
    const updateBtcPrice = async () => {
      try {
        const price = await fetchBtcPrice();
        setBtcPrice(price);
      } catch (error_) {
        console.error('Failed to fetch BTC price:', error_);
      }
    };

    updateBtcPrice();
    const interval = setInterval(updateBtcPrice, 5000);
    return () => clearInterval(interval);
  }, []);

  return btcPrice;
}
