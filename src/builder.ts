/**
 * CronBuilder
 * Create a cron expression using a immutable fluent builder.
 */

import { CRON_DEFAULTS, FIELD_BY_NAME } from './const';
import { CronParser } from './parser';
import type { CronFieldName, CronObject, CronTuple, FieldDefinition, SpecialAlias } from './types';

/** Immutable fluent builder for cron expressions. */
export class CronBuilder {
  private static parser = CronParser.getInstance();

  private readonly state: CronObject;
  private readonly field?: CronFieldName;

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

  private constructor ( state: CronObject, field?: CronFieldName ) {
    this.state = { ...state }, this.field = field;
  }

  /** Get the currently selected field definition. */
  private get def () : FieldDefinition {
    if ( ! this.field ) throw new Error( 'No cron field selected.' );
    return FIELD_BY_NAME[ this.field ];
  }

  /** Output as standard 5-field cron expression string. */
  public toString () : string {
    return Object.values( this.state ).join( ' ' );
  }

  /** Output as structured cron object. */
  public toObject () : CronObject {
    return this.state;
  }

  /* Output as ordered cron tuple. */
  public toTuple () : CronTuple {
    return Object.values( this.state ) as unknown as CronTuple;
  }
}
