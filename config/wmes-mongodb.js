'use strict';

module.exports = {
  uri: process.envWMES_MONGODB_URI || 'mongodb://127.0.0.1:27017/walkner-wmes',
  user: process.env.WMES_MONGODB_USER || '',
  pass: process.env.WMES_MONGODB_PASS || '',
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
