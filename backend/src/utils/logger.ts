// Simple logger utility

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

const LOG_LEVEL_MAP = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  private level: number;

  constructor(private name: string) {
    const envLevel = (process.env.LOG_LEVEL || 'info').toLowerCase();
    this.level = LOG_LEVEL_MAP[envLevel as keyof typeof LOG_LEVEL_MAP] || LOG_LEVEL_MAP.info;
  }

  private formatMessage(logLevel: LogLevel, message: string, data?: unknown): string {
    const timestamp = new Date().toISOString();
    const meta = data ? ` ${JSON.stringify(data)}` : '';
    return `[${timestamp}] [${logLevel}] [${this.name}] ${message}${meta}`;
  }

  debug(message: string, data?: unknown): void {
    if (LOG_LEVEL_MAP.debug >= this.level) {
      console.debug(this.formatMessage(LogLevel.DEBUG, message, data));
    }
  }

  info(message: string, data?: unknown): void {
    if (LOG_LEVEL_MAP.info >= this.level) {
      console.log(this.formatMessage(LogLevel.INFO, message, data));
    }
  }

  warn(message: string, data?: unknown): void {
    if (LOG_LEVEL_MAP.warn >= this.level) {
      console.warn(this.formatMessage(LogLevel.WARN, message, data));
    }
  }

  error(message: string, error?: Error | unknown): void {
    if (LOG_LEVEL_MAP.error >= this.level) {
      const errorData = error instanceof Error ? { message: error.message, stack: error.stack } : error;
      console.error(this.formatMessage(LogLevel.ERROR, message, errorData));
    }
  }
}

export const createLogger = (name: string): Logger => new Logger(name);
