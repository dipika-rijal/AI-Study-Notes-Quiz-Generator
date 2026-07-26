const { test } = require('node:test');
const assert = require('node:assert');
const { calculateStreak } = require('./streakUtils');

test('Streak Utils', async (t) => {
  await t.test('returns 0 for empty or null dates', () => {
    assert.deepStrictEqual(calculateStreak([]), { current: 0, longest: 0 });
    assert.deepStrictEqual(calculateStreak(null), { current: 0, longest: 0 });
  });

  await t.test('calculates a simple contiguous streak ending today', () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    const dates = [yesterday, today];
    const result = calculateStreak(dates);
    
    assert.strictEqual(result.current, 2);
    assert.strictEqual(result.longest, 2);
  });

  await t.test('ignores duplicate dates on the same day', () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    const dates = [yesterday, yesterday, today, today];
    const result = calculateStreak(dates);
    
    assert.strictEqual(result.current, 2);
    assert.strictEqual(result.longest, 2);
  });

  await t.test('longest streak is preserved even if current is broken', () => {
    const today = new Date();
    
    const day1 = new Date(today); day1.setDate(today.getDate() - 10);
    const day2 = new Date(today); day2.setDate(today.getDate() - 9);
    const day3 = new Date(today); day3.setDate(today.getDate() - 8);
    
    // Broken streak
    const day5 = new Date(today); day5.setDate(today.getDate() - 6);
    
    const dates = [day1, day2, day3, day5];
    const result = calculateStreak(dates);
    
    assert.strictEqual(result.current, 0); // Didn't do anything today or yesterday
    assert.strictEqual(result.longest, 3);
  });
});
