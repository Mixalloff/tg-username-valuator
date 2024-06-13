import { createLogger, format, transports } from 'winston';
import { join } from 'path';

const logDir = 'logs';
const consoleTransport = new transports.Console({
  format: format.combine(
    format.colorize(),
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  )
}); 

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [
    consoleTransport,
    new transports.File({ filename: join(logDir, 'error.log'), level: 'error' }),
    new transports.File({ filename: join(logDir, 'combined.log') })
  ],
  exceptionHandlers: [
    consoleTransport,
    new transports.File({ filename: join(logDir, 'exceptions.log') }),
  ],
  rejectionHandlers: [
    consoleTransport,
    new transports.File({ filename: join(logDir, 'rejections.log') }),
  ]
});

export default logger;