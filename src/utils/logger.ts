/**
 * Development-only logger. All methods are no-ops in production builds.
 * Usage: import { logger } from "@/utils/logger";
 *        logger.log("message", data);
 */

const isDev = import.meta.env.DEV;

const noop = (..._args: unknown[]) => {};

export const logger = {
  log: isDev ? console.log.bind(console) : noop,
  warn: isDev ? console.warn.bind(console) : noop,
  error: isDev ? console.error.bind(console) : noop,
  info: isDev ? console.info.bind(console) : noop,
};
