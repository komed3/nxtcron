# nxtcron

**A zero-dependency TypeScript toolkit for creating, parsing, validating, scheduling and calculating standard five-field cron expressions.**

The package consists of several independent modules that can be used together or individually:

- Create cron expressions from values, tuples or objects
- Build expressions using an immutable fluent API
- Parse and validate cron expressions
- Calculate timezone-aware previous and next execution times
- Schedule callbacks from cron expressions

For the complete API reference, see the [project documentation](https://komed3.github.io/nxtcron).

## Installation

Install via the npm registry:

```bash
npm install nxtcron
```

Or use the browser bundle via CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/nxtcron/dist/nxtcron.js"></script>
```

## Quick Start

```ts
import { next } from 'nxtcron';

const runs = next( '0 9 * * MON-FRI', {
  count: 5,
  after: new Date( '2030-01-01' ),
  timezone: 'Europe/Berlin'
} );
```

## API

### Builder

Create cron expressions using the immutable fluent builder API.

```ts
import { build } from 'nxtcron';

const expr = build()
  .minute().every( 15 )
  .hour().range( 8, 18 )
  .dayOfWeek().list( 'MON', 'TUE', 'WED', 'THU', 'FRI' )
  .toString();

// */15 8-18 * * 1,2,3,4,5
```

### Parsing

Parse and fully validate a cron expression.

```ts
import { parse, validate } from 'nxtcron';

const ok = validate( '0 12 * * MON' ); // true
const parsed = parse( '0 12 * * MON' );
```

### Creating Expressions

Create a cron expression from individual field values, an ordered field tuple or the structured cron object.

```ts
import { create, fromObject, fromTuple } from 'nxtcron';

create( '0', '12', '*', '*', 'MON' );
fromObject( { minute: '0', hour: '12', dayOfWeek: 'MON' } );
fromTuple( [ '0', '12', '*', '*', 'MON' ] );
```

### Calculating Execution Times

Calculate the next and previous scheduled execution time(s).

```ts
import { next, prev } from 'nxtcron';

next( '*/30 * * * *', { count: 5 } );
prev( '0 0 1 * *', { before: new Date( '2020-06-01' ) } );
```

### Scheduling

Schedule recurring executions using a cron expression.

```ts
import { schedule } from 'nxtcron';

const job = schedule( '0 * * * *', () => console.log( 'Executed' ) );
job.stop();
```

### Namespace Import

The complete API is also available through the exported namespace.

```ts
import nxtcron from 'nxtcron';

const expr = nxtcron.build().minute().every( 5 ).toString();
const parsed = nxtcron.parse( expr );
const runs = nxtcron.next( expr );
```

## Documentation

The generated [API documentation](https://komed3.github.io/nxtcron) contains the complete reference for all exported classes, functions and types.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.  
© Copyright 2026 Paul Köhler (komed3).
