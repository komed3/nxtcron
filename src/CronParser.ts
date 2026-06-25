/**
 * CronParser
 * Parses and validates cron expressions.
 */

import { FIELD_BY_NAME, SPECIAL_ALIASES } from './const';
import type { CronFieldName, ParsedFieldComponent, SpecialAlias } from './types';

/**
 * CronParser parses and validates cron expressions into structured objects.
 * 
 * @example
 * const parser = new CronParser();
 * const parsed = parser.parse( '0 9 * * MON' );
 * const valid = parser.validate( '0 9 * * MON' );
 */
export class CronParser {
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

  /** Expand a special alias into its 5-field equivalent. */
  private expandAlias ( expression: string ) : string {
    const trimmed = expression.trim().toLowerCase();
    if ( trimmed in SPECIAL_ALIASES ) return SPECIAL_ALIASES[ trimmed as SpecialAlias ];
    return expression.trim();
  }
}
