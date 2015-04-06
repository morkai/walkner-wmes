'use strict';

module.exports = {
  uri: 'mongodb://127.0.0.1:27017/walkner-wmes',
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
