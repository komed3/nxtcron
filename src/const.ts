/**
 * Static definitions for cron field boundaries, named aliases,
 * and special expression mappings. Pure data, no logic.
 */

import type { CronFieldName, FieldDefinition, SpecialAlias } from './types';

/** Ordered list of cron field definitions with valid ranges and named aliases. */
export const FIELDS: FieldDefinition[] = [
  { name: 'minute',     min: 0, max: 59, aliases: {} },
  { name: 'hour',       min: 0, max: 23, aliases: {} },
  { name: 'dayOfMonth', min: 1, max: 31, aliases: {} },
  { name: 'month',      min: 1, max: 12, aliases: {
    JAN:  1, FEB:  2, MAR:  3, APR:  4, MAY:  5, JUN:  6,
    JUL:  7, AUG:  8, SEP:  9, OCT: 10, NOV: 11, DEC: 12
  } },
  { name: 'dayOfWeek',  min: 0, max:  6, aliases: {
    SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6
  } }
] as const;

/** Mapping of special cron aliases to their expanded 5-field equivalents. */
export const SPECIAL_ALIASES: Record< SpecialAlias, string > = {
  '@yearly':   '0 0 1 1 *',
  '@annually': '0 0 1 1 *',
  '@monthly':  '0 0 1 * *',
  '@weekly':   '0 0 * * 0',
  '@daily':    '0 0 * * *',
  '@midnight': '0 0 * * *',
  '@hourly':   '0 * * * *'
} as const;

/** Quick lookup from field name to its definition. */
export const FIELD_BY_NAME: Record< CronFieldName, FieldDefinition > = Object.fromEntries(
  FIELDS.map( f => [ f.name, f ] )
) as Record< CronFieldName, FieldDefinition >;

/** Names of the five cron fields in standard order. */
export const FIELD_NAMES = FIELDS.map( f => f.name );

/** Number of standard cron fields. */
export const FIELD_COUNT = FIELDS.length;

/** Mapping of weekday names to their numeric values (0 = Sunday). */
const WEEKDAY_MAP: Record< string, number > = {
  Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6
} as const;
