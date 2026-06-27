import { parse, toObject, toTuple, validate } from '../src';
import { expect, hl, summary, test } from './util';

hl( 'PARSER' );

test( 'validate valid expression', () => {
  expect( validate( '*/5 2 * JAN MON-FRI' ) ).toBe( true );
} );

test( 'validate invalid expression', () => {
  expect( validate( '70 * * * *' ) ).toBe( false );
} );

test( 'parse wildcard', () => {
  const expr = parse( '* * * * *' );

  expect( expr.fields.minute.sorted.length ).toBe( 60 );
  expect( expr.fields.hour.sorted.length ).toBe( 24 );
} );

test( 'toObject', () => {
  expect( toObject( '5 12 * JAN MON' ) ).toEqual( {
    minute: '5', hour: '12', dayOfMonth: '*', month: 'JAN', dayOfWeek: 'MON' } );
} );

test( 'toTuple', () => {
  expect( toTuple( '5 12 * JAN MON' ) ).toEqual( [ '5', '12', '*', 'JAN', 'MON' ] );
} );

summary();
