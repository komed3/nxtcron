/**
 * Core type definitions for the cronxt package.
 */

/** Names of the five standard cron fields in order. */
export type CronFieldName = 'minute' | 'hour' | 'dayOfMonth' | 'month' | 'dayOfWeek';

/** Special cron alias names. */
export type SpecialAlias = '@yearly' | '@annually' | '@monthly' | '@weekly' | '@daily' | '@midnight' | '@hourly';

/** Metadata for a single cron field definition. */
export interface FieldDefinition {
  name: CronFieldName;
  min: number;
  max: number;
  aliases: Record< string, number >;
}

/** A parsed cron expression represented as an object with named fields. */
export interface CronObject {
  /** Minute field (0-59) */
  minute: string;
  /** Hour field (0-23) */
  hour: string;
  /** Day of month field (1-31) */
  dayOfMonth: string;
  /** Month field (1-12 or JAN-DEC) */
  month: string;
  /** Day of week field (0-6 or MON-SUN, 0 = Sunday) */
  dayOfWeek: string;
}

/** Options for creating a cron expression from structured values. */
export interface CronOptions extends Partial< CronObject > {}

/** Options for next/previous run calculations. */
export interface RunOptions {
  /** IANA timezone string (e.g. 'America/New_York'). Defaults to UTC. */
  timezone?: string;
  /** Reference date after which to find the next run. Defaults to now. */
  after?: Date;
  /** Reference date before which to find the previous run. Defaults to now. */
  before?: Date;
}

/** Options for the schedule method. */
export interface ScheduleOptions {
  /** IANA timezone string (e.g. 'UTC'). Defaults to local system timezone. */
  timezone?: string;
}

/** Events emitted by a ScheduleController. */
export type ScheduleEvent = 'tick' | 'error' | 'stopped';

/** Controller returned by schedule() for managing a scheduled job. */
export interface ScheduleController {
  /** Stop the scheduled job. No further callbacks will fire. */
  stop () : void;
  /** Register an event handler. */
  on ( event: ScheduleEvent, handler: ( ...args: any[] ) => void ) : ScheduleController;
  /** Remove an event handler. */
  off ( event: ScheduleEvent, handler: ( ...args: any[] ) => void ) : ScheduleController;
}

/** @internal A parsed cron field component (range with step). */
export interface ParsedFieldComponent {
  start: number;
  end: number;
  step: number;
}

/** @internal A fully parsed cron field with pre-computed value set. */
export interface ParsedField {
  name: CronFieldName;
  components: ParsedFieldComponent[];
  values: Set< number >;
}

/** @internal A fully parsed cron expression. */
export interface ParsedCronExpression {
  fields: Record< CronFieldName, ParsedField >;
  source: string;
}
