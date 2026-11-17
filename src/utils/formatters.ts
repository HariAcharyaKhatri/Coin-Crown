export function formatNumber(num: number): string {
  if (num === null || num === undefined || isNaN(num)) return '0';
  const abs = Math.abs(num);

  if (abs >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(2).replace(/\.00$/, '') + 'B';
  }
  if (abs >= 1_000_000) {
    return (num / 1_000_000).toFixed(2).replace(/\.00$/, '') + 'M';
  }
  if (abs >= 10_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toLocaleString('en-US', { maximumFractionDigits: 1 });
}

export function formatCoins(amount: number): string {
  return `${formatNumber(amount)} 🪙`;
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  if (mins < 60) return `${mins}m ${secs}s`;
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hours}h ${remMins}m`;
}

export function formatPercent(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}
