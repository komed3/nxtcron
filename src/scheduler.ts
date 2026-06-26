/**
 * CronScheduler
 * Schedules callbacks on a cron schedule using setTimeout.
 */

import { CronCalculator } from './calculator';
import { CronParser } from './parser';
import type { CronInput, EventHandler, ScheduleController, ScheduleEvent, ScheduleOptions } from './types';

/** CronScheduler schedules callbacks to run according to a cron expression. */
export class CronScheduler {
  private static readonly parser = CronParser.getInstance();
  private static readonly calculator = CronCalculator.getInstance();
  private static instance?: CronScheduler;

  /** Get the CronScheduler instance. */
  public static getInstance () : CronScheduler {
    return this.instance ??= new CronScheduler();
  }

  private constructor () {}

  /**
   * Schedule a callback to run on the given cron schedule.
   * 
   * @param expr - A standard 5-field cron string, parsed cron object or special alias.
   *   The special '@reboot' alias fires the callback immediately once.
   * @param callback - Function to invoke on each scheduled occurrence.
   * @param options - Optional ScheduleOptions with timezone.
   * @returns A ScheduleController with stop(), on(), and off() methods.
   * 
   * @example
   * const job = scheduler.schedule( '0 * * * *', () => console.log( 'tick' ), { timezone: 'UTC' } );
   * job.on( 'tick', () => console.log( 'about to fire' ) );
   * job.stop();
   */
  public schedule ( expr: CronInput, callback: () => void, options?: ScheduleOptions ) : ScheduleController {
    const parsed = typeof expr === 'string' ? CronScheduler.parser.parse( expr ) : expr;
    const timezone = options?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
    const handlers: Record< ScheduleEvent, Set< EventHandler > > = {
      tick: new Set(), error: new Set(), stopped: new Set()
    };

    let id: ReturnType< typeof setTimeout > | undefined;
    let stopped = false, cursor = new Date();

    // Emit an event to all registered handlers for that event type
    const emit = ( event: ScheduleEvent, ...args: any[] ) => {
      for ( const h of handlers[ event ] ) try { h( ...args ) } catch {}
    };

    // Stop scheduled events immediately
    const stop = () => {
      if ( stopped ) return; stopped = true;
      if ( id !== undefined ) clearTimeout( id ), id = undefined;
      emit( 'stopped' );
    };

    // Schedule the next occurrence of the cron expression
    const scheduleNext = () => {
      if ( stopped ) return;

      try {
        const next = CronScheduler.calculator.next( parsed, { timezone, after: cursor } );
        if ( ! next.length ) return stop();

        cursor = next[ 0 ];
        const now = Date.now(), delay = cursor.getTime() - now;

        id = setTimeout( delay < 0 ? scheduleNext : () => {
          if ( stopped ) return;

          try { emit( 'tick' ), callback() }
          catch ( err ) { emit( 'error', err ) }

          scheduleNext();
        }, Math.max( delay, 1 ) );

      } catch ( err ) {
        emit( 'error', err );
      }
    };

    // Handle "@reboot": fire once immediately
    if ( typeof expr === 'string' && expr.trim().toLowerCase() === '@reboot' ) {
      try { emit( 'tick' ), callback() }
      catch ( err ) { emit( 'error', err ) }

      stop();
    } else {
      scheduleNext();
    }
  }
}
