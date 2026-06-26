/**
 * CronBuilder
 * Builds cron expressions using a immutable fluent design.
 */

import { CRON_DEFAULTS } from './const';
import { CronParser } from './parser';
import type { CronFieldName, CronObject, SpecialAlias } from './types';

/** Immutable fluent builder for cron expressions. */
export class CronBuilder {
  private static parser = CronParser.getInstance();

  private readonly fields: CronObject;
  private readonly current?: CronFieldName;

  /** Create a builder instance from a optional cron expression. */
  public static create ( expr?: string | SpecialAlias | CronObject ) : CronBuilder {
    return new CronBuilder( expr ? typeof expr === 'string' ? CronBuilder.parser.toObject( expr ) : expr : CRON_DEFAULTS );
  }

  private constructor ( fields: CronObject, current?: CronFieldName ) {
    this.fields = { ...fields }, this.current = current;
  }
}
