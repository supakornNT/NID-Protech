import { createClient } from 'redis';

export const redisClient =
  createClient({
    url:
      process.env.REDIS_URL ||
      'redis://localhost:6379',
    socket: {
      reconnectStrategy: false,
    },
  });

let hasLoggedRedisError = false;

redisClient.on('error', (err) => {
  if (hasLoggedRedisError) {
    return;
  }

  hasLoggedRedisError = true;
  console.warn('Redis unavailable, falling back without Redis session store.', err);
});
