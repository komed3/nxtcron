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

  private readonly formatter = new Map< string, Intl.DateTimeFormat >();

  /** Get the CronCalculator instance. */
  public static getInstance () : CronCalculator {
    return this.instance ??= new CronCalculator();
  }

  private constructor () {}

  /** Resolve string or parsed expression into ParsedCronExpression. */
  private resolve ( input: CronInput ) : ParsedCronExpression {
    return typeof input === 'string' ? CronCalculator.parser.parse( input ) : input;
  }

  /** Get number of days in month. */
  private DOM ( year: number, month: number ) : number {
    return new Date( year, month, 0 ).getDate();
  }

  /** Get the day of week. */
  private DOW ( year: number, month: number, day: number ) : number {
    return new Date( year, month - 1, day ).getDay();
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

    const start = lvl ? cur : ( dir === 1 ? min : max );
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
    const { dayOfMonth: d, dayOfWeek: w } = parsed.fields;

    return d.wildcard && w.wildcard ? true : d.wildcard ? w.values.has( dow )
      : w.wildcard ? d.values.has( dom ) : d.values.has( dom ) || w.values.has( dow );
  }

  /** Validate chronological direction correctness. */
  private valid ( year: number, month: number, day: number, hour: number, minute: number, p: DateParts, dir: 1 | -1 ) : boolean {
    return dir === 1
      ? ( year > p.year || ( year === p.year && ( month > p.month || ( month === p.month && (
        day > p.day || ( day === p.day && ( hour > p.hour || ( hour === p.hour && minute > p.minute ) ) )
      ) ) ) ) )
      : ( year < p.year || ( year === p.year && ( month < p.month || ( month === p.month && (
        day < p.day || ( day === p.day && ( hour < p.hour || ( hour === p.hour && minute < p.minute ) ) )
      ) ) ) ) );
  }

  /** Format a date into timezone-aligned parts. */
  private toDateTimeParts ( tz: string, date: Date ) : Intl.DateTimeFormatPart[] {
    let formatter = this.formatter.get( tz );
    if ( ! formatter ) this.formatter.set( tz, formatter = new Intl.DateTimeFormat( 'en-US', {
      timeZone: tz, year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric', hour12: false
    } ) );

    return formatter.formatToParts( date );
  }

  /** Get date time part by key. */
  private getPart ( parts: Intl.DateTimeFormatPart[], key: string ) : number {
    return Number( parts.find( p => p.type === key )?.value ?? 0 );
  }

  /** Extract timezone-safe date parts. */
  private parts ( date: Date, tz: string ) : DateParts {
    const parts = this.toDateTimeParts( tz, date );

    return {
      year: this.getPart( parts, 'year' ), month: this.getPart( parts, 'month' ),
      day: this.getPart( parts, 'day' ), hour: this.getPart( parts, 'hour' ) % 24,
      minute: this.getPart( parts, 'minute' )
    };
  }

  /** Build UTC Date from timezone-aligned components. */
  private build ( year: number, month: number, day: number, hour: number, minute: number, tz: string ) : Date {
    const base = new Date( Date.UTC( year, month - 1, day, hour, minute ) );
    const parts = this.toDateTimeParts( tz, base );

    return new Date( base.getTime() - (
      ( this.getPart( parts, 'hour' ) - hour ) * 3.6e6 +
      ( this.getPart( parts, 'minute' ) - minute ) * 6e4 +
      ( this.getPart( parts, 'day' ) - day ) * 8.64e7
    ) );
  }

  /**
   * Core jump-based scheduler.
   * Walks year → month → day → hour → minute using binary search jumps.
   */
  private step ( parsed: ParsedCronExpression, from: Date, tz: string, dir: 1 | -1 ) : Date | null {
    const c = this.parts( from, tz );

    for ( let year = c.year; dir === 1 ? year <= c.year + 99 : year >= c.year - 99; year += dir ) {
      const months = this.pick( parsed.fields.month.sorted, 1, 12, c.month, year === c.year, dir );
      if ( ! months.length ) continue;

      for ( let mi = 0; mi < months.length; mi++ ) {
        const month = months[ mi ], maxDay = this.DOM( year, month ), days = this.pick(
          parsed.fields.dayOfMonth.sorted, 1, maxDay, c.day, year === c.year && month === c.month, dir
        );

        if ( ! days.length ) continue;

        for ( let di = 0; di < days.length; di++ ) {
          const day = days[ di ];
          if ( ! this.match( parsed, day, this.DOW( year, month, day ) ) ) continue;

          const hours = this.pick(
            parsed.fields.hour.sorted, 0, 23, c.hour,
            year === c.year && month === c.month && day === c.day,
            dir
          );

          if ( ! hours.length ) continue;

          for ( let hi = 0; hi < hours.length; hi++ ) {
            const hour = hours[ hi ], minutes = this.pick(
              parsed.fields.minute.sorted, 0, 59, c.minute,
              year === c.year && month === c.month && day === c.day && hour === c.hour,
              dir
            );

            for ( let mi2 = 0; mi2 < minutes.length; mi2++ ) {
              const minute = minutes[ mi2 ];

              if ( this.valid( year, month, day, hour, minute, c, dir ) )
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
      if ( ! next || ( out.length && next.getTime() === cur.getTime() ) ) break;

      out.push( next );
      cur = next;
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
