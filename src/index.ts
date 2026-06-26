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

import { CronCalculator } from './calculator';
import { CronCreator } from './creator';
import { CronParser } from './parser';

/** Export classes. */
export { CronCalculator, CronCreator, CronParser };

const calculator = CronCalculator.getInstance();
const creator = CronCreator.getInstance();
const parser = CronParser.getInstance();

/** Convert a cron expression into a structured CronObject. */
export const toObject = parser.toObject.bind( parser );

/** Parse a cron expression into a fully validated internal representation. */
export const parse = parser.parse.bind( parser );

/** Validate a cron expression without throwing. Returns true or false. */
export const validate = parser.validate.bind( parser );

/** Create a cron expression string from a partial options object. Omitted fields default to wildcard. */
export const fromObject = creator.fromObject.bind( creator );

/** Create a cron expression string from a cron field tuple. */
export const fromTuple = creator.fromTuple.bind( creator );

/** Create a cron expression string from individual field values. Omitted fields default to wildcard. */
export const create = creator.create.bind( creator );

/** Get next scheduled run(s) after a reference date. */
export const next = calculator.next.bind( calculator );

/** Get previous scheduled run(s) before a reference date. */
export const prev = calculator.prev.bind( calculator );

/** Export the nxtcron object containing all instances and methods. */
export const nxtcron = {
  calculator, creator, parser,
  toObject, parse, validate,
  fromObject, fromTuple, create,
  next, prev
}

/** Default export the nxtcron object. */
export default nxtcron;
