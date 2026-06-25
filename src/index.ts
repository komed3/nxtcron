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

export { CronCalculator, CronCreator, CronParser };

const calculator = new CronCalculator();
const creator = new CronCreator();
const parser = new CronParser();

/** Parse a cron expression string into a structured object. */
export const parse = parser.parse.bind( parser );

/** Validate a cron expression without throwing. Returns true or false. */
export const validate = parser.validate.bind( parser );

/** Create a cron expression string from a partial options object. Omitted fields default to wildcard. */
export const fromObject = creator.fromObject.bind( creator );
