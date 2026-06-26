/**
 * ntxcron
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

const calculator = new CronCalculator();
const creator = new CronCreator();
const parser = new CronParser();

/** Convert a cron expression into a structured CronObject. */
export const toObject = parser.toObject.bind( parser );

/** Parse a cron expression into a fully validated internal representation. */
export const parse = parser.parse.bind( parser );

/** Validate a cron expression without throwing. Returns true or false. */
export const validate = parser.validate.bind( parser );

/** Create a cron expression string from a partial options object. Omitted fields default to wildcard. */
export const fromObject = creator.fromObject.bind( creator );

export default ( {
  calculator, creator, parser,
  toObject, parse, validate, fromObject
} ) as const;
