/**
 * Parser
 * Parses and validates cron expressions.
 */

import { FIELD_BY_NAME, FIELD_COUNT, FIELD_NAMES, SPECIAL_ALIASES } from './const';
import type {
  CronFieldName, CronObject, CronTuple, ParsedCronExpression, ParsedField,
  ParsedFieldComponent, SpecialAlias
} from './types';

/**
 * Parses and validates cron expressions into structured objects.
 * 
 * @example
 * const parser = new CronParser();
 * const parsed = parser.parse( '0 9 * * MON' );
 * const valid = parser.validate( '0 9 * * MON' );
 */
export class Parser {
  private static readonly SPLIT = /\s+/;

  /** Split a cron expression string into its five field tokens. */
  private splitFields ( expression: string ) : CronTuple {
    const parts = expression.trim().split( Parser.SPLIT );

    if ( parts.length !== FIELD_COUNT )
      throw new Error( `Expected ${ FIELD_COUNT } fields, got ${ parts.length } in "${ expression }"` );

    return parts as unknown as CronTuple;
  }

  /** Expand a special alias into its 5-field equivalent. */
  private expandAlias ( expression: string ) : string {
    const trimmed = expression.trim().toLowerCase();
    if ( trimmed in SPECIAL_ALIASES ) return SPECIAL_ALIASES[ trimmed as SpecialAlias ];
    return expression.trim();
  }

  /** Expand a named alias (e.g. JAN) to its numeric value for the given field. */
  private resolveAlias ( token: string, fieldName: CronFieldName ) : string {
    const def = FIELD_BY_NAME[ fieldName ];
    if ( ! def ) return token;

    const upper = token.toUpperCase();
    if ( def.aliases[ upper ] !== undefined ) return String( def.aliases[ upper ] );

    return token;
  }

  /** Parse a single field token into components. */
  private parseFieldToken ( token: string, fieldName: CronFieldName ) : ParsedFieldComponent[] {
    const def = FIELD_BY_NAME[ fieldName ];
    const components: ParsedFieldComponent[] = [];
    const segments = token.split( ',' );

    for ( const segment of segments ) {
      let rangePart = segment, step = 1;
      const slashIdx = rangePart.indexOf( '/' );

      if ( slashIdx !== -1 ) {
        const stepStr = rangePart.substring( slashIdx + 1 ).trim();
        step = parseInt( stepStr, 10 );

        if ( isNaN( step ) || step < 1 )
          throw new Error( `Invalid step "${ stepStr }" in field "${ fieldName }"` );

        rangePart = rangePart.substring( 0, slashIdx ).trim();
      }

      let start: number, end: number;

      if ( rangePart === '*' ) start = def.min, end = def.max;
      else if ( rangePart.includes( '-' ) ) {
        const parts = rangePart.split( '-' );

        if ( parts.length !== 2 )
          throw new Error( `Invalid range "${ rangePart }" in field "${ fieldName }"` );

        const resolvedStart = this.resolveAlias( parts[ 0 ].trim(), fieldName );
        const resolvedEnd = this.resolveAlias( parts[ 1 ].trim(), fieldName );
        start = parseInt( resolvedStart, 10 ), end = parseInt( resolvedEnd, 10 );

        if ( isNaN( start ) || isNaN( end ) )
          throw new Error( `Non-numeric range "${ rangePart }" in field "${ fieldName }"` );
      } else {
        const resolved = this.resolveAlias( rangePart.trim(), fieldName );
        start = parseInt( resolved, 10 ), end = start;

        if ( isNaN( start ) )
          throw new Error( `Non-numeric value "${ rangePart }" in field "${ fieldName }"` );
      }

      components.push( { start, end, step } );
    }

    return components;
  }

  /** Compute the full set of matching integers from parsed components. */
  private computeValues ( components: ParsedFieldComponent[], fieldName: CronFieldName ) : Set< number > {
    const def = FIELD_BY_NAME[ fieldName ], values = new Set< number >();

    for ( const comp of components ) for ( let v = comp.start; v <= comp.end; v += comp.step )
      values.add( v );

    return values;
  }

  /** Validate that all computed values fall within the field's allowed range. */
  private validateValues ( values: Set< number >, fieldName: CronFieldName ) : void {
    const def = FIELD_BY_NAME[ fieldName ];

    for ( const v of values ) if ( v < def.min || v > def.max )
      throw new Error( `Value ${ v } out of range [${ def.min }-${ def.max }] for field "${ fieldName }"` );
  }

  /**
   * Parse a cron expression string into a structured CronObject.
   * 
   * @param expression - A standard 5-field cron string or special alias.
   * @returns A CronObject with each field's raw string value.
   * @throws Error if the expression is malformed.
   * 
   * @example
   * parser.parse( '0 9 * * MON' );
   */
  public parse ( expression: string ) : CronObject {
    const [ minute, hour, dayOfMonth, month, dayOfWeek ] = this.splitFields( this.expandAlias( expression ) );
    return { minute, hour, dayOfMonth, month, dayOfWeek };
  }

  /**
   * Parse a cron expression into a fully resolved internal representation
   * with pre-computed value sets for efficient matching.
   * 
   * @param expression - A standard 5-field cron string or special alias.
   * @returns A ParsedCronExpression with computed value sets.
   * @throws Error if the expression is malformed or contains out-of-range values.
   */
  public parseFull ( expression: string ) : ParsedCronExpression {
    const tokens = this.splitFields( this.expandAlias( expression ) );
    const fields = {} as Record< CronFieldName, ParsedField >;

    for ( let i = 0; i < FIELD_COUNT; i++ ) {
      const fieldName = FIELD_NAMES[ i ], token = tokens[ i ];
      const components = this.parseFieldToken( token, fieldName );
      const values = this.computeValues( components, fieldName );
      this.validateValues( values, fieldName );
      fields[ fieldName ] = { name: fieldName, components, values };
    }

    return { fields, source: expression };
  }

  /**
   * Validate a cron expression without throwing.
   * 
   * @param expression - The cron expression to validate.
   * @returns true if valid, false otherwise.
   * 
   * @example
   * parser.validate( '0 9 * * MON' );  // true
   * parser.validate( '99 * * * *' );   // false
   */
  public validate ( expression: string ) : boolean {
    try { return this.parseFull( expression ) && true }
    catch { return false }
  }
}
