/**
 * CronScheduler
 * Schedules callbacks on a cron schedule using setTimeout.
 */

import { CronCalculator } from './calculator';
import type { ScheduleController, ScheduleEvent, ScheduleOptions } from './types';

/** CronScheduler schedules callbacks to run according to a cron expression. */
export class CronScheduler {
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
   * @param expression - A standard 5-field cron string or special alias.
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
  public schedule ( expression: string, callback: () => void, options?: ScheduleOptions ) : ScheduleController {}
}
