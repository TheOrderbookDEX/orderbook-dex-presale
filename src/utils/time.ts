import { percentage } from './math';

const MINUTE = 60n;
const HOUR = 60n * MINUTE;
const DAY = 24n * HOUR;

export function formatTime(time: bigint): string {
  const seconds = (time % MINUTE).toString().padStart(2, '0');
  const minutes = (time % HOUR / MINUTE).toString().padStart(2, '0');
  const hours = (time % DAY / HOUR).toString().padStart(2, '0');
  const days = (time / DAY).toString();
  return `${days}d ${hours}:${minutes}:${seconds}`;
}

export function timePercentage(value: bigint, start: bigint, end: bigint): number {
  return percentage(value - start, end - start);
}
