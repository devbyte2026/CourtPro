import { redis } from "@/lib/db/redis";

export async function acquireLock(
  key: string,
  ttlSeconds: number = 10
): Promise<boolean> {
  const result = await redis.set(key, "1", { px: ttlSeconds * 1000, nx: true });
  return result === "OK";
}

export async function releaseLock(key: string): Promise<void> {
  await redis.del(key);
}

export function getBookingLockKey(
  courtId: string,
  date: string,
  startTime: string
): string {
  return `lock:booking:${courtId}:${date}:${startTime}`;
}
