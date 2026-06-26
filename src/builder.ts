/**
 * CronBuilder
 * Create a cron expression using a immutable fluent builder.
 */

import { CRON_DEFAULTS } from './const';
import { CronParser } from './parser';
import type { CronFieldName, CronObject, CronTuple, SpecialAlias } from './types';

/** Immutable fluent builder for cron expressions. */
export class CronBuilder {
  private static parser = CronParser.getInstance();

  private readonly fields: CronObject;
  private readonly current?: CronFieldName;

  /**
   * Create a builder instance from a optional cron expression.
   * 
   * @param expr - Optional standard 5-field cron string, a partial cron object or special alias.
   * @returns The current cron builder instance.
   * 
   * @example
   * CronBuilder.create()
   * CronBuilder.create( '0 2 0 JAN MON-FRI' )
   * CronBuilder.create( { minute: '30', hour: '1' } )
   * CronBuilder.create( '@daily' )
   */
  public static create ( expr?: string | SpecialAlias | Partial< CronObject > ) : CronBuilder {
    return new CronBuilder( expr ? typeof expr === 'string' ? CronBuilder.parser.toObject( expr )
      : { ...CRON_DEFAULTS, ...expr } : CRON_DEFAULTS );
  }

  private constructor ( fields: CronObject, current?: CronFieldName ) {
    this.fields = { ...fields }, this.current = current;
  }
}
