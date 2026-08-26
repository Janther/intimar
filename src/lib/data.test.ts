import { describe, expect, it, vi } from 'vitest';
import {
  formatDateRange,
  formatPrice,
  formatShortDate,
  isEarlyBirdActive,
} from './data';

describe('formatDateRange', () => {
  it('collapses same-month ranges to a single month name', () => {
    expect(
      formatDateRange(new Date('2026-09-14'), new Date('2026-09-21')),
    ).toBe('14–21 de septiembre de 2026');
  });

  it('spells out both months when the range crosses a month boundary', () => {
    expect(
      formatDateRange(new Date('2026-11-06'), new Date('2026-12-13')),
    ).toBe('6 de noviembre – 13 de diciembre de 2026');
  });

  it('includes both years when the range crosses a year boundary', () => {
    expect(
      formatDateRange(new Date('2026-12-10'), new Date('2027-02-15')),
    ).toBe('10 de diciembre de 2026 – 15 de febrero de 2027');
  });
});

describe('formatPrice', () => {
  it('formats CLP amounts with no decimal places', () => {
    expect(formatPrice(1380000, 'CLP')).toBe('$1.380.000');
  });
});

describe('formatShortDate', () => {
  it('formats a date as day and month only', () => {
    expect(formatShortDate(new Date('2026-09-08'))).toBe('8 de septiembre');
  });
});

describe('isEarlyBirdActive', () => {
  it('is active when the deadline is in the future', () => {
    vi.setSystemTime(new Date('2026-01-01'));
    expect(isEarlyBirdActive(new Date('2026-06-01'))).toBe(true);
    vi.useRealTimers();
  });

  it('is not active once the deadline has passed', () => {
    vi.setSystemTime(new Date('2026-06-02'));
    expect(isEarlyBirdActive(new Date('2026-06-01'))).toBe(false);
    vi.useRealTimers();
  });
});
