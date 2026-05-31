import { isOverdue, PRIORITY_META, toLocalIso } from '@/utils/format';

describe('format utils', () => {
  test('toLocalIso serializes without a timezone', () => {
    const d = new Date(2026, 5, 1, 9, 5, 0); // 2026-06-01 09:05 local
    expect(toLocalIso(d)).toBe('2026-06-01T09:05:00');
  });

  test('toLocalIso zero-pads month/day/time', () => {
    const d = new Date(2026, 0, 3, 4, 7, 0);
    expect(toLocalIso(d)).toBe('2026-01-03T04:07:00');
  });

  test('isOverdue compares against now', () => {
    expect(isOverdue('2000-01-01T00:00:00')).toBe(true);
    expect(isOverdue('2999-01-01T00:00:00')).toBe(false);
    expect(isOverdue(undefined)).toBe(false);
  });

  test('PRIORITY_META covers all priorities', () => {
    expect(PRIORITY_META.HIGH.label).toBe('High');
    expect(PRIORITY_META.MEDIUM.label).toBe('Medium');
    expect(PRIORITY_META.LOW.label).toBe('Low');
  });
});
