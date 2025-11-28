import amplifyOutputs from '../../amplify_outputs.json';

const createGuessUrl =
  amplifyOutputs.custom?.functions?.createGuessFunction?.invokeUrl;
const getLatestGuessUrl =
  amplifyOutputs.custom?.functions?.getLatestGuessFunction?.invokeUrl;

export async function createGuess(userId: string, isVoteUp: boolean) {
  const url = createGuessUrl?.replace('{userId}', userId);
  if (!url) throw new Error('Create guess URL not configured');

  const formData = new URLSearchParams();
  formData.append('isVoteUp', String(isVoteUp));

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create guess');
  }

  return response.json();
}

export async function getLatestGuess(userId: string) {
  const url = getLatestGuessUrl?.replace('{userId}', userId);
  if (!url) throw new Error('Get latest guess URL not configured');

  const response = await fetch(url);

  if (response.status === 404) {
    return;
  }

  if (!response.ok) {
    throw new Error('Failed to get latest guess');
  }

  return response.json();
}

