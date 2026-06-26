/**
 * nxtcron
 * A lightweight, zero-dependency cron expression parser and scheduler.
 * 
 * @author Paul Köhler (komed3)
 * @version 1.0.0
 * @license MIT
 */

export type {
  CronFieldName, CronObject, CronOptions, CronTuple, RunOptions,
  ScheduleController, ScheduleEvent, ScheduleOptions, SpecialAlias
} from './types';

import { CronBuilder } from './builder';
import { CronCalculator } from './calculator';
import { CronCreator } from './creator';
import { CronParser } from './parser';
import { CronScheduler } from './scheduler';

/** Export classes. */
export { CronBuilder, CronCalculator, CronCreator, CronParser, CronScheduler };

const calculator = CronCalculator.getInstance();
const creator = CronCreator.getInstance();
const parser = CronParser.getInstance();
const scheduler = CronScheduler.getInstance();

/** Create a cron expression using a immutable fluent builder. */
export const build = CronBuilder.create;

/** Convert a cron expression into a ordered CronTuple. */
export const toTuple = parser.toTuple.bind( parser );

/** Convert a cron expression into a structured CronObject. */
export const toObject = parser.toObject.bind( parser );

/** Parse a cron expression into a fully validated internal representation. */
export const parse = parser.parse.bind( parser );

/** Validate a cron expression without throwing. Returns true or false. */
export const validate = parser.validate.bind( parser );

/** Create a cron expression string from a cron field tuple. */
export const fromTuple = creator.fromTuple.bind( creator );

/** Create a cron expression string from a partial options object. Omitted fields default to wildcard. */
export const fromObject = creator.fromObject.bind( creator );

/** Create a cron expression string from individual field values. Omitted fields default to wildcard. */
export const create = creator.create.bind( creator );

/** Get next scheduled run(s) after a reference date. */
export const next = calculator.next.bind( calculator );

/** Get previous scheduled run(s) before a reference date. */
export const prev = calculator.prev.bind( calculator );

/** Schedule a callback to run on the given cron schedule. Returns a controller with stop(), on(), off(). */
export const schedule = scheduler.schedule.bind( scheduler );

/** Export the nxtcron object containing all instances and methods. */
export const nxtcron = {
  calculator, creator, parser, scheduler, build, toTuple, toObject, parse,
  validate, fromTuple, fromObject, create, next, prev, schedule
}

/** Default export the nxtcron object. */
export default nxtcron;
