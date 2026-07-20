// Pure function: given an array of Date objects (attempt timestamps),
// returns { current, longest } streak counts in whole calendar days.
function calculateStreak(dates) {
  if (!dates || dates.length === 0) return { current: 0, longest: 0 };

  // Normalize to unique calendar-day strings (local time), sorted ascending
  const dayKey = (d) => {
    const dt = new Date(d);
    return `${dt.getFullYear()}-${dt.getMonth()}-${dt.getDate()}`;
  };
  const uniqueDays = [...new Set(dates.map(dayKey))]
    .map((key) => {
      const [y, m, d] = key.split("-").map(Number);
      return new Date(y, m, d).getTime();
    })
    .sort((a, b) => a - b);

  const ONE_DAY = 24 * 60 * 60 * 1000;
  let longest = 1;
  let run = 1;

  for (let i = 1; i < uniqueDays.length; i++) {
    if (uniqueDays[i] - uniqueDays[i - 1] === ONE_DAY) {
      run += 1;
    } else {
      run = 1;
    }
    longest = Math.max(longest, run);
  }

  // Current streak: walk backwards from today/yesterday
  const today = new Date();
  const todayKey = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const lastDay = uniqueDays[uniqueDays.length - 1];

  let current = 0;
  if (lastDay === todayKey || lastDay === todayKey - ONE_DAY) {
    current = 1;
    for (let i = uniqueDays.length - 1; i > 0; i--) {
      if (uniqueDays[i] - uniqueDays[i - 1] === ONE_DAY) {
        current += 1;
      } else {
        break;
      }
    }
  }

  return { current, longest };
}

module.exports = { calculateStreak };
