/**
 * CronCalculator
 * Computes next and previous execution times using a jump-based scheduling algorithm.
 * Designed for O(log n) per field resolution using pre-sorted value sets.
 */

import { CronParser } from './parser';
import type { CronInput, DateParts, ParsedCronExpression, RunOptions } from './types';

/** Computes next/previous scheduled run times for cron expressions. */
export class CronCalculator {
  private static readonly parser = CronParser.getInstance();
  private static instance?: CronCalculator;

  /** Get the CronCalculator instance. */
  public static getInstance () : CronCalculator {
    return this.instance ??= new CronCalculator();
  }

  private constructor() {}

  /** Resolve string or parsed expression into ParsedCronExpression. */
  private resolve ( input: CronInput ) : ParsedCronExpression {
    return typeof input === 'string' ? CronCalculator.parser.parse( input ) : input;
  }

  /** Binary search: lower bound (first >= x). */
  private lower ( arr: readonly number[], x: number ) : number {
    let i = 0, len = arr.length;

    while ( i < len ) {
      const m = ( i + len ) >> 1;
      if ( arr[ m ] < x ) i = m + 1;
      else len = m;
    }

    return i;
  }

  /** Binary search: upper bound (last <= x). */
  private upper ( arr: readonly number[], x: number ) : number {
    let i = 0, len = arr.length;

    while ( i < len ) {
      const m = ( i + len ) >> 1;
      if ( arr[ m ] <= x ) i = m + 1;
      else len = m;
    }

    return len - 1;
  }

  /**
   * Returns only the relevant candidates using binary search jumps.
   * No full array scans, no filtering, no allocation loops.
   */
  private pick ( arr: readonly number[], min: number, max: number, cur: number, lvl: boolean, dir: 1 | -1 ) : readonly number[] {
    if ( ! arr.length ) return [];

    const start = lvl ? ( dir === 1 ? cur + 1 : cur - 1 ) : ( dir === 1 ? min : max );
    const idx = dir === 1 ? this.lower( arr, start ) : this.upper( arr, start );
    const out: number[] = [];

    if ( dir === 1 ) for ( let i = idx; i < arr.length; i++ ) {
      const value = arr[ i ];
      if ( value > max ) break;
      out.push( value );
    }

    else for ( let i = idx; i >= 0; i-- ) {
      const value = arr[ i ];
      if ( value < min ) break;
      out.push( value );
    }

    return out;
  }

  /** Cron day matching logic (DOM + DOW semantics). */
  private match ( parsed: ParsedCronExpression, dom: number, dow: number ) : boolean {
    const day = parsed.fields.dayOfMonth;
    const dayOfWeek = parsed.fields.dayOfWeek;

    return ( day.wildcard || dayOfWeek.wildcard )
      ? day.values.has( dom ) || dayOfWeek.values.has( dow )
      : day.values.has( dom ) && dayOfWeek.values.has( dow );
  }

  /** Extract timezone-safe date parts. */
  private parts ( date: Date, tz: string ) : DateParts {
    const f = new Intl.DateTimeFormat( 'en-US', {
      timeZone: tz, year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric', hour12: false
    } ).formatToParts( date );

    const g = ( t: string ) => Number( f.find( p => p.type === t )?.value ?? 0 );

    return {
      year: g( 'year' ), month: g( 'month' ), day: g( 'day' ),
      hour: g( 'hour' ) % 24, minute: g( 'minute' )
    };
  }

  /**
   * Core jump-based scheduler.
   * Walks year → month → day → hour → minute using binary search jumps.
   */
  private step ( parsed: ParsedCronExpression, from: Date, tz: string, dir: 1 | -1 ) : Date | null {
    const p = this.parts( from, tz );

    for ( let year = p.year; dir === 1 ? year <= p.year + 4 : year >= p.year - 4; year += dir ) {
      const months = this.pick( parsed.fields.month.sorted, 1, 12, p.month, year === p.year, dir );
      if ( ! months.length ) return null;

      for ( let mi = 0; mi < months.length; mi++ ) {
        const month = months[ mi ], maxDay = this.daysInMonth( year, month ), days = this.pick(
          parsed.fields.dayOfMonth.sorted, 1, maxDay, p.day, year === p.year && month === p.month, dir
        );

        if ( ! days.length ) continue;

        for ( let di = 0; di < days.length; di++ ) {
          const day = days[ di ];
          if ( ! this.match( parsed, day, this.dow( year, month, day ) ) ) continue;

          const hours = this.pick(
            parsed.fields.hour.sorted, 0, 23, p.hour,
            year === p.year && month === p.month && day === p.day,
            dir
          );

          if ( ! hours.length ) continue;

          for ( let hi = 0; hi < hours.length; hi++ ) {
            const hour = hours[ hi ], minutes = this.pick(
              parsed.fields.minute.sorted, 0, 59, p.minute,
              year === p.year && month === p.month && day === p.day && hour === p.hour,
              dir
            );

            for ( let mi2 = 0; mi2 < minutes.length; mi2++ ) {
              const minute = minutes[ mi2 ];

              if ( this.valid( year, month, day, hour, minute, p, dir ) )
                return this.build( year, month, day, hour, minute, tz );
            }
          }
        }
      }
    }

    return null;
  }

  /** Shared execution loop for next/prev. */
  private run ( expr: CronInput, opt: RunOptions, dir: 1 | -1 ) : Date[] {
    const tz = opt.timezone ?? 'UTC', count = opt.count ?? 1;
    const parsed = this.resolve( expr );

    let cur = ( dir === 1 ? opt.after : opt.before ) ?? new Date();
    const out: Date[] = [];

    for ( let i = 0; i < count; i++ ) {
      const next = this.step( parsed, cur, tz, dir );
      if ( ! next ) break;

      out.push( next );
      cur = new Date( next.getTime() + dir * 60000 );
    }

    return out;
  }

  /**
   * Compute next N execution times.
   * 
   * @param expr - Cron string or pre-parsed expression
   * @param options - Run options (timezone, after, count)
   * 
   * @example
   * calc.next( '0 9 * * MON', { count: 3, timezone: 'UTC' } );
   */
  public next ( expr: CronInput, options: RunOptions = {} ) : Date[] {
    return this.run( expr, options, 1 );
  }

  /**
   * Compute previous N execution times.
   * 
   * @param expr - Cron string or pre-parsed expression
   * @param options - Run options (timezone, before, count)
   * 
   * @example
   * calc.prev( '0 9 * * MON', { count: 3 } );
   */
  public prev ( expr: CronInput, options: RunOptions = {} ) : Date[] {
    return this.run( expr, options, -1 );
  }
}
