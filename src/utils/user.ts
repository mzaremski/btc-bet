import { STORAGE_KEY } from './storage';

function generateUserId(): string {
  return crypto.randomUUID();
}

export function getUserId(): string {
  let userId = localStorage.getItem(STORAGE_KEY);
  if (!userId) {
    userId = generateUserId();
    localStorage.setItem(STORAGE_KEY, userId);
  }
  return userId;
}

