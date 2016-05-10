'use strict';

const url = require('url');

const uri = url.parse(process.env.WMES_MONGODB_URI || 'mongodb://127.0.0.1:27017/walkner-wmes');

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
  keepAliveQueryInterval: 15000,
  server: {
    poolSize: 15,
    reconnectTries: Number.MAX_SAFE_INTEGER,
    reconnectInterval: 1000,
    socketOptions: {
      autoReconnect: true,
      keepAlive: 1000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 0
    }
  },
  db: {
    w: 1,
    wtimeout: 5000,
    nativeParser: true,
    forceServerObjectId: false
  }
};
