/**
 * Calculator
 * Computes next and previous run times for cron expressions.
 * Uses Intl.DateTimeFormat for all timezone handling (zero external deps).
 */

import { WEEKDAY_MAP } from './const';
import { CronParser } from './parser';
import type { DateParts } from './types';

/**
 * Computes next/previous scheduled run times for cron expressions.
 * 
 * @example
 * const calc = new CronCalculator();
 * calc.getNextRun( '0 9 * * MON', { timezone: 'America/New_York' } );
 * calc.getNextRuns( '0 9 * * 1-5', { after: new Date(), count: 5 } );
 */
export class CronCalculator {
  private readonly parser: CronParser;
  constructor() { this.parser = new CronParser() }

  /** Create a Date shifted by a given number of minutes. */
  private shiftDateByMinutes ( date: Date, minutes: number ) : Date {
    return new Date( date.getTime() + ( minutes * 60000 ) );
  }

  /**
   * Extract cron-relevant components from a Date in a specific timezone.
   * Uses Intl.DateTimeFormat with part extraction - no external tz libraries.
   */
  private getDatePartsInTimezone ( date: Date, tz: string ) : DateParts {
    const parts = new Intl.DateTimeFormat( 'en-US', {
      timeZone: tz, year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric', weekday: 'short', hour12: false
    } ).formatToParts( date );

    const get = ( type: string ) : string => parts.find( p => p.type === type )?.value || '';
    const int = ( type: string ) : number => parseInt( get( type ), 10 );

    return {
      year: int( 'year' ), month: int( 'month' ), dayOfMonth: int( 'day' ), hour: int( 'hour' ) % 24,
      minute: int( 'minute' ), dayOfWeek: WEEKDAY_MAP[ get( 'weekday' ) ] ?? 0
    };
  }

  /** Validate that two sets of date parts are compatible (undefined parts are ignored). */
  private validateDateParts ( a: Partial< DateParts >, b: Partial< DateParts > ) : boolean {
    for ( const key of [ 'year', 'month', 'dayOfMonth', 'hour', 'minute', 'dayOfWeek' ] as ( keyof DateParts )[] )
      if ( a[ key ] !== undefined && b[ key ] !== undefined && a[ key ] !== b[ key ] )
        return false;

    return true;
  }

  /**
   * Build a UTC Date from wall-clock components in a given timezone.
   * Uses Intl to find the exact UTC instant that produces the desired
   * wall-clock time in the target timezone.
   */
  private buildDateFromParts ( year: number, month: number, day: number, hour: number, minute: number, tz: string ) : Date {
    const approx = new Date( Date.UTC( year, month - 1, day, hour, minute, 0, 0 ) );
    const parts = this.getDatePartsInTimezone( approx, tz );
    const offsetMs = ( parts.hour - hour ) * 3.6e6 + ( parts.minute - minute ) * 6e4 +
      ( parts.dayOfMonth - day ) * 8.64e7 + ( parts.month - month ) * 2.592e9;

    const candidate = new Date( approx.getTime() - offsetMs );
    const v = this.getDatePartsInTimezone( candidate, tz );

    if ( this.validateDateParts( { hour, minute, dayOfMonth: day, month }, v ) ) return candidate;

    // Fallback: scan nearby minutes
    for ( let delta = -7200000; delta <= 7200000; delta += 60000 ) {
      const d = new Date( approx.getTime() + delta );
      const p = this.getDatePartsInTimezone( d, tz );

      if ( this.validateDateParts( { year, month, dayOfMonth: day, hour, minute }, p ) ) return d;
    }

    return candidate;
  }

  /** Return the number of days in a given month (1-indexed). Handles leap years. */
  private daysInMonth ( year: number, month: number ) : number {
    return new Date( year, month, 0 ).getDate();
  }

  /** Compute the day of the week (0=Sun, 6=Sat) for a given date. */
  private dayOfWeek ( year: number, month: number, day: number ) : number {
    return new Date( year, month - 1, day ).getDay();
  }
}
