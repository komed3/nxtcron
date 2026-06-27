/**
 * Test Utility
 * Minimal test utility.
 */

let passed = 0, failed = 0;

/** Register and execute a test case. */
export function test ( name: string, fn: () => void ) : void {
  const t = performance.now();

  try {
    fn(), passed++;
    console.log( `✓ ${ name }` );
  } catch ( err ) {
    failed++;
    console.error( `✗ ${ name }` );
    console.error( err );
  } finally {
    console.log(`✓ ${ name } (${ ( performance.now() - t ).toFixed( 2 ) } ms)` );
  }
}

/** Create an expectation wrapper. */
export function expect < T > ( actual: T ) {
  return {
    /** Assert strict equality. */
    toBe ( expected: T ) : void {
      if ( actual !== expected )
        throw new Error( `Expected ${ expected }, received ${ actual }` );
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
export function summary () : void {
  console.log();
  console.log( `Passed: ${ passed }` );
  console.log( `Failed: ${ failed }` );
  console.log( `Total : ${ passed + failed }` );

  if ( failed ) process.exitCode = 1;
}
