const nconf = require('nconf'),
    {join} = require('path'),
    dotenv = require('dotenv');

nconf.argv()
    .env()
    .file(join(__dirname, 'base.json'))
    .file(nconf.get('NODE_ENV'), join(__dirname, nconf.get('NODE_ENV') + '.json'));

dotenv.config({path: '/.env'});

nconf.set('registryPortalURL', process.env.CERTIFICATE_FETCH_URL);

module.exports = nconf;
