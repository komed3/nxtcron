/**
 * CronCreator
 * Builds cron expression strings from structured option objects.
 */

import { CRON_DEFAULTS, FIELD_NAMES } from './const';
import type { CronObject, CronOptions, CronTuple } from './types';

/** Builds valid cron expression strings from structured options. */
export class CronCreator {
  private static instance?: CronCreator;

  /** Get the CronCreator instance. */
  public static getInstance () : CronCreator {
    return CronCreator.instance ??= new CronCreator();
  }

  private constructor () {}

  /**
   * Create a cron expression string from a cron field tuple.
   * 
   * @param tuple - Cron field values in standard order.
   * @returns A valid 5-field cron expression.
   * 
   * @example
   * creator.fromTuple( [ '0', '9', '*', '*', 'MON' ] );
   */
  public fromTuple ( tuple: CronTuple ) : string {
    return tuple.join( ' ' );
  }

  /**
   * Create a cron expression string from a partial CronObject.
   * 
   * Any omitted fields default to the wildcard (`*`).
   * 
   * @param options - Partial cron field values.
   * @returns A valid 5-field cron expression.
   * 
   * @example
   * creator.fromObject( {
   *   hour: '9',
   *   minute: '0',
   *   dayOfWeek: 'MON-FRI'
   * } );
   */
  public fromObject ( options: CronOptions ) : string {
    const merged: CronObject = { ...CRON_DEFAULTS, ...options };
    return FIELD_NAMES.map( name => merged[ name ] ).join( ' ' );
  }

  /**
   * Create a cron expression string from individual field values.
   * 
   * Any omitted fields default to the wildcard (`*`).
   * 
   * @param minute - Minute field (0-59).
   * @param hour - Hour field (0-23).
   * @param dayOfMonth - Day of month field (1-31).
   * @param month - Month field (1-12 or JAN-DEC).
   * @param dayOfWeek - Day of week field (0-6 or MON-SUN).
   * @returns A valid 5-field cron expression.
   * 
   * @example
   * creator.create( '0', '9', '*', '*', 'MON-FRI' );
   */
  public create ( minute = '*', hour = '*', dayOfMonth = '*', month = '*', dayOfWeek = '*' ) : string {
    return `${ minute } ${ hour } ${ dayOfMonth } ${ month } ${ dayOfWeek }`;
  }
}
