// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function setupDacLogEntryModel(app, mongoose)
{
  var dacLogEntrySchema = mongoose.Schema({
    _id: {
      type: String,
      required: true,
      unique: true
    },
    nodeId: {
      type: String,
      required: true
    },
    cardId: {
      type: String,
      required: true
    },
    scannedAt: {
      type: Date,
      required: true
    },
    sentAt: {
      type: Date,
      required: true
    },
    receivedAt: {
      type: Date,
      required: true
    }
  }, {
    id: false
  });

  dacLogEntrySchema.statics.TOPIC_PREFIX = 'dacLogEntries';

  dacLogEntrySchema.statics.importData = function(req, done)
  {
    if (req == null || typeof req !== 'object'
      || typeof req.nodeId !== 'string' || !req.nodeId.length
      || typeof req.time !== 'number' || req.time < 0
      || typeof req.data !== 'string' || !req.data.length)
    {
      return done(new Error('INVALID_REQUEST_DATA'));
    }

    var receivedAt = new Date();
    var dacLogEntries = [];

    req.data.trim().split('\n').forEach(function(line)
    {
      var columns = line.split(';');

      var dacLogEntry = {
        _id: columns[0],
        nodeId: req.nodeId,
        cardId: columns[1],
        scannedAt: new Date(columns[2]),
        sentAt: new Date(req.time),
        receivedAt: receivedAt
      };

      if (dacLogEntry._id.length === 32
        && dacLogEntry.cardId.length
        && !isNaN(dacLogEntry.scannedAt.getTime()))
      {
        dacLogEntries.push(dacLogEntry);
      }
    });

    this.collection.insert(dacLogEntries, {continueOnError: true}, done);
  };

  mongoose.model('DacLogEntry', dacLogEntrySchema);
};
