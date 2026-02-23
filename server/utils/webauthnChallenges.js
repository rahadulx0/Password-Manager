// In-memory challenge store with 60s TTL
const challenges = new Map();

export function setChallenge(userId, challenge) {
  challenges.set(userId, { challenge, expires: Date.now() + 60_000 });
}

export function getChallenge(userId) {
  const entry = challenges.get(userId);
  if (!entry) return null;
  challenges.delete(userId);
  if (Date.now() > entry.expires) return null;
  return entry.challenge;
}
