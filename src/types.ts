/**
 * Core type definitions for the cronxt package.
 */

/** Names of the five standard cron fields in order. */
export type CronFieldName = 'minute' | 'hour' | 'dayOfMonth' | 'month' | 'dayOfWeek';

/** A parsed cron expression represented as an object with named fields. */
export interface CronObject {
  /** Minute field (0-59) */
  minute: string;
  /** Hour field (0-23) */
  hour: string;
  /** Day of month field (1-31) */
  dayOfMonth: string;
  /** Month field (1-12 or JAN-DEC) */
  month: string;
  /** Day of week field (0-6 or MON-SUN, 0 = Sunday) */
  dayOfWeek: string;
}

/** Options for creating a cron expression from structured values. */
export interface CronOptions extends Partial< CronObject > {}

/** Options for next/previous run calculations. */
export interface RunOptions {
  /** IANA timezone string (e.g. 'America/New_York'). Defaults to UTC. */
  timezone?: string;
  /** Reference date after which to find the next run. Defaults to now. */
  after?: Date;
  /** Reference date before which to find the previous run. Defaults to now. */
  before?: Date;
}

/** Options for the schedule method. */
export interface ScheduleOptions {
  /** IANA timezone string (e.g. 'UTC'). Defaults to local system timezone. */
  timezone?: string;
}
