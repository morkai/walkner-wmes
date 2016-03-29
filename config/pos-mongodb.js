'use strict';

module.exports = {
  uri: process.env.WMES_MONGODB_URI || 'mongodb://127.0.0.1:27017/walkner-wmes-pos',
  user: process.env.POS_MONGODB_USER || '',
  pass: process.env.POS_MONGODB_PASS || '',
  server: {
    poolSize: 5
  },
  db: {
    w: 1,
    wtimeout: 1000,
    nativeParser: true,
    forceServerObjectId: false
  }
};
