import { next, prev } from '../src';
import { expect, hl, summary, test } from './util';

const after = ( iso: string ) => ( { after: new Date( iso ) } );
const before = ( iso: string ) => ( { before: new Date( iso ) } );

hl( 'CALCULATOR' );

test( 'next minute', () => {
  expect( next( '* * * * *', after( '2026-06-26T18:32:11Z' ) )[ 0 ].toISOString() ).toBe(
    '2026-06-26T18:33:00.000Z'
  );
} );

test( 'prev minute', () => {
  expect( prev( '* * * * *', before( '2026-06-26T18:32:11Z' ) )[ 0 ].toISOString() ).toBe(
    '2026-06-26T18:31:00.000Z'
  );
} );

test( 'next step', () => {
  expect( next( '*/15 * * * *', after( '2026-06-26T18:17:00Z' ) )[ 0 ].toISOString() ).toBe(
    '2026-06-26T18:30:00.000Z'
  );
} );

test( 'hour overflow', () => {
  expect( next( '0 * * * *', after( '2026-06-26T18:59:30Z' ) )[ 0 ].toISOString() ).toBe(
    '2026-06-26T19:00:00.000Z'
  );
} );

test( 'day overflow', () => {
  expect( next( '0 0 * * *', after( '2026-06-26T23:59:59Z' ) )[ 0 ].toISOString() ).toBe(
    '2026-06-27T00:00:00.000Z'
  );
} );

test( 'month overflow', () => {
  expect( next( '0 0 1 * *', after( '2026-06-30T23:59:59Z' ) )[ 0 ].toISOString() ).toBe(
    '2026-07-01T00:00:00.000Z'
  );
} );

test( 'year overflow', () => {
  expect( next( '0 0 1 JAN *', after( '2026-12-31T23:59:59Z' ) )[ 0 ].toISOString() ).toBe(
    '2027-01-01T00:00:00.000Z'
  );
} );

test( 'weekday only', () => {
  expect( next( '15 10 * * MON', after( '2026-06-26T18:00:00Z' ) )[ 0 ].toISOString() ).toBe(
    '2026-06-29T10:15:00.000Z'
  );
} );

test( 'month aliases', () => {
  expect( next( '0 0 1 JAN,DEC *', after( '2026-06-26T00:00:00Z' ) )[ 0 ].toISOString() ).toBe(
    '2026-12-01T00:00:00.000Z'
  );
} );

test( 'leap year', () => {
  expect( next( '0 0 29 FEB *', after( '2026-06-26T00:00:00Z' ) )[ 0 ].toISOString() ).toBe(
    '2028-02-29T00:00:00.000Z'
  );
} );

test( 'multiple results', () => {
  expect( next( '*/30 * * * *', {
    ...after( '2026-06-26T18:15:00Z' ),
    count: 3
  } ).map( d => d.toISOString() ) ).toEqual( [
    '2026-06-26T18:30:00.000Z',
    '2026-06-26T19:00:00.000Z',
    '2026-06-26T19:30:00.000Z'
  ] );
} );

test( 'prev multiple', () => {
  expect( prev( '0 * * * *', {
    ...before( '2026-06-26T18:15:00Z' ),
    count: 3
  } ).map( d => d.toISOString() ) ).toEqual( [
    '2026-06-26T18:00:00.000Z',
    '2026-06-26T17:00:00.000Z',
    '2026-06-26T16:00:00.000Z'
  ] );
} );

test( 'timezone UTC', () => {
  expect( next( '0 2 * * *', {
    ...after( '2026-06-26T18:00:00Z' ),
    timezone: 'UTC'
  } )[ 0 ].toISOString() ).toBe(
    '2026-06-27T02:00:00.000Z'
  );
} );

test( 'timezone Europe/Berlin', () => {
  expect( next( '0 2 * * *', {
    ...after( '2026-06-26T18:00:00Z' ),
    timezone: 'Europe/Berlin'
  } )[ 0 ].toISOString() ).toBe(
    '2026-06-27T00:00:00.000Z'
  );
} );

test( 'DST transition', () => {
  expect( next( '30 2 * * *', {
    ...after( '2026-10-24T22:00:00Z' ),
    timezone: 'Europe/Berlin'
  } )[ 0 ].toISOString() ).toBe(
    '2026-10-25T01:30:00.000Z'
  );
} );

test( 'stress tests', () => {
  expect( next( '*/3 2-23 * * MON-FRI', { count: 10000 } ).length ).toBe( 10000 );
  expect( prev( '0 0 1 1 *', { count: 10000 } ).length ).toBe( 10000 );
} );

summary();
