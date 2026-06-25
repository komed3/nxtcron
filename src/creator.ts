/**
 * Creator
 * Builds cron expression strings from structured option objects.
 */

import { CRON_DEFAULTS, FIELD_NAMES } from './const';
import type { CronObject, CronOptions } from './types';

/** Builds valid cron expression strings from structured options. */
export class CronCreator {
  /**
   * Create a cron expression string from a partial options object.
   * Omitted fields default to wildcard.
   * 
   * @param options - A partial CronOptions object.
   * @returns A valid 5-field cron expression string.
   */
  public fromObject ( options: CronOptions ) : string {
    const merged: CronObject = { ...CRON_DEFAULTS, ...options };
    return FIELD_NAMES.map( name => merged[ name ] ).join( ' ' );
  }
}
