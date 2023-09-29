const http = require('http'),
  express = require('express'),
  bodyParser = require('body-parser'),
  cookieParser = require('cookie-parser'),
  morgan = require('morgan'),
  config = require('./config'),
  logger = require('./lib').log(module);

const app = express(),
  PORT = process.env.PORT || config.get('port');

app.use(morgan(config.get('logger:format')));

/*
    Global middleware for parsing application/json of a http request with body.
*/
app.use(
  bodyParser.urlencoded({
      extended: false,
  }),
);

app.use(bodyParser.json());
app.use(cookieParser());

require('routes')(app);

/*
    Setup a general error handler for JsonSchemaValidation errors.
*/
app.use(function (err, req, res, next) {
    if (err.name === 'JsonSchemaValidation') {
        logger.warn(err.message);
        res.status(400);
        const responseData = {
            statusText: 'Bad Request',
            jsonSchemaValidation: true,
            validations: err.validations,
        };

        if (req.xhr || req.get('Content-Type') === 'application/json') {
            res.json(responseData);
        } else {
            res.render('badrequestTemplate', responseData);
        }
    } else {
        next(err); // pass error to next error middleware handler
    }
});

/*
    Global error interceptor
*/
app.use(function (err, req, res, next) {
    res.status(500).send({ Error: err.stack });
    logger.error(`Caught a global application error. ${err}`);
});

app.server = http.createServer(app);

app.server.listen(PORT, function () {
    logger.info(`PDF report generator server listening on port ${PORT}`);
});

// NOTE: turn off limits by default (BE CAREFUL)
// This is done to avoid the problem:
// possible EventEmitter memory leak detected.
// 11 listeners added. Use emitter.setMaxListeners() to increase limit.
// This way we speed up EventLoop.
// This is due to the fact that many requests can go to one http handler at the same time.
// Generally, this is a risky experimental operation.
// Usage in Prod mode will show the advantages and disadvantages of this method.
require('events').EventEmitter.prototype._maxListeners = 0;
process.setMaxListeners(Infinity);

module.exports = app;
