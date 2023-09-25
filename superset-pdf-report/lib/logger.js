const winston = require('winston');

require('winston-syslog').Syslog;
require('winston-daily-rotate-file');

const ENV = process.env.NODE_ENV;

const getLogger = function (module) {
  const path = module.filename.split('/').slice(-2).join('/');

  if (ENV === 'development') {
    return new winston.createLogger({
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.printf(info => JSON.stringify({
          timestamp: info.timestamp,
          level: info.level.toUpperCase(),
          message: info.message
        }))
      ),
      transports: [
        new winston.transports.Console({
          colorize: true,
          level: 'debug',
          label: path,
        }),
        new winston.transports.Syslog({
          level: 'warning',
          label: path,
        }),
      ],
    });
  }
  return winston.createLogger({
    format: winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      winston.format.printf(info => JSON.stringify({
        timestamp: info.timestamp,
        level: info.level.toUpperCase(),
        message: info.message
      }))
    ),
    transports: [
      new winston.transports.File({filename: '/var/log/pdf_report_generator/error.log', level: 'error'}),
      new winston.transports.DailyRotateFile({
        filename: '/var/log/pdf_report_generator/info-%DATE%.log',
        level: 'info',
        zippedArchive: true,
        datePattern: 'YYYY-MM-DD-HH',
        maxSize: '20mb',
        maxFiles: '20d'
      })
    ],
  });
};

module.exports = getLogger;
