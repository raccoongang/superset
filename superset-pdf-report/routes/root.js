const config = require('config');

const PORT = process.env.PORT || config.get('port');

exports.get = function(req, res) {
  res.send(`index. Port: ${PORT}`);
};
