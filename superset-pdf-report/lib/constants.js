const config = require('config'),
    PAGE_WAIT_TIMEOUT = 120000,
    TMP_GEN_DIR = config.get('tmpGenDir') || '/var/tmp/generated_reports';

module.exports = {
    PAGE_WAIT_TIMEOUT: PAGE_WAIT_TIMEOUT,
    TMP_GEN_DIR: TMP_GEN_DIR,
};
