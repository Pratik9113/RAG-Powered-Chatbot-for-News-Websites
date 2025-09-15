import Redis from 'ioredis';

let redisInstance = null;

export function getRedis() {
  if (redisInstance) return redisInstance;
  const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
  redisInstance = new Redis(redisUrl, {
    lazyConnect: true,
    maxRetriesPerRequest: 3,
    enableOfflineQueue: true,
    retryStrategy: (times) => Math.min(1000 * times, 10_000),
  });
  redisInstance.on('error', (err) => {
    console.warn('[redis] error:', err?.message || err);
  });
  return redisInstance;
}


