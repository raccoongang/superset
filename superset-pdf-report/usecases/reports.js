const puppeteer = require('puppeteer'),
  log = require('../lib/logger')(module),
  { BasePdfView } = require('./base'),
  { convertHtmlToPng } = require('../lib/utils'),
  { PAGE_WAIT_TIMEOUT } = require('../lib/constants'),
  { PDFGenerationError } = require('../lib/errors');

class ReportPdfView extends BasePdfView {
  /*
     Usecase manages pdf generation by URL and user session's cookies.
 */

  constructor(location, landscape, session) {
    super(location, session);
    this.landscape = landscape;
  }

  get pageOptions() {
    return {
      format: 'A4',
      landscape: this.landscape,
      printBackground: true,
      margin: {
        top: 80,
        bottom: 80,
        left: 30,
        right: 30,
      },
    };
  }

  get renderedURL() {
    return this.location;
  }

  getPageSize() {
    if (this.landscape) {
      return {
        width: 1280,
        height: 1024,
      };
    }
    return {
      width: 1024,
      height: 1280,
    };
  }

  async generate() {
    /*
    Dynamic creation of pdf files according to the received URL path.
    PDF creation will take place in a virtual browser using the `puppeteer` tool.
    */
    const pageSize = this.getPageSize();
    const browser = await puppeteer.launch({
      headless: true,
      isLandscape: this.landscape,
      args: [
        '--single-process',
        '--no-zygote',
        '--disable-gpu',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
      ],
    });

    const page = await browser.newPage();
    await page.setViewport({
      width: pageSize.width,
      height: pageSize.height,
      deviceScaleFactor: 1,
      isLandscape: this.landscape,
    });
    await page.setCookie(this.session);
    await page.goto(this.renderedURL, {
      timeout: PAGE_WAIT_TIMEOUT,
      waitUntil: ['load', 'domcontentloaded', 'networkidle0', 'networkidle2'],
    });
    await page.exposeFunction('convertHtmlToPng', convertHtmlToPng);

    await page.evaluate(async () => {
      function replaceElementByImage(element, url) {
        const properties = ['width', 'height', 'position', 'left', 'top'];
        const image = document.createElement('img');

        image.src = url;
        image.className = element.className;
        properties.forEach((key) => (image.style[key] = element.style[key]));

        element.parentNode.insertBefore(image, element);
        element.parentNode.removeChild(element);
      }

      async function vectorToImage(element, content) {
        const dataUrl = await convertHtmlToPng(content);
        replaceElementByImage(element, dataUrl);
      }

      function canvasToImage(element) {
        const dataUrl = element.toDataURL();
        replaceElementByImage(element, dataUrl);
      }

      const chartElements = document.querySelectorAll('.dashboard-chart');

      for (var i = 0; i < chartElements.length; i++) {
        const canvasObj = chartElements[i].querySelector('canvas');
        const vectorObj = chartElements[i].querySelector('svg');
        if (canvasObj) {
          canvasToImage(canvasObj);
        }
        if (vectorObj) {
          await vectorToImage(vectorObj, vectorObj.outerHTML);
        }
      }
    });

    const document_ = await page.pdf(this.pageOptions);
    await browser.close();
    await browser.disconnect();

    return document_;
  }

  async execute() {
    let result;
    try {
      result = await this.generate();
      log.info(`PDF report for location ${this.location} is generated.`);
    } catch (e) {
      const msg = `Generating pdf report for file ${this.location} failed. Error: ${e}.`;
      log.error(msg);
      throw new PDFGenerationError(msg);
    }

    return result;
  }
}

module.exports = {
  ReportPdfView: ReportPdfView,
};
