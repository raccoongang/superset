const express = require('express'),
  {validate} = require('express-jsonschema'),
  {reports} = require('controllers'),
  {ReportSchema} = require('../validators');

const reportsRouter = express.Router();


reportsRouter.route('/generate')
  .post(
    validate({body: ReportSchema}),
    reports.generate
  );

module.exports = {
  reportsRouter: reportsRouter
};
