'use strict';

const url = require('url');

const uri = url.parse(process.env.WMES_MONGODB_URI || 'mongodb://hello:pass@127.0.0.1:27017/walkner-wmes');

if (process.env.WMES_MONGODB_USER)
{
  uri.auth = process.env.WMES_MONGODB_USER;

  if (process.env.WMES_MONGODB_PASS)
  {
    uri.auth += ':' + process.env.WMES_MONGODB_PASS;
  }
}

module.exports = {
  uri: url.format(uri),
  server: {
    poolSize: 15
  },
  db: {
    w: 1,
    wtimeout: 1000,
    nativeParser: true,
    forceServerObjectId: false
  }
};
