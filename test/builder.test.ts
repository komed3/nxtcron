import { build } from '../src';
import { expect, hl, summary, test } from './util';

hl( 'BUILDER' );

test( 'value', () => {
  expect( build().minute().value( 5 ).toString() ).toBe( '5 * * * *' );
} );

test( 'list', () => {
  expect( build().month().list( 'JAN', 'DEC' ).toString() ).toBe( '* * * 1,12 *' );
} );

test( 'range', () => {
  expect( build().hour().range( 8, 18 ).toString() ).toBe( '* 8-18 * * *' );
} );

test( 'every', () => {
  expect( build().minute().every( 5 ).toString() ).toBe( '*/5 * * * *' );
} );

test( 'combined builder', () => {
  expect( build()
    .minute().every( 5 )
    .hour().value( 2 )
    .month().list( 'JAN', 'DEC' )
    .dayOfWeek().value( 'MON' )
    .toString()
  ).toBe( '*/5 2 * 1,12 1' );
} );

test( 'throws without field', () => {
  expect( () => build().value( 5 ) ).toThrow();
} );

test( 'throws on invalid input', () => {
  expect( () => build().month().value( 'ABC' ) ).toThrow();
  expect( () => build().hour().range( -1, 5 ) ).toThrow();
  expect( () => build().minute().every( 0 ) ).toThrow();
  expect( () => build().minute().value( 70 ) ).toThrow();
} );

summary();
