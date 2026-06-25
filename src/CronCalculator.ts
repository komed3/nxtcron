/**
 * CronCalculator
 * Computes next and previous run times for cron expressions.
 * Uses Intl.DateTimeFormat for all timezone handling (zero external deps).
 */

import { CronParser } from './CronParser';

/**
 * CronCalculator computes next/previous scheduled run times for cron expressions.
 * 
 * @example
 * const calc = new CronCalculator();
 * calc.getNextRun( '0 9 * * MON', { timezone: 'America/New_York' } );
 * calc.getNextRuns( '0 9 * * 1-5', { after: new Date(), count: 5 } );
 */
export class CronCalculator {
  private readonly parser: CronParser;
  constructor() { this.parser = new CronParser() }
}
