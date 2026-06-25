/**
 * Static definitions for cron field boundaries, named aliases,
 * and special expression mappings. Pure data, no logic.
 */

import type { FieldDefinition } from './types';

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
];
