'use strict';

module.exports = {
  uri: process.env.WMES_MONGODB_URI || 'mongodb://127.0.0.1:27017/walkner-wmes-pos',
  keepAliveQueryInterval: 15000,
  mongoClient: {
    poolSize: 5,
    noDelay: true,
    keepAlive: 1000,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 0,
    forceServerObjectId: false,
    w: 1,
    wtimeout: 5000,
    promiseLibrary: global.Promise,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    autoIndex: process.env.NODE_ENV !== 'production'
  }
};

if (process.env.WMES_MONGODB_REPLICA_SET)
{
  module.exports.mongoClient.replicaSet = process.env.WMES_MONGODB_REPLICA_SET;
}
