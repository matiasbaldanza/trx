export const SCHEMA_VERSION = 1;

export type JobStatus = 'ACTIVE' | 'FINISHED';
export type PageStatus = 'PENDING' | 'WORKING' | 'PAUSED' | 'COMPLETED';

export interface Measurement {
  method: 'timer';
  confidence: 'high';
}

export interface Page {
  pdf_page: number;
  billable_page: number;
  document_type?: string;
  document_label?: string;
  content_category?: string;
  source_format?: 'native' | 'scanned' | 'mixed';
  country?: string;
  region?: string;
  status: PageStatus;
  active_seconds: number;
  started_at?: string;
  active_started_at?: string;
  completed_at?: string;
  measurement?: Measurement;
}

export interface Job {
  schema_version: number;
  job_id: string;
  source_language: string;
  target_language: string;
  default_country?: string;
  default_region?: string;
  quoted_pages: number;
  quoted_total?: number;
  currency?: string;
  net_factor?: number;
  status: JobStatus;
  created_at: string;
  finished_at?: string;
}

export interface Manifest {
  schema_version: number;
  physical_page_count: number;
  non_billable_pages: number[];
  pages: Page[];
}

export interface StateCache {
  schema_version: number;
  current_page: number | null;
  last_action?: string;
  updated_at: string;
}

export type EventType =
  | 'job_initialized'
  | 'page_started'
  | 'timer_paused'
  | 'timer_resumed'
  | 'page_completed'
  | 'job_finished'
  | 'job_reopened';

export interface Event {
  schema_version: number;
  type: EventType;
  timestamp: string;
  page?: number;
  active_seconds?: number;
}

export interface Report {
  completed_pages: number;
  total_pages: number;
  active_seconds: number;
  average_active_seconds: number;
  median_active_seconds: number;
  pages_per_hour: number;
  quoted_total?: number;
  net_revenue?: number;
  currency?: string;
  effective_hourly_rate?: number;
}

export interface ProjectData {
  root: string;
  trxDir: string;
  job: Job;
  manifest: Manifest;
  state: StateCache;
}

export interface DomainResult {
  job: Job;
  manifest: Manifest;
  state: StateCache;
  event: Event;
}
