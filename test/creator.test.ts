import { expect, summary, test } from './util';
import { create, fromObject, fromTuple } from '../src';

console.log( '=== CREATOR ===' );

test( 'create', () => {
  expect( create( '5', '12', '*', 'JAN', 'MON' ) ).toBe( '5 12 * JAN MON' );
} );

test( 'fromObject', () => {
  expect( fromObject( { minute: '5', month: 'DEC' } ) ).toBe( '5 * * DEC *' );
} );

test( 'fromTuple', () => {
  expect( fromTuple( [ '5', '12', '*', 'JAN', 'MON' ] ) ).toBe( '5 12 * JAN MON' );
} );

summary();
