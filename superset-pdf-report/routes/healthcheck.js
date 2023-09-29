const express = require('express'),
    healthcheckRouter = express.Router(),
    {healthcheck} = require('controllers');

healthcheckRouter.route('/')
    .get(healthcheck);

module.exports = {
    healthcheckRouter: healthcheckRouter,
};
