import { formatPercent } from '@/utils/percent'

describe('formatPercent', () => {
  test('caps at two decimals and drops trailing zeros', () => {
    expect(formatPercent(33.33333)).toBe('33.33')
    expect(formatPercent(65)).toBe('65')
    expect(formatPercent(50.5)).toBe('50.5')
    expect(formatPercent(0)).toBe('0')
    expect(formatPercent(100)).toBe('100')
  })
})
