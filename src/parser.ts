/**
 * CronParser
 * Parses and validates cron expressions.
 */

import { FIELD_BY_NAME, FIELD_COUNT, FIELD_NAMES, SPECIAL_ALIASES } from './const';
import type {
  CronFieldName, CronObject, CronTuple, ParsedCronExpression, ParsedField,
  ParsedFieldComponent, SpecialAlias
} from './types';

/** Parses and validates cron expressions into structured objects. */
export class CronParser {
  private static readonly SPLIT = /\s+/;
  private static instance?: CronParser;

  /** Get the CronParser instance. */
  public static getInstance () : CronParser {
    return CronParser.instance ??= new CronParser();
  }

  private constructor () {}

  /** Expand a special alias into its 5-field equivalent. */
  private expandAlias ( expr: string ) : string {
    const trimmed = expr.trim().toLowerCase();
    if ( trimmed in SPECIAL_ALIASES ) return SPECIAL_ALIASES[ trimmed as SpecialAlias ];
    return expr.trim();
  }

  /** Split a cron expression string into its five field tokens. */
  private splitFields ( expr: string ) : CronTuple {
    const parts = expr.trim().split( CronParser.SPLIT );

    if ( parts.length !== FIELD_COUNT )
      throw new Error( `Expected ${ FIELD_COUNT } fields, got ${ parts.length } in "${ expr }"` );

    return parts as unknown as CronTuple;
  }

  /** Expand a named alias (e.g. JAN) to its numeric value for the given field. */
  private resolveAlias ( token: string, fieldName: CronFieldName ) : number | string {
    const aliases = FIELD_BY_NAME[ fieldName ].aliases;
    const alias = aliases[ token.toUpperCase() ];
    return alias === undefined ? token : alias;
  }

  /** Parse a single field token into components. */
  private parseFieldToken ( token: string, fieldName: CronFieldName ) : ParsedFieldComponent[] {
    const { min, max } = FIELD_BY_NAME[ fieldName ], components: ParsedFieldComponent[] = [];

    for ( let segment of token.split( ',' ) ) {
      let step = 1;

      const slash = segment.indexOf( '/' );
      if ( slash !== -1 ) {
        step = Number( segment.slice( slash + 1 ).trim() );

        if ( Number.isNaN( step ) || step < 1 )
          throw new Error( `Invalid step "${ segment.slice( slash + 1 ).trim() }" in field "${ fieldName }"` );

        segment = segment.slice( 0, slash ).trim();
      }

      let start: number, end: number;

      if ( segment === '*' ) start = min, end = max;
      else {
        const dash = segment.indexOf( '-' );

        if ( dash === -1 ) {
          start = end = Number( this.resolveAlias( segment.trim(), fieldName ) );

          if ( Number.isNaN( start ) )
            throw new Error( `Non-numeric value "${ segment }" in field "${ fieldName }"` );
        } else {
          start = Number( this.resolveAlias( segment.slice( 0, dash ).trim(), fieldName ) );
          end = Number( this.resolveAlias( segment.slice( dash + 1 ).trim(), fieldName ) );

          if ( Number.isNaN( start ) || Number.isNaN( end ) )
            throw new Error( `Non-numeric range "${ segment }" in field "${ fieldName }"` );
        }
      }

      if ( start > end || start < min || end > max )
        throw new Error( `Invalid range "${ segment }" in field "${ fieldName }"` );

      components.push( { start, end, step } );
    }

    return components;
  }

  /** Compute and validate the full set of matching integers from parsed components. */
  private computeValues ( components: ParsedFieldComponent[], fieldName: CronFieldName ) : Set< number > {
    const { min, max } = FIELD_BY_NAME[ fieldName ], values = new Set< number >();

    for ( const { start, end, step } of components ) for ( let v = start; v <= end; v += step )
      if ( v < min || v > max )
        throw new Error( `Value ${ v } out of range [${ min }-${ max }] for field "${ fieldName }"` )
      else values.add( v );

    return values;
  }

  /**
   * Convert a cron expression into a ordered tuple.
   * 
   * @param expr - A standard 5-field cron string or special alias.
   * @returns A CronTuple with ordered cron fields
   * @throws Error if the expression is malformed.
   * 
   * @example
   * parser.toTuple( '0 1 * * SAT,SUN' );
   */
  public toTuple ( expr: string ) : CronTuple {
    return this.splitFields( this.expandAlias( expr ) );
  }

  /**
   * Convert a cron expression into a structured CronObject.
   * 
   * @param expr - A standard 5-field cron string or special alias.
   * @returns A CronObject containing the raw field values.
   * @throws Error if the expression is malformed.
   * 
   * @example
   * parser.toObject( '0 9 * * MON' );
   */
  public toObject ( expr: string ) : CronObject {
    const [ minute, hour, dayOfMonth, month, dayOfWeek ] = this.splitFields( this.expandAlias( expr ) );
    return { minute, hour, dayOfMonth, month, dayOfWeek };
  }

  /**
   * Parse a cron expression into a fully validated internal representation.
   * 
   * The returned object contains the parsed field definitions together with
   * pre-computed value sets for efficient schedule evaluation.
   * 
   * @param expr - A standard 5-field cron string or special alias.
   * @returns A fully parsed cron expression.
   * @throws Error if the expression is malformed or contains invalid values.
   * 
   * @example
   * const parsed = parser.parse( '* 9-17 * JAN,MAR MON-FRI' );
   */
  public parse ( expr: string ) : ParsedCronExpression {
    const tokens = this.splitFields( this.expandAlias( expr ) );
    const fields = {} as Record< CronFieldName, ParsedField >;

    for ( let i = 0; i < FIELD_COUNT; i++ ) {
      const fieldName = FIELD_NAMES[ i ], token = tokens[ i ];
      const { min, max } = FIELD_BY_NAME[ fieldName ];

      const components = this.parseFieldToken( token, fieldName );
      const values = this.computeValues( components, fieldName );
      const sorted = [ ...values ].sort( ( a, b ) => a - b );

      fields[ fieldName ] = {
        name: fieldName, components, values, sorted,
        min: sorted[ 0 ], max: sorted[ sorted.length - 1 ],
        wildcard: values.size === max - min + 1
      };
    }

    return { fields, source: expr };
  }

  /**
   * Validate a cron expression without throwing.
   * 
   * @param expr - The cron expression to validate.
   * @returns true if valid, false otherwise.
   * 
   * @example
   * parser.validate( '0 9 * * MON' );  // true
   * parser.validate( '99 * * * *' );   // false
   */
  public validate ( expr: string ) : boolean {
    try { return this.parse( expr ) && true }
    catch { return false }
  }
}
