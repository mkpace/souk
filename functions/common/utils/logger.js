import winston from 'winston';

const {
  colorize,
  combine,
  timestamp,
  printf,
} = winston.format;

winston.addColors({
  debug: 'green',
  info: 'cyan',
  silly: 'purple',
  trace: 'magenta',
  verbose: 'magenta',
  warn: 'yellow',
  warning: 'yellow',
  error: 'red',
});

const logger = winston.createLogger({
  format: combine(
    colorize(),
    timestamp(),
    printf(info => `${info.timestamp} [${info.level}] : ${JSON.stringify(info.message)}`),
  ),
  transports: [
    new winston.transports.Console(),
  ],
  exitOnError: false,
});

export default logger;
