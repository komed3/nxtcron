/**
 * CronCalculator
 * Computes next and previous execution times using a jump-based scheduling algorithm.
 * Designed for O(log n) per field resolution using pre-sorted value sets.
 */

import { CronParser } from './parser';
import type { CronInput, ParsedCronExpression, RunOptions } from './types';

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
        const month = months[ mi ];
        const maxDay = this.daysInMonth( year, month );
        const days = this.pick(
          parsed.fields.dayOfMonth.sorted, 1, maxDay, p.day,
          year === p.year && month === p.month,
          dir
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
            const hour = hours[ hi ];
            const minutes = this.pick(
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
