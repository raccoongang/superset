const healthcheck = require('express-healthcheck')({
    healthy: function () {
        return {result: 'ok'};
    },
});

module.exports = healthcheck;
