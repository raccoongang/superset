const log = require('lib').log(module),
  { PDFGenerationError } = require('lib').errors,
  { ReportPdfView } = require('usecases').reports;

const generate = async function (req, res, next) {
  let output, reportPdfView;
  const data = req.body;
  log.info({
    event: 'Request to generate pdf report',
    location: data.location,
  });

  log.info(`Cookies: ${req.cookies['session']}`);
  const sourseURL = new URL(data.location);
  const session = {
    name: 'session',
    value: req.cookies['session'],
    domain: sourseURL.hostname,
  };
  reportPdfView = new ReportPdfView(data.location, data.landscape, session);

  try {
    output = await reportPdfView.execute();
  } catch (e) {
    if (e instanceof PDFGenerationError) {
      return res.status(400).send({
        statusText:
          'PDF generation error. Make sure that location and session are correct.',
      });
    }
    const errMsg = 'Got unexpected error during report generation.';
    log.error({
      event: errMsg,
      exc: e.message,
    });
    return res.status(500).send({
      statusText: errMsg,
    });
  }
  log.info({
    event: 'Report generated',
  });

  return res.status(201).send(output);
};

module.exports = generate;
