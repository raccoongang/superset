const moment = require('moment');

function configureMoment() {
    moment.updateLocale('en', {
        calendar: {
            lastDay: 'LT[, yesterday]',
            sameDay: 'LT[, today]',
            nextDay: 'LT[, tomorrow]',
            lastWeek: 'LT[, last] dddd',
            nextWeek: 'LT dddd',
            sameElse: 'L',
        }
    });
}

module.exports = configureMoment;
