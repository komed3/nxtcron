/**
 * nxtcron
 * A lightweight, zero-dependency toolkit for creating, parsing, validating,
 * scheduling, and calculating cron expressions.
 * 
 * Designed for both browser and Node.js environments, nxtcron provides a
 * modern, immutable, fast, and fully typed API with a consistent programming
 * model across all modules. Every component is built around deterministic
 * behavior and shared internal representations, making it suitable for both
 * one-off cron operations and long-running scheduling tasks.
 * 
 * @author Paul Köhler (komed3)
 * @version 1.0.0
 * @license MIT
 */

export type {
  CronFieldName, CronInput, CronObject, CronOptions, CronTuple,
  ParsedCronExpression, ParsedField, ParsedFieldComponent, RunOptions,
  ScheduleController, ScheduleEvent, ScheduleOptions, SpecialAlias
} from './types';

import { CronBuilder } from './builder';
import { CronCalculator } from './calculator';
import { CronCreator } from './creator';
import { CronParser } from './parser';
import { CronScheduler } from './scheduler';

/** Export all core library classes. */
export { CronBuilder, CronCalculator, CronCreator, CronParser, CronScheduler };

const calculator = CronCalculator.getInstance();
const creator = CronCreator.getInstance();
const parser = CronParser.getInstance();
const scheduler = CronScheduler.getInstance();

/** Export shared singleton instances. */
export { calculator, creator, parser, scheduler };

/** Create cron expressions using the immutable fluent builder API. */
export const build = CronBuilder.create;

/** Convert a cron expression into an ordered CronTuple. */
export const toTuple = parser.toTuple.bind( parser );

/** Convert a cron expression into a structured CronObject. */
export const toObject = parser.toObject.bind( parser );

/** Parse and fully validate a cron expression. */
export const parse = parser.parse.bind( parser );

/** Check whether a cron expression is syntactically valid without throwing. */
export const validate = parser.validate.bind( parser );

/** Create a cron expression from an ordered field tuple. */
export const fromTuple = creator.fromTuple.bind( creator );

/** Create a cron expression from a partial cron object. Missing fields default to wildcards. */
export const fromObject = creator.fromObject.bind( creator );

/** Create a cron expression from individual field values. Missing fields default to wildcards. */
export const create = creator.create.bind( creator );

/** Calculate the next scheduled execution time(s). */
export const next = calculator.next.bind( calculator );

/** Calculate the previous scheduled execution time(s). */
export const prev = calculator.prev.bind( calculator );

/** Schedule recurring executions using a cron expression. */
export const schedule = scheduler.schedule.bind( scheduler );

/**
 * Immutable namespace exposing the complete public nxtcron API,
 * including classes, singleton instances, and convenience helpers.
 */
export const nxtcron = Object.freeze( {
  CronBuilder, CronCalculator, CronCreator, CronParser, CronScheduler,

  calculator, creator, parser, scheduler,

  build, toTuple, toObject, parse, validate, fromTuple, fromObject,
  create, next, prev, schedule
} );

/** Default export of the complete nxtcron API namespace. */
export default nxtcron;
