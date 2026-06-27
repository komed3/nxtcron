/**
 * Test Utility
 * Minimal test utility for nxtcron library.
 */

let passed = 0, failed = 0;

/** Register and execute a test case. */
export function test ( name: string, fn: () => void ) : void {
  const t = performance.now();
  const s = () => ( performance.now() - t ).toFixed( 3 );

  try {
    fn(), passed++;
    console.log( `✓ ${ name } (${ s() } ms)` );
  } catch ( err ) {
    failed++;
    console.error( `✗ ${ name } (${ s() } ms)` );
    console.error( err );
  }
}

/** Create an expectation wrapper. */
export function expect < T > ( actual: T ) {
  return {
    /** Assert strict equality. */
    toBe ( expected: T ) : void {
      if ( actual !== expected ) throw new Error( `Expected ${ expected }, received ${ actual }` );
    },

    /** Assert deep equality. */
    toEqual ( expected: T ) : void {
      if ( JSON.stringify( actual ) !== JSON.stringify( expected ) )
        throw new Error( `Expected ${ JSON.stringify( expected ) }, received ${ JSON.stringify( actual ) }` );
    },

    /** Assert function throws. */
    toThrow () : void {
      try { ( actual as unknown as () => void )() }
      catch { return }

      throw new Error( 'Expected function to throw.' );
    }
  };
}

/** Print test summary. */
export function summary () : boolean {
  console.log();
  console.log( `Passed :: ${ passed.toString().padStart( 4, ' ' ) }` );
  console.log( `Failed :: ${ failed.toString().padStart( 4, ' ' ) }` );
  console.log( `Total  :: ${ ( passed + failed ).toString().padStart( 4, ' ' ) }` );

  const ok = failed === 0;
  passed = 0, failed = 0;

  return ok;
}
