import { next, prev } from '../src';
import { expect, hl, summary, test } from './util';

const after = ( iso: string ) => ( { after: new Date( iso ) } );
const before = ( iso: string ) => ( { before: new Date( iso ) } );

hl( 'CALCULATOR' );

test( 'next minute', () => {
  expect( next( '* * * * *', after( '2026-06-26T18:32:11Z' ) )[ 0 ].toISOString() ).toBe( '2026-06-26T18:33:00.000Z' );
} );

test( 'prev minute', () => {
  expect( prev( '* * * * *', before( '2026-06-26T18:32:11Z' ) )[ 0 ].toISOString() ).toBe( '2026-06-26T18:31:00.000Z' );
} );

summary();
