export function calculateCheckTime(
  guessTimestamp: number,
  checkDelaySeconds: number
): number {
  return guessTimestamp + checkDelaySeconds * 1000;
}

export function calculateRemainingSeconds(
  checkTime: number,
  now: number = Date.now()
): number {
  const delayMs = Math.max(0, checkTime - now);
  return Math.ceil(delayMs / 1000);
}
