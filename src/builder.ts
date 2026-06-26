/**
 * CronBuilder
 * Create a cron expression using a immutable fluent builder.
 */

import { CRON_DEFAULTS, FIELD_BY_NAME, FIELD_NAMES } from './const';
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
    return FIELD_BY_NAME[ this.requireField() ];
  }

  /** Ensure a cron field has been selected. */
  private requireField () : CronFieldName {
    if ( ! this.field ) throw new Error( 'No cron field selected.' );
    return this.field;
  }

  /** Create a new builder with updated state. */
  private next ( state: Partial< CronObject > = {}, current?: CronFieldName ) : CronBuilder {
    return new CronBuilder( { ...this.state, ...state }, current ?? this.field );
  }

  /** Normalize any input into a cron field expression string. */
  private normalizeValue ( value: string | number ) : string {
    if ( typeof value === 'number' ) return String( value );

    const key = value.toUpperCase(), alias = this.def.aliases[ key ];
    return alias !== undefined ? String( alias ) : key;
  }

  /** Validate a cron field value against its allowed range. */
  private validateValue ( value: number ) : number {
    const { min, max } = this.def;

    if ( value < min || value > max )
      throw new Error( `Invalid value ${ value } for ${ this.requireField() } (${ min }-${ max })` );

    return value;
  }

  /** Build a field expression string. */
  private buildExpr ( values: ( string | number )[] ) : string {
    return values.map( v => this.normalizeValue( v ) ).join( ',' );
  }

  /** Update the current cron field. */
  private set ( expr: string ) : CronBuilder {
    return this.next( { [ this.requireField() ] : expr } );
  }

  /** Select the minute field. */
  public minute () : CronBuilder {
    return this.next( {}, 'minute' );
  }

  /** Select the hour field. */
  public hour () : CronBuilder {
    return this.next( {}, 'hour' );
  }

  /** Select the day of month field. */
  public dayOfMonth () : CronBuilder {
    return this.next( {}, 'dayOfMonth' );
  }

  /** Select the month field. */
  public month () : CronBuilder {
    return this.next( {}, 'month' );
  }

  /** Select the day of week field. */
  public dayOfWeek () : CronBuilder {
    return this.next( {}, 'dayOfWeek' );
  }

  /** Set explicit value(s). */
  public value ( ...values: ( string | number )[] ) : CronBuilder {
    return this.set( this.buildExpr( values ) );
  }

  /** Set full list (alias for value). */
  public list ( ...values: ( string | number )[] ) : CronBuilder {
    return this.set( this.buildExpr( values ) );
  }

  /** Define a range (min -> max). */
  public range ( from: number, to: number ) : CronBuilder {
    return this.set( `${ this.validateValue( from ) }-${ this.validateValue( to ) }` );
  }

  /** Define step expression. */
  public every ( step: number, range?: [ number, number ] ) : CronBuilder {
    if ( step <= 0 ) throw new Error( 'Step must be > 0' );
    if ( ! range ) return this.set( `*/${ step }` );

    const [ from, to ] = range;
    return this.set( `${ this.validateValue( from ) }-${ this.validateValue( to ) }/${ step }` );
  }

  /** Output as structured cron object. */
  public toObject () : CronObject {
    return { ...this.state };
  }

  /* Output as ordered cron tuple. */
  public toTuple () : CronTuple {
    return FIELD_NAMES.map( f => this.state[ f ] ) as unknown as CronTuple;
  }

  /** Output as standard 5-field cron expression string. */
  public toString () : string {
    return this.toTuple().join( ' ' );
  }
}
