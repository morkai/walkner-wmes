'use strict';

module.exports = {
  uri: 'mongodb://127.0.0.1:27017/walkner-wmes-pos',
  server: {
    native_parser: true
  },
  db: {
    w: 1,
    wtimeout: 1000
  }
};
