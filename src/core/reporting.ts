import type { Job, Manifest, Report, StateCache } from './types.js';

function liveSeconds(page: Manifest['pages'][number], now: Date): number {
  if (page.status !== 'WORKING' || !page.active_started_at) return 0;
  return Math.max(0, (now.getTime() - new Date(page.active_started_at).getTime()) / 1000);
}

export function pageActiveSeconds(page: Manifest['pages'][number], now: Date): number {
  return page.active_seconds + liveSeconds(page, now);
}

export function buildReport(job: Job, manifest: Manifest, _state: StateCache, now: Date): Report {
  const completed = manifest.pages.filter((page) => page.status === 'COMPLETED');
  const durations = completed.map((page) => pageActiveSeconds(page, now)).sort((a, b) => a - b);
  const activeSeconds = manifest.pages.reduce((sum, page) => sum + pageActiveSeconds(page, now), 0);
  const average = durations.length ? durations.reduce((sum, value) => sum + value, 0) / durations.length : 0;
  const midpoint = Math.floor(durations.length / 2);
  const median = durations.length === 0
    ? 0
    : durations.length % 2 === 1
      ? durations[midpoint]
      : (durations[midpoint - 1] + durations[midpoint]) / 2;
  const pagesPerHour = activeSeconds > 0 ? completed.length / (activeSeconds / 3600) : 0;
  const netRevenue = job.quoted_total !== undefined && job.net_factor !== undefined
    ? job.quoted_total * job.net_factor
    : undefined;
  return {
    completed_pages: completed.length,
    total_pages: manifest.pages.length,
    active_seconds: activeSeconds,
    average_active_seconds: average,
    median_active_seconds: median,
    pages_per_hour: pagesPerHour,
    quoted_total: job.quoted_total,
    net_revenue: netRevenue,
    currency: job.currency,
    effective_hourly_rate: netRevenue !== undefined && activeSeconds > 0 ? netRevenue / (activeSeconds / 3600) : undefined,
  };
}
