'use strict';

module.exports = {
  uri: process.env.WMES_MONGODB_URI || 'mongodb://127.0.0.1:27017/walkner-wmes',
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
  },
  replSet: {
    reconnectWait: 1000,
    retries: Number.MAX_SAFE_INTEGER,
    autoReconnect: false,
    poolSize: 15,
    replicaSet: 'plp',
    socketOptions: {
      noDelay: true,
      keepAlive: 1000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 0
    }
  },
  promiseLibrary: global.Promise
};
