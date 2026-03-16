import winston from 'winston';
import winstonDaily from 'winston-daily-rotate-file';
import dotenv from 'dotenv';
import { loggerConst } from "../common/App.const.js";

const ENV = process.env.NODE_ENV ?? "local"
dotenv.config({ path: `.env.${ENV}.local` });

//  Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

//  Setup Winston Daily Rotate File Transport
const transport = new winstonDaily({
  filename: loggerConst.LOGGER_FILE_NAME,
  datePattern: loggerConst.LOGGER_DATE_PATTERN,
  maxSize: loggerConst.LOGGER_MAX_FILE_SIZE,
  maxFiles: loggerConst.LOGGER_MAX_FILE_BACKUP,
});

console.log(transport);


//  Create Winston Logger
const logger = winston.createLogger({
  level: loggerConst.LOGGER_LEVEL,
  format: logFormat,
  transports: [
    transport,
    new winston.transports.Console({
      format: winston.format.simple(), //  Make console output readable
    }),
  ],
});

export default logger;
