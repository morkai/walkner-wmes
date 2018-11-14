'use strict';

require('redbird')({
  port: 80,
  ssl: {
    port: 443,
    key: `${__dirname}/../config/production/ssl/privkey.pem`,
    cert: `${__dirname}/../config/production/ssl/cert.pem`,
    http2: true
  },
  bunyan: {
    name: 'wmes'
  },
  resolvers: [
    function(host, url, req)
    {
      if (/^\/(app|assets|files|vendor|favicon)/.test(req.url) || /^[a-z\-]+\.js$/.test(req.url))
      {
        return 'http://127.0.0.1:10081';
      }

      return 'http://127.0.0.1:10080';
    }
  ]
});
