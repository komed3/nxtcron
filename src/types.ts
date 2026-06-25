/**
 * Core type definitions for the cronxt package.
 */

/** Names of the five standard cron fields in order. */
export type CronFieldName = 'minute' | 'hour' | 'dayOfMonth' | 'month' | 'dayOfWeek';

/** A parsed cron expression represented as an object with named fields. */
export type CronObject = {
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
};
