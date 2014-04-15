// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function setupDiagLogEntryModel(app, mongoose)
{
  var diagLogEntry = mongoose.Schema({
    type: {
      type: 'String',
      required: true
    },
    data: {},
    prodLine: {
      type: String,
      ref: 'ProdLine',
      default: null
    },
    creator: {},
    createdAt: {
      type: Date,
      default: null
    },
    savedAt: {
      type: Date,
      required: true
    }
  }, {
    id: false,
    versionKey: false
  });

  diagLogEntry.index({savedAt: -1});
  diagLogEntry.index({type: 1, savedAt: -1});
  diagLogEntry.index({prodLine: 1, savedAt: -1});

  mongoose.model('DiagLogEntry', diagLogEntry);
};
