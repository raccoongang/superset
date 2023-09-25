module.exports = function (app) {
    app.get('/', require('./root').get);
    app.use('/health', require('./healthcheck').healthcheckRouter);
    app.use('/api/v1/reports', require('./reports').reportsRouter);
};
